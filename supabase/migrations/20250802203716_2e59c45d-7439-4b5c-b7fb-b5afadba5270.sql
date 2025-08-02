-- Drop and recreate the recalculate_all_stock_levels function
DROP FUNCTION IF EXISTS public.recalculate_all_stock_levels();

CREATE FUNCTION public.recalculate_all_stock_levels()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  movement_rec RECORD;
  location_rec RECORD;
  material_rec RECORD;
BEGIN
  RAISE NOTICE 'Starting stock level recalculation...';
  
  -- Clear existing stock levels
  DELETE FROM public.stock_levels;
  RAISE NOTICE 'Cleared existing stock levels';
  
  -- Get all unique combinations of material_id and location from movements
  FOR movement_rec IN 
    SELECT DISTINCT 
      material_id, 
      COALESCE(from_location, to_location) as location
    FROM public.stock_movements
    WHERE COALESCE(from_location, to_location) IS NOT NULL
  LOOP
    RAISE NOTICE 'Processing material % at location %', movement_rec.material_id, movement_rec.location;
    PERFORM public.recalculate_stock_for_location(movement_rec.material_id, movement_rec.location);
  END LOOP;
  
  -- Ensure all materials have at least a record in "Основной склад" 
  FOR material_rec IN SELECT id FROM public.materials LOOP
    INSERT INTO public.stock_levels (
      material_id, 
      location, 
      current_quantity, 
      reserved_quantity, 
      status, 
      created_at, 
      updated_at
    )
    SELECT 
      material_rec.id,
      'Основной склад',
      0,
      0,
      'Нет в наличии'::public.stock_status,
      now(),
      now()
    WHERE NOT EXISTS (
      SELECT 1 FROM public.stock_levels 
      WHERE material_id = material_rec.id 
      AND location = 'Основной склад'
    );
  END LOOP;
  
  RAISE NOTICE 'Stock level recalculation completed';
END;
$function$;

-- Run the recalculation
SELECT public.recalculate_all_stock_levels();