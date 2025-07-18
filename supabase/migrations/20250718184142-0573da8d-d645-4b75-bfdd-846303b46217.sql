
-- Drop the existing complex trigger and function
DROP TRIGGER IF EXISTS trg_update_stock_level_on_movement ON public.stock_movements;
DROP FUNCTION IF EXISTS public.update_stock_level_on_movement();

-- Create a simple function to recalculate stock for one material
CREATE OR REPLACE FUNCTION public.recalculate_one_material_stock(p_material_id INTEGER)
RETURNS void AS $$
DECLARE
  calculated_quantity NUMERIC;
  material_min_stock NUMERIC;
  new_status public.stock_status;
BEGIN
  -- Calculate total quantity from all movements for this material
  SELECT COALESCE(SUM(
    CASE movement_type
      WHEN 'Поступление' THEN quantity
      WHEN 'Возврат' THEN quantity
      WHEN 'Расход' THEN -quantity
      WHEN 'Списание' THEN -quantity
      WHEN 'Инвентаризация' THEN 0  -- Inventory adjustments handled separately
      WHEN 'Перемещение' THEN 0     -- Transfers don't affect total stock
      ELSE 0
    END
  ), 0) INTO calculated_quantity
  FROM public.stock_movements
  WHERE material_id = p_material_id;
  
  -- Get material minimum stock level
  SELECT COALESCE(min_stock_level, 0) INTO material_min_stock
  FROM public.materials
  WHERE id = p_material_id;
  
  -- Determine status based on quantity
  IF calculated_quantity <= 0 THEN
    new_status := 'Нет в наличии'::public.stock_status;
  ELSIF calculated_quantity <= material_min_stock THEN
    new_status := 'Заканчивается'::public.stock_status;
  ELSE
    new_status := 'В наличии'::public.stock_status;
  END IF;
  
  -- Update or insert the stock level
  INSERT INTO public.stock_levels (
    material_id, 
    current_quantity, 
    reserved_quantity,
    status,
    last_movement_date,
    created_at,
    updated_at
  )
  VALUES (
    p_material_id,
    calculated_quantity,
    COALESCE((SELECT reserved_quantity FROM public.stock_levels WHERE material_id = p_material_id), 0),
    new_status,
    (SELECT MAX(movement_date) FROM public.stock_movements WHERE material_id = p_material_id),
    now(),
    now()
  )
  ON CONFLICT (material_id) DO UPDATE SET
    current_quantity = EXCLUDED.current_quantity,
    status = EXCLUDED.status,
    last_movement_date = EXCLUDED.last_movement_date,
    updated_at = now();
    
  RAISE NOTICE 'Recalculated stock for material %: quantity = %', p_material_id, calculated_quantity;
END;
$$ LANGUAGE plpgsql;

-- Create a simple trigger function that calls the recalculation
CREATE OR REPLACE FUNCTION public.trigger_recalculate_stock()
RETURNS TRIGGER AS $$
DECLARE
  material_ids_to_update INTEGER[];
BEGIN
  -- Collect material IDs that need recalculation
  IF TG_OP = 'DELETE' THEN
    material_ids_to_update := ARRAY[OLD.material_id];
  ELSIF TG_OP = 'UPDATE' THEN
    -- If material_id changed, update both old and new materials
    IF OLD.material_id != NEW.material_id THEN
      material_ids_to_update := ARRAY[OLD.material_id, NEW.material_id];
    ELSE
      material_ids_to_update := ARRAY[NEW.material_id];
    END IF;
  ELSE -- INSERT
    material_ids_to_update := ARRAY[NEW.material_id];
  END IF;
  
  -- Recalculate stock for each affected material
  FOR i IN 1..array_length(material_ids_to_update, 1) LOOP
    PERFORM public.recalculate_one_material_stock(material_ids_to_update[i]);
  END LOOP;
  
  -- Return appropriate record
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Create the new simple trigger
CREATE TRIGGER trg_recalculate_stock_on_movement
  AFTER INSERT OR UPDATE OR DELETE ON public.stock_movements
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_recalculate_stock();

-- Run full recalculation for all materials to fix existing data
SELECT public.recalculate_stock_levels();
