-- First, fix the update_stock_level_on_movement trigger function
CREATE OR REPLACE FUNCTION public.update_stock_level_on_movement()
RETURNS TRIGGER AS $$
DECLARE
  old_movement_multiplier INTEGER;
  new_movement_multiplier INTEGER;
BEGIN
  -- Handle INSERT operation
  IF TG_OP = 'INSERT' THEN
    new_movement_multiplier := get_movement_multiplier(NEW.movement_type);
    
    -- Update or create stock level record
    INSERT INTO public.stock_levels (material_id, current_quantity, last_movement_date)
    VALUES (NEW.material_id, NEW.quantity * new_movement_multiplier, NEW.movement_date)
    ON CONFLICT (material_id) DO UPDATE SET
      current_quantity = stock_levels.current_quantity + (NEW.quantity * new_movement_multiplier),
      last_movement_date = NEW.movement_date,
      updated_at = now();

    -- Update stock status
    UPDATE public.stock_levels 
    SET status = CASE
      WHEN current_quantity <= 0 THEN 'Нет в наличии'::public.stock_status
      WHEN current_quantity <= (SELECT COALESCE(min_stock_level, 0) FROM public.materials WHERE id = NEW.material_id) THEN 'Заканчивается'::public.stock_status
      ELSE 'В наличии'::public.stock_status
    END
    WHERE material_id = NEW.material_id;

    RETURN NEW;
  END IF;

  -- Handle UPDATE operation
  IF TG_OP = 'UPDATE' THEN
    old_movement_multiplier := get_movement_multiplier(OLD.movement_type);
    new_movement_multiplier := get_movement_multiplier(NEW.movement_type);
    
    -- Revert old movement effect and apply new movement effect
    UPDATE public.stock_levels 
    SET 
      current_quantity = current_quantity - (OLD.quantity * old_movement_multiplier) + (NEW.quantity * new_movement_multiplier),
      last_movement_date = NEW.movement_date,
      updated_at = now()
    WHERE material_id = NEW.material_id;

    -- If material changed, handle both old and new materials
    IF OLD.material_id != NEW.material_id THEN
      -- Revert effect on old material
      UPDATE public.stock_levels 
      SET 
        current_quantity = current_quantity - (OLD.quantity * old_movement_multiplier),
        updated_at = now()
      WHERE material_id = OLD.material_id;
      
      -- Apply effect on new material
      INSERT INTO public.stock_levels (material_id, current_quantity, last_movement_date)
      VALUES (NEW.material_id, NEW.quantity * new_movement_multiplier, NEW.movement_date)
      ON CONFLICT (material_id) DO UPDATE SET
        current_quantity = stock_levels.current_quantity + (NEW.quantity * new_movement_multiplier),
        last_movement_date = NEW.movement_date,
        updated_at = now();

      -- Update status for both materials
      UPDATE public.stock_levels 
      SET status = CASE
        WHEN current_quantity <= 0 THEN 'Нет в наличии'::public.stock_status
        WHEN current_quantity <= (SELECT COALESCE(min_stock_level, 0) FROM public.materials WHERE id = OLD.material_id) THEN 'Заканчивается'::public.stock_status
        ELSE 'В наличии'::public.stock_status
      END
      WHERE material_id = OLD.material_id;
    END IF;

    -- Update stock status for the (new) material
    UPDATE public.stock_levels 
    SET status = CASE
      WHEN current_quantity <= 0 THEN 'Нет в наличии'::public.stock_status
      WHEN current_quantity <= (SELECT COALESCE(min_stock_level, 0) FROM public.materials WHERE id = NEW.material_id) THEN 'Заканчивается'::public.stock_status
      ELSE 'В наличии'::public.stock_status
    END
    WHERE material_id = NEW.material_id;

    RETURN NEW;
  END IF;

  -- Handle DELETE operation
  IF TG_OP = 'DELETE' THEN
    old_movement_multiplier := get_movement_multiplier(OLD.movement_type);
    
    -- Revert the movement effect
    UPDATE public.stock_levels 
    SET 
      current_quantity = current_quantity - (OLD.quantity * old_movement_multiplier),
      updated_at = now()
    WHERE material_id = OLD.material_id;

    -- Update stock status
    UPDATE public.stock_levels 
    SET status = CASE
      WHEN current_quantity <= 0 THEN 'Нет в наличии'::public.stock_status
      WHEN current_quantity <= (SELECT COALESCE(min_stock_level, 0) FROM public.materials WHERE id = OLD.material_id) THEN 'Заканчивается'::public.stock_status
      ELSE 'В наличии'::public.stock_status
    END
    WHERE material_id = OLD.material_id;

    RETURN OLD;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create function to recalculate all stock levels from scratch
CREATE OR REPLACE FUNCTION public.recalculate_stock_levels()
RETURNS void AS $$
DECLARE
  material_rec RECORD;
  calculated_quantity NUMERIC;
BEGIN
  -- Loop through all materials
  FOR material_rec IN SELECT id FROM public.materials LOOP
    -- Calculate total quantity from all movements for this material
    SELECT COALESCE(SUM(
      CASE movement_type
        WHEN 'Поступление' THEN quantity
        WHEN 'Возврат' THEN quantity
        WHEN 'Расход' THEN -quantity
        WHEN 'Списание' THEN -quantity
        ELSE 0
      END
    ), 0) INTO calculated_quantity
    FROM public.stock_movements
    WHERE material_id = material_rec.id;
    
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
      material_rec.id,
      calculated_quantity,
      0,
      CASE
        WHEN calculated_quantity <= 0 THEN 'Нет в наличии'::public.stock_status
        WHEN calculated_quantity <= (SELECT COALESCE(min_stock_level, 0) FROM public.materials WHERE id = material_rec.id) THEN 'Заканчивается'::public.stock_status
        ELSE 'В наличии'::public.stock_status
      END,
      (SELECT MAX(movement_date) FROM public.stock_movements WHERE material_id = material_rec.id),
      now(),
      now()
    )
    ON CONFLICT (material_id) DO UPDATE SET
      current_quantity = EXCLUDED.current_quantity,
      status = EXCLUDED.status,
      last_movement_date = EXCLUDED.last_movement_date,
      updated_at = now();
  END LOOP;
  
  RAISE NOTICE 'Stock levels recalculated for all materials';
END;
$$ LANGUAGE plpgsql;

-- Run the recalculation to fix existing data
SELECT public.recalculate_stock_levels();