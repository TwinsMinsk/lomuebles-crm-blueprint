-- СНАЧАЛА УДАЛЯЕМ НЕПРАВИЛЬНУЮ ПОЛИТИКУ, КОТОРУЮ ТЫ ТОЛЬКО ЧТО СОЗДАЛ
DROP POLICY IF EXISTS "Admins can delete all stock movements" ON public.stock_movements;

-- ТЕПЕРЬ СОЗДАЕМ ЕДИНСТВЕННО ПРАВИЛЬНУЮ ВЕРСИЮ
CREATE POLICY "Admins can delete all stock movements (direct check)"
ON public.stock_movements
FOR DELETE
USING (
  EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE 
      id = auth.uid() AND
      role IN ('Главный Администратор', 'Администратор')
  )
);