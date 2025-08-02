-- Step 1: Fix the create_stock_movement function with complete implementation and logging
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
  movement_type_val public.stock_movement_type;
  from_loc text;
  to_loc text;
BEGIN
  -- Add debugging logging
  RAISE NOTICE 'create_stock_movement called with data: %', p_movement_data;
  
  -- Get the current user's role
  SELECT role::text INTO user_role_val 
  FROM public.profiles 
  WHERE id = auth.uid();
  
  RAISE NOTICE 'Current user role: %', user_role_val;
  
  -- Check if user has permission (admin roles only)
  IF user_role_val IS NULL OR user_role_val NOT IN ('Главный Администратор', 'Администратор') THEN
    RAISE EXCEPTION 'Access denied: Insufficient permissions to create stock movements';
  END IF;
  
  -- Get movement type
  movement_type_val := (p_movement_data->>'movement_type')::public.stock_movement_type;
  RAISE NOTICE 'Movement type: %', movement_type_val;
  
  -- Set locations based on movement type
  CASE movement_type_val
    WHEN 'Поступление' THEN
      -- Receipt: from supplier to specified location (default: Основной склад)
      from_loc := NULL;
      to_loc := COALESCE(p_movement_data->>'to_location', 'Основной склад');
    WHEN 'Расход' THEN
      -- Consumption: from specified location to NULL
      from_loc := COALESCE(p_movement_data->>'from_location', 'Основной склад');
      to_loc := NULL;
    WHEN 'Списание' THEN
      -- Write-off: from specified location to NULL
      from_loc := COALESCE(p_movement_data->>'from_location', 'Основной склад');
      to_loc := NULL;
    WHEN 'Перемещение' THEN
      -- Transfer: both locations required
      from_loc := p_movement_data->>'from_location';
      to_loc := p_movement_data->>'to_location';
      IF from_loc IS NULL OR to_loc IS NULL THEN
        RAISE EXCEPTION 'Both from_location and to_location are required for transfers';
      END IF;
    WHEN 'Возврат' THEN
      -- Return: to specified location (default: Основной склад)
      from_loc := NULL;
      to_loc := COALESCE(p_movement_data->>'to_location', 'Основной склад');
    WHEN 'Инвентаризация' THEN
      -- Inventory: adjust at specified location (default: Основной склад)
      from_loc := COALESCE(p_movement_data->>'from_location', 'Основной склад');
      to_loc := COALESCE(p_movement_data->>'to_location', 'Основной склад');
    ELSE
      -- Use provided values
      from_loc := p_movement_data->>'from_location';
      to_loc := p_movement_data->>'to_location';
  END CASE;
  
  RAISE NOTICE 'Calculated locations - from: %, to: %', from_loc, to_loc;
  
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
    movement_type_val,
    (p_movement_data->>'quantity')::numeric,
    CASE WHEN p_movement_data->>'unit_cost' IS NULL THEN NULL ELSE (p_movement_data->>'unit_cost')::numeric END,
    CASE WHEN p_movement_data->>'supplier_id' IS NULL THEN NULL ELSE (p_movement_data->>'supplier_id')::integer END,
    CASE WHEN p_movement_data->>'order_id' IS NULL THEN NULL ELSE (p_movement_data->>'order_id')::integer END,
    COALESCE((p_movement_data->>'movement_date')::timestamptz, now()),
    p_movement_data->>'notes',
    p_movement_data->>'reference_document',
    from_loc,
    to_loc,
    auth.uid()
  )
  RETURNING * INTO new_movement;
  
  RAISE NOTICE 'Created stock movement with ID: %, from_location: %, to_location: %', new_movement.id, new_movement.from_location, new_movement.to_location;
  
  RETURN new_movement;
END;
$function$;

-- Step 2: Update existing stock movements that have null locations
UPDATE public.stock_movements 
SET 
  to_location = 'Основной склад'
WHERE movement_type = 'Поступление' 
  AND to_location IS NULL;

UPDATE public.stock_movements 
SET 
  from_location = 'Основной склад'
WHERE movement_type IN ('Расход', 'Списание') 
  AND from_location IS NULL;

-- Step 3: Create a function to recalculate all stock levels for all locations
CREATE OR REPLACE FUNCTION public.recalculate_all_stock_levels()
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

-- Step 4: Run the recalculation
SELECT public.recalculate_all_stock_levels();