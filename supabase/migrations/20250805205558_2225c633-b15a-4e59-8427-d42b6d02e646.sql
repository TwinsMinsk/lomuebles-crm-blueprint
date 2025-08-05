-- Step 1: Add CHECK constraints to prevent negative stock levels
ALTER TABLE public.stock_levels 
ADD CONSTRAINT check_non_negative_current_quantity 
CHECK (current_quantity >= 0);

ALTER TABLE public.stock_levels 
ADD CONSTRAINT check_non_negative_reserved_quantity 
CHECK (reserved_quantity >= 0);

-- Step 2: Create validation function for stock movements
CREATE OR REPLACE FUNCTION public.validate_stock_movement_availability(
  p_material_id INTEGER,
  p_from_location TEXT,
  p_quantity NUMERIC,
  p_movement_type public.stock_movement_type
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_available_quantity NUMERIC := 0;
  v_result JSONB;
BEGIN
  -- Only validate for movements that reduce stock
  IF p_movement_type NOT IN ('Расход', 'Списание', 'Перемещение') THEN
    RETURN jsonb_build_object('valid', true, 'message', 'No validation needed for this movement type');
  END IF;
  
  -- For movements that require stock, check if location has enough material
  IF p_from_location IS NOT NULL THEN
    SELECT COALESCE(current_quantity - reserved_quantity, 0)
    INTO v_available_quantity
    FROM public.stock_levels 
    WHERE material_id = p_material_id AND location = p_from_location;
    
    IF v_available_quantity < p_quantity THEN
      v_result := jsonb_build_object(
        'valid', false,
        'message', format('Недостаточно материала в локации "%s". Доступно: %s', p_from_location, v_available_quantity),
        'available_quantity', v_available_quantity,
        'requested_quantity', p_quantity
      );
    ELSE
      v_result := jsonb_build_object(
        'valid', true,
        'message', 'Движение возможно',
        'available_quantity', v_available_quantity,
        'requested_quantity', p_quantity
      );
    END IF;
  ELSE
    v_result := jsonb_build_object('valid', false, 'message', 'Необходимо указать локацию отправления');
  END IF;
  
  RETURN v_result;
END;
$$;

-- Step 3: Fix existing negative stock levels by setting them to 0
UPDATE public.stock_levels 
SET current_quantity = 0 
WHERE current_quantity < 0;

UPDATE public.stock_levels 
SET reserved_quantity = 0 
WHERE reserved_quantity < 0;

-- Step 4: Recalculate all stock levels for consistency
SELECT public.recalculate_all_stock_levels();

-- Step 5: Create function to get available locations for a material
CREATE OR REPLACE FUNCTION public.get_available_locations_for_material(p_material_id INTEGER)
RETURNS TABLE(
  location_name TEXT,
  available_quantity NUMERIC,
  reserved_quantity NUMERIC,
  current_quantity NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sl.location,
    (sl.current_quantity - sl.reserved_quantity) AS available_quantity,
    sl.reserved_quantity,
    sl.current_quantity
  FROM public.stock_levels sl
  WHERE sl.material_id = p_material_id 
    AND sl.current_quantity > 0
  ORDER BY (sl.current_quantity - sl.reserved_quantity) DESC;
END;
$$;