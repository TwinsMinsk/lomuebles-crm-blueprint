-- Create ENUM types for Virtual Warehouse module

-- Material categories enum
CREATE TYPE public.material_category AS ENUM (
  'Древесина',
  'Металлы',
  'Фурнитура',
  'Крепеж',
  'Клеи и герметики',
  'Лакокрасочные материалы',
  'Ткани и обивка',
  'Стекло и зеркала',
  'Инструменты',
  'Расходные материалы',
  'Прочие'
);

-- Material units enum
CREATE TYPE public.material_unit AS ENUM (
  'шт',
  'м',
  'м²',
  'м³',
  'кг',
  'л',
  'упак',
  'комплект',
  'рулон',
  'лист'
);

-- Stock movement types enum
CREATE TYPE public.stock_movement_type AS ENUM (
  'Поступление',
  'Расход',
  'Перемещение',
  'Инвентаризация',
  'Списание',
  'Возврат'
);

-- Stock status enum
CREATE TYPE public.stock_status AS ENUM (
  'В наличии',
  'Заканчивается',
  'Нет в наличии',
  'Заказано у поставщика'
);

-- Create materials table
CREATE TABLE public.materials (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category public.material_category NOT NULL,
  unit public.material_unit NOT NULL,
  sku TEXT UNIQUE,
  barcode TEXT,
  min_stock_level NUMERIC(10,2) DEFAULT 0,
  max_stock_level NUMERIC(10,2),
  current_cost NUMERIC(10,2),
  average_cost NUMERIC(10,2),
  supplier_id INTEGER REFERENCES public.suppliers(supplier_id),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  creator_user_id UUID NOT NULL REFERENCES auth.users(id)
);

-- Create stock_levels table
CREATE TABLE public.stock_levels (
  id SERIAL PRIMARY KEY,
  material_id INTEGER NOT NULL REFERENCES public.materials(id) ON DELETE CASCADE,
  current_quantity NUMERIC(10,2) NOT NULL DEFAULT 0,
  reserved_quantity NUMERIC(10,2) NOT NULL DEFAULT 0,
  available_quantity NUMERIC(10,2) GENERATED ALWAYS AS (current_quantity - reserved_quantity) STORED,
  last_movement_date TIMESTAMPTZ,
  status public.stock_status NOT NULL DEFAULT 'В наличии',
  location TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(material_id)
);

-- Create stock_movements table  
CREATE TABLE public.stock_movements (
  id SERIAL PRIMARY KEY,
  material_id INTEGER NOT NULL REFERENCES public.materials(id) ON DELETE CASCADE,
  movement_type public.stock_movement_type NOT NULL,
  quantity NUMERIC(10,2) NOT NULL,
  unit_cost NUMERIC(10,2),
  total_cost NUMERIC(10,2) GENERATED ALWAYS AS (quantity * COALESCE(unit_cost, 0)) STORED,
  reference_document TEXT,
  notes TEXT,
  supplier_id INTEGER REFERENCES public.suppliers(supplier_id),
  order_id INTEGER REFERENCES public.orders(id),
  movement_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create suppliers_materials junction table
CREATE TABLE public.suppliers_materials (
  id SERIAL PRIMARY KEY,
  supplier_id INTEGER NOT NULL REFERENCES public.suppliers(supplier_id) ON DELETE CASCADE,
  material_id INTEGER NOT NULL REFERENCES public.materials(id) ON DELETE CASCADE,
  supplier_sku TEXT,
  supplier_price NUMERIC(10,2),
  minimum_order_quantity NUMERIC(10,2),
  lead_time_days INTEGER,
  is_preferred BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(supplier_id, material_id)
);

-- Enable RLS on all tables
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers_materials ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for materials table
CREATE POLICY "Admins can view all materials" 
ON public.materials 
FOR SELECT 
USING (get_current_user_role() = ANY (ARRAY['Главный Администратор'::text, 'Администратор'::text]));

CREATE POLICY "Admins can insert materials" 
ON public.materials 
FOR INSERT 
WITH CHECK (get_current_user_role() = ANY (ARRAY['Главный Администратор'::text, 'Администратор'::text]));

CREATE POLICY "Admins can update materials" 
ON public.materials 
FOR UPDATE 
USING (get_current_user_role() = ANY (ARRAY['Главный Администратор'::text, 'Администратор'::text]));

CREATE POLICY "Admins can delete materials" 
ON public.materials 
FOR DELETE 
USING (get_current_user_role() = ANY (ARRAY['Главный Администратор'::text, 'Администратор'::text]));

-- Create RLS policies for stock_levels table
CREATE POLICY "Admins can view all stock levels" 
ON public.stock_levels 
FOR SELECT 
USING (get_current_user_role() = ANY (ARRAY['Главный Администратор'::text, 'Администратор'::text]));

CREATE POLICY "Admins can insert stock levels" 
ON public.stock_levels 
FOR INSERT 
WITH CHECK (get_current_user_role() = ANY (ARRAY['Главный Администратор'::text, 'Администратор'::text]));

CREATE POLICY "Admins can update stock levels" 
ON public.stock_levels 
FOR UPDATE 
USING (get_current_user_role() = ANY (ARRAY['Главный Администратор'::text, 'Администратор'::text]));

CREATE POLICY "Admins can delete stock levels" 
ON public.stock_levels 
FOR DELETE 
USING (get_current_user_role() = ANY (ARRAY['Главный Администратор'::text, 'Администратор'::text]));

-- Create RLS policies for stock_movements table
CREATE POLICY "Admins can view all stock movements" 
ON public.stock_movements 
FOR SELECT 
USING (get_current_user_role() = ANY (ARRAY['Главный Администратор'::text, 'Администратор'::text]));

CREATE POLICY "Admins can insert stock movements" 
ON public.stock_movements 
FOR INSERT 
WITH CHECK (get_current_user_role() = ANY (ARRAY['Главный Администратор'::text, 'Администратор'::text]));

CREATE POLICY "Admins can update stock movements" 
ON public.stock_movements 
FOR UPDATE 
USING (get_current_user_role() = ANY (ARRAY['Главный Администратор'::text, 'Администратор'::text]));

CREATE POLICY "Admins can delete stock movements" 
ON public.stock_movements 
FOR DELETE 
USING (get_current_user_role() = ANY (ARRAY['Главный Администратор'::text, 'Администратор'::text]));

-- Create RLS policies for suppliers_materials table
CREATE POLICY "Admins can view all suppliers materials" 
ON public.suppliers_materials 
FOR SELECT 
USING (get_current_user_role() = ANY (ARRAY['Главный Администратор'::text, 'Администратор'::text]));

CREATE POLICY "Admins can insert suppliers materials" 
ON public.suppliers_materials 
FOR INSERT 
WITH CHECK (get_current_user_role() = ANY (ARRAY['Главный Администратор'::text, 'Администратор'::text]));

CREATE POLICY "Admins can update suppliers materials" 
ON public.suppliers_materials 
FOR UPDATE 
USING (get_current_user_role() = ANY (ARRAY['Главный Администратор'::text, 'Администратор'::text]));

CREATE POLICY "Admins can delete suppliers materials" 
ON public.suppliers_materials 
FOR DELETE 
USING (get_current_user_role() = ANY (ARRAY['Главный Администратор'::text, 'Администратор'::text]));

-- Create trigger functions for automatic timestamps
CREATE OR REPLACE FUNCTION public.update_materials_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.update_stock_levels_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.update_suppliers_materials_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamps
CREATE TRIGGER update_materials_updated_at
    BEFORE UPDATE ON public.materials
    FOR EACH ROW
    EXECUTE FUNCTION public.update_materials_updated_at();

CREATE TRIGGER update_stock_levels_updated_at
    BEFORE UPDATE ON public.stock_levels
    FOR EACH ROW
    EXECUTE FUNCTION public.update_stock_levels_updated_at();

CREATE TRIGGER update_suppliers_materials_updated_at
    BEFORE UPDATE ON public.suppliers_materials
    FOR EACH ROW
    EXECUTE FUNCTION public.update_suppliers_materials_updated_at();

-- Create function to automatically update stock levels when movements are added
CREATE OR REPLACE FUNCTION public.update_stock_level_on_movement()
RETURNS TRIGGER AS $$
DECLARE
  movement_multiplier INTEGER;
BEGIN
  -- Determine if this is an increase or decrease
  CASE NEW.movement_type
    WHEN 'Поступление' THEN movement_multiplier := 1;
    WHEN 'Возврат' THEN movement_multiplier := 1;
    WHEN 'Расход' THEN movement_multiplier := -1;
    WHEN 'Списание' THEN movement_multiplier := -1;
    WHEN 'Инвентаризация' THEN movement_multiplier := 0; -- Handle separately
    WHEN 'Перемещение' THEN movement_multiplier := 0; -- Handle separately if needed
    ELSE movement_multiplier := 0;
  END CASE;

  -- Update or create stock level record
  INSERT INTO public.stock_levels (material_id, current_quantity, last_movement_date)
  VALUES (NEW.material_id, NEW.quantity * movement_multiplier, NEW.movement_date)
  ON CONFLICT (material_id) DO UPDATE SET
    current_quantity = stock_levels.current_quantity + (NEW.quantity * movement_multiplier),
    last_movement_date = NEW.movement_date,
    updated_at = now();

  -- Update stock status based on new quantity and min/max levels
  UPDATE public.stock_levels 
  SET status = CASE
    WHEN current_quantity <= 0 THEN 'Нет в наличии'::public.stock_status
    WHEN current_quantity <= (SELECT min_stock_level FROM public.materials WHERE id = NEW.material_id) THEN 'Заканчивается'::public.stock_status
    ELSE 'В наличии'::public.stock_status
  END
  WHERE material_id = NEW.material_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic stock level updates
CREATE TRIGGER update_stock_level_on_movement
    AFTER INSERT ON public.stock_movements
    FOR EACH ROW
    EXECUTE FUNCTION public.update_stock_level_on_movement();

-- Create indexes for better performance
CREATE INDEX idx_materials_category ON public.materials(category);
CREATE INDEX idx_materials_supplier ON public.materials(supplier_id);
CREATE INDEX idx_materials_sku ON public.materials(sku);
CREATE INDEX idx_stock_levels_material ON public.stock_levels(material_id);
CREATE INDEX idx_stock_levels_status ON public.stock_levels(status);
CREATE INDEX idx_stock_movements_material ON public.stock_movements(material_id);
CREATE INDEX idx_stock_movements_date ON public.stock_movements(movement_date);
CREATE INDEX idx_stock_movements_type ON public.stock_movements(movement_type);
CREATE INDEX idx_suppliers_materials_supplier ON public.suppliers_materials(supplier_id);
CREATE INDEX idx_suppliers_materials_material ON public.suppliers_materials(material_id);