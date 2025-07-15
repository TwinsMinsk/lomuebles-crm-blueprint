-- Check existing RLS policies for stock_movements
SELECT * FROM pg_policies WHERE tablename = 'stock_movements';

-- Drop and recreate RLS policies for stock_movements
DROP POLICY IF EXISTS "Admins can delete stock movements" ON public.stock_movements;
DROP POLICY IF EXISTS "Admins can insert stock movements" ON public.stock_movements;
DROP POLICY IF EXISTS "Admins can update stock movements" ON public.stock_movements;
DROP POLICY IF EXISTS "Admins can view all stock movements" ON public.stock_movements;

-- Create comprehensive RLS policies for stock_movements
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