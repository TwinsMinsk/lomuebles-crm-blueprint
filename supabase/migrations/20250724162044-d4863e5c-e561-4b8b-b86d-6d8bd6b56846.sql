-- First, ensure the trigger is active for material_reservations
DROP TRIGGER IF EXISTS update_reserved_quantity_trigger ON public.material_reservations;

CREATE TRIGGER update_reserved_quantity_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.material_reservations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_reserved_quantity();

-- Create the reserve materials function
CREATE OR REPLACE FUNCTION public.reserve_materials_from_estimate(p_estimate_id INTEGER)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $function$
DECLARE
  v_order_id INTEGER;
  v_estimate_record RECORD;
  v_item_record RECORD;
  v_reserved_count INTEGER := 0;
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
      created_at,
      updated_at
    ) VALUES (
      v_item_record.material_id,
      v_order_id,
      v_item_record.quantity_needed,
      now(),
      now()
    );
    
    v_reserved_count := v_reserved_count + 1;
  END LOOP;
  
  -- Build result
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