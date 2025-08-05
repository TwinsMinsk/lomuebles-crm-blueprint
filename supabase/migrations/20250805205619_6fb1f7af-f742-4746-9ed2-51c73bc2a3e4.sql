-- Step 1: First, fix existing negative stock levels
UPDATE public.stock_levels 
SET current_quantity = 0 
WHERE current_quantity < 0;

UPDATE public.stock_levels 
SET reserved_quantity = 0 
WHERE reserved_quantity < 0;

-- Step 2: Recalculate all stock levels for consistency  
SELECT public.recalculate_all_stock_levels();