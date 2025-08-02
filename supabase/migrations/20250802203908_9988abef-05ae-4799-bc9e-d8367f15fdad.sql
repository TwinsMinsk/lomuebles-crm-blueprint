-- Check and fix the old movements with NULL locations
UPDATE public.stock_movements 
SET to_location = 'Основной склад'
WHERE movement_type = 'Поступление' 
  AND to_location IS NULL;

UPDATE public.stock_movements 
SET from_location = 'Основной склад'
WHERE movement_type IN ('Расход', 'Списание') 
  AND from_location IS NULL;

-- For transfers with NULL locations, we can't easily fix them, so let's just set both to a default
UPDATE public.stock_movements 
SET 
  from_location = COALESCE(from_location, 'Основной склад'),
  to_location = COALESCE(to_location, 'Основной склад')
WHERE movement_type = 'Перемещение' 
  AND (from_location IS NULL OR to_location IS NULL);

-- Run the recalculation again to ensure all stock levels are correct
SELECT public.recalculate_all_stock_levels();