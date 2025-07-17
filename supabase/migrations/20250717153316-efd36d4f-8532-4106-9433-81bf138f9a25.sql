
-- Сначала удаляем любую существующую политику INSERT, чтобы избежать конфликтов
DROP POLICY IF EXISTS "Admins can insert stock movements" ON public.stock_movements;
DROP POLICY IF EXISTS "Admin only access for suppliers insert" ON public.stock_movements; -- старое имя
DROP POLICY IF EXISTS "Admin only access for stock_movements insert" ON public.stock_movements; -- возможное имя

-- ТЕПЕРЬ СОЗДАЕМ ЕДИНСТВЕННО ПРАВИЛЬНУЮ ВЕРСИЮ ПОЛИТИКИ INSERT
CREATE POLICY "Admins can insert all stock movements"
ON public.stock_movements
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE 
      id = auth.uid() AND
      role IN ('Главный Администратор', 'Администратор')
  )
);
