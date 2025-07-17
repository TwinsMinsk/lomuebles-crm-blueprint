-- Create estimates table
CREATE TABLE public.estimates (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'черновик' CHECK (status IN ('черновик', 'утверждена', 'отменена')),
  name TEXT,
  total_cost NUMERIC,
  creator_user_id UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create estimate_items table
CREATE TABLE public.estimate_items (
  id SERIAL PRIMARY KEY,
  estimate_id INTEGER NOT NULL REFERENCES public.estimates(id) ON DELETE CASCADE,
  material_id INTEGER NOT NULL REFERENCES public.materials(id),
  quantity_needed NUMERIC NOT NULL CHECK (quantity_needed > 0),
  price_at_estimation NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(estimate_id, material_id) -- Prevent duplicate materials in same estimate
);

-- Create material_reservations table
CREATE TABLE public.material_reservations (
  id SERIAL PRIMARY KEY,
  material_id INTEGER NOT NULL REFERENCES public.materials(id),
  order_id INTEGER NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  quantity_reserved NUMERIC NOT NULL CHECK (quantity_reserved > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(material_id, order_id) -- One reservation per material per order
);

-- Add reserved_quantity column to stock_levels table
ALTER TABLE public.stock_levels 
ADD COLUMN reserved_quantity NUMERIC NOT NULL DEFAULT 0 CHECK (reserved_quantity >= 0);

-- Update available_quantity calculation in stock_levels
-- This will be a computed column showing actual available stock
CREATE OR REPLACE FUNCTION public.calculate_available_quantity() 
RETURNS TRIGGER AS $$
BEGIN
  NEW.available_quantity = NEW.current_quantity - NEW.reserved_quantity;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-calculate available_quantity
CREATE TRIGGER update_available_quantity_trigger
  BEFORE INSERT OR UPDATE ON public.stock_levels
  FOR EACH ROW
  EXECUTE FUNCTION public.calculate_available_quantity();

-- Create function to update reserved_quantity when reservations change
CREATE OR REPLACE FUNCTION public.update_reserved_quantity()
RETURNS TRIGGER AS $$
DECLARE
  material_id_val INTEGER;
BEGIN
  -- Determine which material_id to update
  IF TG_OP = 'DELETE' THEN
    material_id_val := OLD.material_id;
  ELSE
    material_id_val := NEW.material_id;
  END IF;

  -- Update reserved_quantity in stock_levels
  UPDATE public.stock_levels 
  SET 
    reserved_quantity = COALESCE((
      SELECT SUM(quantity_reserved) 
      FROM public.material_reservations 
      WHERE material_id = material_id_val
    ), 0),
    updated_at = now()
  WHERE material_id = material_id_val;

  -- Update stock status based on new available quantity
  UPDATE public.stock_levels 
  SET status = CASE
    WHEN (current_quantity - reserved_quantity) <= 0 THEN 'Нет в наличии'::public.stock_status
    WHEN (current_quantity - reserved_quantity) <= (
      SELECT COALESCE(min_stock_level, 0) 
      FROM public.materials 
      WHERE id = material_id_val
    ) THEN 'Заканчивается'::public.stock_status
    ELSE 'В наличии'::public.stock_status
  END
  WHERE material_id = material_id_val;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for material_reservations changes
CREATE TRIGGER update_reserved_quantity_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.material_reservations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_reserved_quantity();

-- Create function to update estimate total_cost when items change
CREATE OR REPLACE FUNCTION public.update_estimate_total_cost()
RETURNS TRIGGER AS $$
DECLARE
  estimate_id_val INTEGER;
BEGIN
  -- Determine which estimate to update
  IF TG_OP = 'DELETE' THEN
    estimate_id_val := OLD.estimate_id;
  ELSE
    estimate_id_val := NEW.estimate_id;
  END IF;

  -- Update total_cost in estimates
  UPDATE public.estimates 
  SET 
    total_cost = COALESCE((
      SELECT SUM(ei.quantity_needed * COALESCE(ei.price_at_estimation, m.current_cost, 0))
      FROM public.estimate_items ei
      JOIN public.materials m ON ei.material_id = m.id
      WHERE ei.estimate_id = estimate_id_val
    ), 0),
    updated_at = now()
  WHERE id = estimate_id_val;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for estimate_items changes
CREATE TRIGGER update_estimate_total_cost_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.estimate_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_estimate_total_cost();

-- Create updated_at triggers for new tables
CREATE OR REPLACE FUNCTION public.update_estimates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.update_estimate_items_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.update_material_reservations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_estimates_updated_at_trigger
  BEFORE UPDATE ON public.estimates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_estimates_updated_at();

CREATE TRIGGER update_estimate_items_updated_at_trigger
  BEFORE UPDATE ON public.estimate_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_estimate_items_updated_at();

CREATE TRIGGER update_material_reservations_updated_at_trigger
  BEFORE UPDATE ON public.material_reservations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_material_reservations_updated_at();

-- Enable RLS on new tables
ALTER TABLE public.estimates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.estimate_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.material_reservations ENABLE ROW LEVEL SECURITY;

-- RLS policies for estimates table
CREATE POLICY "Admins can manage all estimates"
  ON public.estimates FOR ALL
  USING (get_current_user_role() = ANY (ARRAY['Главный Администратор'::text, 'Администратор'::text]));

CREATE POLICY "Managers can manage estimates for their orders"
  ON public.estimates FOR ALL
  USING (
    get_current_user_role() = 'Менеджер'::text AND
    EXISTS (
      SELECT 1 FROM public.orders o 
      WHERE o.id = estimates.order_id 
      AND (o.assigned_user_id = auth.uid() OR o.creator_user_id = auth.uid())
    )
  );

CREATE POLICY "Users can view estimates for assigned orders"
  ON public.estimates FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders o 
      WHERE o.id = estimates.order_id 
      AND o.assigned_user_id = auth.uid()
    )
  );

-- RLS policies for estimate_items table  
CREATE POLICY "Admins can manage all estimate items"
  ON public.estimate_items FOR ALL
  USING (get_current_user_role() = ANY (ARRAY['Главный Администратор'::text, 'Администратор'::text]));

CREATE POLICY "Managers can manage estimate items for their estimates"
  ON public.estimate_items FOR ALL
  USING (
    get_current_user_role() = 'Менеджер'::text AND
    EXISTS (
      SELECT 1 FROM public.estimates e
      JOIN public.orders o ON e.order_id = o.id
      WHERE e.id = estimate_items.estimate_id 
      AND (o.assigned_user_id = auth.uid() OR o.creator_user_id = auth.uid())
    )
  );

CREATE POLICY "Users can view estimate items for assigned orders"
  ON public.estimate_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.estimates e
      JOIN public.orders o ON e.order_id = o.id
      WHERE e.id = estimate_items.estimate_id 
      AND o.assigned_user_id = auth.uid()
    )
  );

-- RLS policies for material_reservations table
CREATE POLICY "Admins can manage all material reservations"
  ON public.material_reservations FOR ALL
  USING (get_current_user_role() = ANY (ARRAY['Главный Администратор'::text, 'Администратор'::text]));

CREATE POLICY "Managers can manage reservations for their orders"
  ON public.material_reservations FOR ALL
  USING (
    get_current_user_role() = 'Менеджер'::text AND
    EXISTS (
      SELECT 1 FROM public.orders o 
      WHERE o.id = material_reservations.order_id 
      AND (o.assigned_user_id = auth.uid() OR o.creator_user_id = auth.uid())
    )
  );

CREATE POLICY "Users can view reservations for assigned orders"
  ON public.material_reservations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders o 
      WHERE o.id = material_reservations.order_id 
      AND o.assigned_user_id = auth.uid()
    )
  );