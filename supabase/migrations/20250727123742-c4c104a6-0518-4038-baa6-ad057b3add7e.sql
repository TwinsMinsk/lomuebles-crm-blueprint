-- Update the create_stock_movement function to include location fields
CREATE OR REPLACE FUNCTION public.create_stock_movement(p_movement_data jsonb)
 RETURNS stock_movements
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  user_role_val text;
  new_movement public.stock_movements;
  calculated_total_cost numeric;
BEGIN
  -- Get the current user's role
  SELECT role::text INTO user_role_val 
  FROM public.profiles 
  WHERE id = auth.uid();
  
  -- Check if user has permission (admin roles only)
  IF user_role_val IS NULL OR user_role_val NOT IN ('Главный Администратор', 'Администратор') THEN
    RAISE EXCEPTION 'Access denied: Insufficient permissions to create stock movements';
  END IF;
  
  -- Calculate total_cost if unit_cost is provided
  IF (p_movement_data->>'unit_cost') IS NOT NULL THEN
    calculated_total_cost := (p_movement_data->>'unit_cost')::numeric * (p_movement_data->>'quantity')::numeric;
  ELSE
    calculated_total_cost := NULL;
  END IF;
  
  -- Insert the stock movement with creator_user_id set to current user
  INSERT INTO public.stock_movements (
    material_id,
    movement_type,
    quantity,
    unit_cost,
    supplier_id,
    order_id,
    movement_date,
    notes,
    reference_document,
    from_location,
    to_location,
    created_by
  )
  VALUES (
    (p_movement_data->>'material_id')::integer,
    (p_movement_data->>'movement_type')::public.stock_movement_type,
    (p_movement_data->>'quantity')::numeric,
    CASE WHEN p_movement_data->>'unit_cost' IS NULL THEN NULL ELSE (p_movement_data->>'unit_cost')::numeric END,
    CASE WHEN p_movement_data->>'supplier_id' IS NULL THEN NULL ELSE (p_movement_data->>'supplier_id')::integer END,
    CASE WHEN p_movement_data->>'order_id' IS NULL THEN NULL ELSE (p_movement_data->>'order_id')::integer END,
    COALESCE((p_movement_data->>'movement_date')::timestamptz, now()),
    p_movement_data->>'notes',
    p_movement_data->>'reference_document',
    p_movement_data->>'from_location',
    p_movement_data->>'to_location',
    auth.uid()
  )
  RETURNING * INTO new_movement;
  
  RETURN new_movement;
END;
$function$;