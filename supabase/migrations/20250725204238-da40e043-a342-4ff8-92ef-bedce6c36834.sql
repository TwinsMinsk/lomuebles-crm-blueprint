-- Очистка и пересчет резервов материалов

-- 1. Очищаем существующие резервы
TRUNCATE TABLE public.material_reservations;

-- 2. Создаем резервы заново на основе утвержденных смет
INSERT INTO public.material_reservations (material_id, order_id, quantity_reserved, created_at, updated_at)
SELECT 
  ei.material_id,
  e.order_id,
  ei.quantity_needed,
  now(),
  now()
FROM public.estimates e
JOIN public.estimate_items ei ON e.id = ei.estimate_id
WHERE e.status = 'утверждена';

-- 3. Пересчитываем остатки на складе
SELECT public.recalculate_stock_levels();