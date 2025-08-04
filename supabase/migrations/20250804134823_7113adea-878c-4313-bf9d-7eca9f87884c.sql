-- Add source_type and related_estimate_id to stock_movements
ALTER TABLE public.stock_movements 
ADD COLUMN source_type TEXT DEFAULT 'manual' CHECK (source_type IN ('manual', 'estimate_reservation', 'auto_completion'));

ALTER TABLE public.stock_movements 
ADD COLUMN related_estimate_id INTEGER REFERENCES public.estimates(id);

-- Add used_quantity to material_reservations to track what has been actually used
ALTER TABLE public.material_reservations 
ADD COLUMN used_quantity NUMERIC DEFAULT 0 CHECK (used_quantity >= 0);

-- Add constraint to ensure used_quantity doesn't exceed quantity_reserved
ALTER TABLE public.material_reservations 
ADD CONSTRAINT check_used_quantity_valid CHECK (used_quantity <= quantity_reserved);

-- Create improved reserve_materials function with stock availability checks
CREATE OR REPLACE FUNCTION public.reserve_materials_from_estimate_improved(p_estimate_id integer)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  v_order_id INTEGER;
  v_estimate_record RECORD;
  v_item_record RECORD;
  v_reserved_count INTEGER := 0;
  v_insufficient_stock JSONB := '[]'::jsonb;
  v_available_stock NUMERIC;
  v_result jsonb;
BEGIN
  -- Get the estimate and its order_id
  SELECT e.order_id, e.status INTO v_estimate_record
  FROM public.estimates e
  WHERE e.id = p_estimate_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Estimate with ID % not found', p_estimate_id;
  END IF;
  
  -- Check if estimate is approved
  IF v_estimate_record.status != 'утверждена' THEN
    RAISE EXCEPTION 'Can only reserve materials from approved estimates. Current status: %', v_estimate_record.status;
  END IF;
  
  v_order_id := v_estimate_record.order_id;
  
  -- Check stock availability for all items first
  FOR v_item_record IN 
    SELECT ei.material_id, ei.quantity_needed, m.name as material_name
    FROM public.estimate_items ei
    JOIN public.materials m ON ei.material_id = m.id
    WHERE ei.estimate_id = p_estimate_id
  LOOP
    -- Calculate available stock (current - reserved + used)
    SELECT COALESCE(
      (SELECT current_quantity - reserved_quantity + used_quantity 
       FROM public.stock_levels sl
       LEFT JOIN (
         SELECT material_id, SUM(used_quantity) as used_quantity
         FROM public.material_reservations 
         WHERE material_id = v_item_record.material_id
         GROUP BY material_id
       ) mr ON sl.material_id = mr.material_id
       WHERE sl.material_id = v_item_record.material_id
       LIMIT 1), 
      0
    ) INTO v_available_stock;
    
    IF v_available_stock < v_item_record.quantity_needed THEN
      v_insufficient_stock := v_insufficient_stock || jsonb_build_object(
        'material_id', v_item_record.material_id,
        'material_name', v_item_record.material_name,
        'needed', v_item_record.quantity_needed,
        'available', v_available_stock
      );
    END IF;
  END LOOP;
  
  -- If there's insufficient stock, return error
  IF jsonb_array_length(v_insufficient_stock) > 0 THEN
    v_result := jsonb_build_object(
      'success', false,
      'error', 'Insufficient stock for some materials',
      'insufficient_stock', v_insufficient_stock
    );
    RETURN v_result;
  END IF;
  
  -- Delete existing reservations for this order
  DELETE FROM public.material_reservations 
  WHERE order_id = v_order_id;
  
  -- Create new reservations from estimate items
  FOR v_item_record IN 
    SELECT ei.material_id, ei.quantity_needed
    FROM public.estimate_items ei
    WHERE ei.estimate_id = p_estimate_id
  LOOP
    INSERT INTO public.material_reservations (
      material_id,
      order_id,
      quantity_reserved,
      used_quantity,
      created_at,
      updated_at
    ) VALUES (
      v_item_record.material_id,
      v_order_id,
      v_item_record.quantity_needed,
      0,
      now(),
      now()
    );
    
    v_reserved_count := v_reserved_count + 1;
  END LOOP;
  
  -- Build success result
  v_result := jsonb_build_object(
    'success', true,
    'estimate_id', p_estimate_id,
    'order_id', v_order_id,
    'materials_reserved', v_reserved_count,
    'message', format('Successfully reserved %s materials for order %s', v_reserved_count, v_order_id)
  );
  
  RETURN v_result;
END;
$function$;

-- Create function to handle manual movements and update reservations
CREATE OR REPLACE FUNCTION public.handle_manual_movement_with_reservations(
  p_material_id INTEGER,
  p_order_id INTEGER,
  p_quantity NUMERIC,
  p_movement_type TEXT
)
 RETURNS VOID
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_remaining_quantity NUMERIC := p_quantity;
  v_reservation_record RECORD;
  v_to_use NUMERIC;
BEGIN
  -- Only process for consumption movements (Расход, Списание)
  IF p_movement_type NOT IN ('Расход', 'Списание') THEN
    RETURN;
  END IF;
  
  -- Update reservations by using them up
  FOR v_reservation_record IN 
    SELECT id, quantity_reserved, used_quantity
    FROM public.material_reservations
    WHERE material_id = p_material_id 
    AND order_id = p_order_id
    AND (quantity_reserved - used_quantity) > 0
    ORDER BY created_at ASC
  LOOP
    -- Calculate how much we can use from this reservation
    v_to_use := LEAST(v_remaining_quantity, v_reservation_record.quantity_reserved - v_reservation_record.used_quantity);
    
    -- Update the reservation
    UPDATE public.material_reservations 
    SET used_quantity = used_quantity + v_to_use,
        updated_at = now()
    WHERE id = v_reservation_record.id;
    
    -- Reduce remaining quantity
    v_remaining_quantity := v_remaining_quantity - v_to_use;
    
    -- Exit if we've used all the quantity
    IF v_remaining_quantity <= 0 THEN
      EXIT;
    END IF;
  END LOOP;
END;
$function$;

-- Update the order status change handler to prevent double write-offs
CREATE OR REPLACE FUNCTION public.handle_order_status_changes_improved()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  reservation_record RECORD;
  created_by_user UUID;
  existing_movements_count INTEGER;
  remaining_to_writeoff NUMERIC;
BEGIN
  -- Сценарий 1: Заказ ОТМЕНЕН
  IF NEW.status = 'Отменен' AND OLD.status != 'Отменен' THEN
    -- Удаляем все резервы для отмененного заказа
    DELETE FROM public.material_reservations 
    WHERE order_id = NEW.id;
    RAISE NOTICE 'Резервы для отмененного заказа №% удалены.', NEW.order_number;
  
  -- Сценарий 2: Заказ ЗАВЕРШЕН
  ELSIF NEW.status = 'Завершен' AND OLD.status != 'Завершен' THEN
    -- Определяем пользователя для поля created_by
    created_by_user := COALESCE(NEW.assigned_user_id, NEW.creator_user_id);
    
    -- Обрабатываем все резервы для завершенного заказа
    FOR reservation_record IN 
      SELECT mr.material_id, mr.quantity_reserved, mr.used_quantity
      FROM public.material_reservations mr
      WHERE mr.order_id = NEW.id
    LOOP
      -- Calculate remaining quantity to write off (reserved - already used)
      remaining_to_writeoff := reservation_record.quantity_reserved - reservation_record.used_quantity;
      
      -- Only create automatic write-off if there's remaining quantity
      IF remaining_to_writeoff > 0 THEN
        -- Создаем движение материала (автоматическое списание)
        INSERT INTO public.stock_movements (
          material_id, 
          movement_type, 
          quantity, 
          order_id, 
          movement_date, 
          notes, 
          created_by,
          source_type
        ) VALUES (
          reservation_record.material_id,
          'Списание'::public.stock_movement_type,
          remaining_to_writeoff,
          NEW.id,
          now(),
          'Автоматическое списание по завершению заказа №' || NEW.order_number,
          created_by_user,
          'auto_completion'
        );
        
        -- Mark the reservation as fully used
        UPDATE public.material_reservations 
        SET used_quantity = quantity_reserved,
            updated_at = now()
        WHERE material_id = reservation_record.material_id 
        AND order_id = NEW.id;
      END IF;
    END LOOP;
    
    RAISE NOTICE 'Автоматическое списание для завершенного заказа №% выполнено.', NEW.order_number;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Drop old trigger and create new one
DROP TRIGGER IF EXISTS trigger_handle_order_status_changes ON public.orders;
CREATE TRIGGER trigger_handle_order_status_changes_improved
  AFTER UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_order_status_changes_improved();

-- Create trigger for manual movements to update reservations
CREATE OR REPLACE FUNCTION public.trigger_update_reservations_on_movement()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  -- Only for INSERT operations with manual movements linked to orders
  IF TG_OP = 'INSERT' AND NEW.order_id IS NOT NULL AND NEW.source_type = 'manual' THEN
    PERFORM public.handle_manual_movement_with_reservations(
      NEW.material_id,
      NEW.order_id,
      NEW.quantity,
      NEW.movement_type::TEXT
    );
  END IF;
  
  RETURN NEW;
END;
$function$;

CREATE TRIGGER trigger_stock_movement_update_reservations
  AFTER INSERT ON public.stock_movements
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_update_reservations_on_movement();