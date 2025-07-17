
-- Сначала удаляем любую существующую политику INSERT, чтобы избежать конфликтов
DROP POLICY IF EXISTS "Admins can insert stock movements" ON public.stock_movements;
DROP POLICY IF EXISTS "Admin only access for suppliers insert" ON public.stock_movements; -- старое имя
DROP POLICY IF EXISTS "Admin only access for stock_movements insert" ON public.stock_movements; -- возможное имя

-- ТЕПЕРЬ СОЗДАЕМ ЕДИНСТВЕННО ПРАВИЛЬНУЮ ВЕРСИЮ ПОЛИТИКИ INSERT
-- Используем тот же подход, что и в SELECT/UPDATE политиках
CREATE POLICY "Admins can insert all stock movements"
ON public.stock_movements
FOR INSERT
WITH CHECK (
  get_current_user_role() = ANY (ARRAY['Главный Администратор'::text, 'Администратор'::text])
);
