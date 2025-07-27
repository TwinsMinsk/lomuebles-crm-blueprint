-- 1. Create trigger for automatic stock recalculation on stock_movements
DROP TRIGGER IF EXISTS trigger_recalculate_stock_on_movements ON public.stock_movements;

CREATE TRIGGER trigger_recalculate_stock_on_movements
  AFTER INSERT OR UPDATE OR DELETE ON public.stock_movements
  FOR EACH ROW EXECUTE FUNCTION public.trigger_recalculate_stock();

-- 2. Update the create_stock_movement function to properly handle locations
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
  -- Get the current user's role
  SELECT role::text INTO user_role_val 
  FROM public.profiles 
  WHERE id = auth.uid();
  
  -- Check if user has permission (admin roles only)
  IF user_role_val IS NULL OR user_role_val NOT IN ('Главный Администратор', 'Администратор') THEN
    RAISE EXCEPTION 'Access denied: Insufficient permissions to create stock movements';
  END IF;
  
  -- Get movement type
  movement_type_val := (p_movement_data->>'movement_type')::public.stock_movement_type;
  
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
  
  RETURN new_movement;
END;
$function$;

-- 3. Fix the recalculate_stock_for_location function to handle all movement types correctly
CREATE OR REPLACE FUNCTION public.recalculate_stock_for_location(p_material_id integer, p_location text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
    calculated_quantity NUMERIC;
    material_min_stock NUMERIC;
    new_status public.stock_status;
BEGIN
    -- Calculate quantity for specific material in specific location
    -- Handle different movement types:
    -- - Поступление: adds to to_location
    -- - Возврат: adds to to_location  
    -- - Расход: removes from from_location
    -- - Списание: removes from from_location
    -- - Перемещение: removes from from_location, adds to to_location
    -- - Инвентаризация: special case
    
    SELECT COALESCE(SUM(
      CASE 
        WHEN movement_type IN ('Поступление', 'Возврат') AND to_location = p_location THEN quantity
        WHEN movement_type IN ('Расход', 'Списание') AND from_location = p_location THEN -quantity
        WHEN movement_type = 'Перемещение' AND from_location = p_location THEN -quantity
        WHEN movement_type = 'Перемещение' AND to_location = p_location THEN quantity
        WHEN movement_type = 'Инвентаризация' AND from_location = p_location THEN 
          -- For inventory adjustments, the quantity represents the adjustment amount
          quantity
        ELSE 0
      END
    ), 0) INTO calculated_quantity
    FROM public.stock_movements
    WHERE material_id = p_material_id 
    AND (from_location = p_location OR to_location = p_location);

    -- Get minimum stock level for the material
    SELECT COALESCE(min_stock_level, 0) INTO material_min_stock 
    FROM public.materials 
    WHERE id = p_material_id;

    -- Determine status based on calculated quantity
    IF calculated_quantity <= 0 THEN
        new_status := 'Нет в наличии';
    ELSIF calculated_quantity <= material_min_stock THEN
        new_status := 'Заканчивается';
    ELSE
        new_status := 'В наличии';
    END IF;

    -- Insert or update stock_levels record
    INSERT INTO public.stock_levels (
        material_id, 
        location, 
        current_quantity, 
        reserved_quantity, 
        status, 
        last_movement_date, 
        created_at, 
        updated_at
    )
    VALUES (
        p_material_id,
        p_location,
        calculated_quantity,
        COALESCE((
            SELECT SUM(quantity_reserved) 
            FROM public.material_reservations 
            WHERE material_id = p_material_id AND location = p_location
        ), 0),
        new_status::public.stock_status,
        (SELECT MAX(movement_date) FROM public.stock_movements 
         WHERE material_id = p_material_id 
         AND (from_location = p_location OR to_location = p_location)),
        now(),
        now()
    )
    ON CONFLICT (material_id, location) DO UPDATE SET
        current_quantity = EXCLUDED.current_quantity,
        reserved_quantity = EXCLUDED.reserved_quantity,
        status = EXCLUDED.status,
        last_movement_date = EXCLUDED.last_movement_date,
        updated_at = now();
        
    RAISE NOTICE 'Recalculated stock for material % at location %: quantity = %', p_material_id, p_location, calculated_quantity;
END;
$function$;

-- 4. Create a function to recalculate all existing stock levels
CREATE OR REPLACE FUNCTION public.recalculate_all_stock_levels()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
    movement_rec RECORD;
    processed_count INTEGER := 0;
BEGIN
    -- Get all unique material-location combinations from stock_movements
    FOR movement_rec IN 
        SELECT DISTINCT material_id, location
        FROM (
            SELECT material_id, from_location as location FROM public.stock_movements WHERE from_location IS NOT NULL
            UNION
            SELECT material_id, to_location as location FROM public.stock_movements WHERE to_location IS NOT NULL
        ) t
        WHERE location IS NOT NULL
    LOOP
        -- Recalculate stock for each material-location combination
        PERFORM public.recalculate_stock_for_location(movement_rec.material_id, movement_rec.location);
        processed_count := processed_count + 1;
    END LOOP;
    
    RETURN format('Recalculated stock levels for %s material-location combinations', processed_count);
END;
$function$;

-- 5. Run the recalculation for all existing data
SELECT public.recalculate_all_stock_levels();