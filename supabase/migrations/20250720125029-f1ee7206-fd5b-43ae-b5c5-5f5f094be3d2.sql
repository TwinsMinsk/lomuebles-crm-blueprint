
-- Create a view that combines materials with their stock levels
-- This view will help bypass RLS issues and simplify the query
CREATE OR REPLACE VIEW public.materials_with_stock AS
SELECT 
  m.*,
  sl.id as stock_level_id,
  sl.current_quantity,
  sl.reserved_quantity,
  sl.available_quantity,
  sl.status as stock_status,
  sl.location,
  sl.notes as stock_notes,
  sl.last_movement_date,
  s.supplier_name
FROM public.materials m
LEFT JOIN public.stock_levels sl ON m.id = sl.material_id
LEFT JOIN public.suppliers s ON m.supplier_id = s.supplier_id;

-- Grant access to the view for authenticated users
GRANT SELECT ON public.materials_with_stock TO authenticated;

-- Create RLS policy for the view that allows administrators to see all materials
CREATE POLICY "Admins can view materials with stock" 
ON public.materials_with_stock 
FOR SELECT 
USING (get_current_user_role() = ANY (ARRAY['Главный Администратор'::text, 'Администратор'::text]));

-- Enable RLS on the view
ALTER VIEW public.materials_with_stock ENABLE ROW LEVEL SECURITY;

-- Update stock_levels RLS policies to be more permissive for administrators
DROP POLICY IF EXISTS "Admins can view all stock levels" ON public.stock_levels;
CREATE POLICY "Admins can view all stock levels" 
ON public.stock_levels 
FOR SELECT 
USING (get_current_user_role() = ANY (ARRAY['Главный Администратор'::text, 'Администратор'::text]));

-- Ensure we have proper INSERT/UPDATE/DELETE policies for stock_levels
DROP POLICY IF EXISTS "Admins can insert stock levels" ON public.stock_levels;
CREATE POLICY "Admins can insert stock levels" 
ON public.stock_levels 
FOR INSERT 
WITH CHECK (get_current_user_role() = ANY (ARRAY['Главный Администратор'::text, 'Администратор'::text]));

DROP POLICY IF EXISTS "Admins can update stock levels" ON public.stock_levels;
CREATE POLICY "Admins can update stock levels" 
ON public.stock_levels 
FOR UPDATE 
USING (get_current_user_role() = ANY (ARRAY['Главный Администратор'::text, 'Администратор'::text]));

DROP POLICY IF EXISTS "Admins can delete stock levels" ON public.stock_levels;
CREATE POLICY "Admins can delete stock levels" 
ON public.stock_levels 
FOR DELETE 
USING (get_current_user_role() = ANY (ARRAY['Главный Администратор'::text, 'Администратор'::text]));
