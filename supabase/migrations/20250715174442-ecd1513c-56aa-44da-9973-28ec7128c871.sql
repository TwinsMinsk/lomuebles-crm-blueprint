-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS trg_update_stock_level_on_movement ON stock_movements;

-- Update the trigger function to handle INSERT, UPDATE, and DELETE
CREATE OR REPLACE FUNCTION public.update_stock_level_on_movement()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
  old_movement_multiplier INTEGER;
  new_movement_multiplier INTEGER;
BEGIN
  -- Function to determine movement multiplier
  CREATE OR REPLACE FUNCTION get_movement_multiplier(movement_type_param public.stock_movement_type)
  RETURNS INTEGER AS $$
  BEGIN
    CASE movement_type_param
      WHEN 'Поступление' THEN RETURN 1;
      WHEN 'Возврат' THEN RETURN 1;
      WHEN 'Расход' THEN RETURN -1;
      WHEN 'Списание' THEN RETURN -1;
      WHEN 'Инвентаризация' THEN RETURN 0;
      WHEN 'Перемещение' THEN RETURN 0;
      ELSE RETURN 0;
    END CASE;
  END;
  $$ LANGUAGE plpgsql;

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
$function$;

-- Create the trigger for all operations
CREATE TRIGGER trg_update_stock_level_on_movement
    AFTER INSERT OR UPDATE OR DELETE ON public.stock_movements
    FOR EACH ROW
    EXECUTE FUNCTION public.update_stock_level_on_movement();