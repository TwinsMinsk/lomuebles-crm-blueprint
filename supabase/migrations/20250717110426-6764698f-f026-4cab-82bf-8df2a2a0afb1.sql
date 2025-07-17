-- Удаляем все существующие DELETE политики для stock_movements
DROP POLICY IF EXISTS "Admins can delete stock movements" ON public.stock_movements;
DROP POLICY IF EXISTS "Admin only access for suppliers delete" ON public.stock_movements;
DROP POLICY IF EXISTS "Admin only access for stock_movements delete" ON public.stock_movements;
DROP POLICY IF EXISTS "Admins can delete all stock movements" ON public.stock_movements;

-- Создаем новую единственную и правильную политику DELETE
CREATE POLICY "Admins can delete all stock movements"
ON public.stock_movements
FOR DELETE
USING (
    get_current_user_role() = ANY (ARRAY['Главный Администратор'::text, 'Администратор'::text])
);