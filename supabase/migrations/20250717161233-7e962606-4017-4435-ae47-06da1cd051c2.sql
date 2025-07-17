-- Remove the problematic INSERT policy
DROP POLICY IF EXISTS "Admins can insert all stock movements" ON public.stock_movements;
DROP POLICY IF EXISTS "Admins can insert stock movements" ON public.stock_movements;
DROP POLICY IF EXISTS "Admin only access for suppliers insert" ON public.stock_movements;
DROP POLICY IF EXISTS "Admin only access for stock_movements insert" ON public.stock_movements;

-- Create RPC function to create stock movements
CREATE OR REPLACE FUNCTION public.create_stock_movement(p_movement_data JSONB)
RETURNS public.stock_movements
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role_val text;
  new_movement public.stock_movements;
BEGIN
  -- Get the current user's role
  SELECT role::text INTO user_role_val 
  FROM public.profiles 
  WHERE id = auth.uid();
  
  -- Check if user has permission (admin roles only)
  IF user_role_val IS NULL OR user_role_val NOT IN ('Главный Администратор', 'Администратор') THEN
    RAISE EXCEPTION 'Access denied: Insufficient permissions to create stock movements';
  END IF;
  
  -- Insert the stock movement with creator_user_id set to current user
  INSERT INTO public.stock_movements (
    material_id,
    movement_type,
    quantity,
    unit_cost,
    total_cost,
    supplier_id,
    order_id,
    movement_date,
    notes,
    reference_document,
    created_by
  )
  VALUES (
    (p_movement_data->>'material_id')::integer,
    (p_movement_data->>'movement_type')::public.stock_movement_type,
    (p_movement_data->>'quantity')::numeric,
    CASE WHEN p_movement_data->>'unit_cost' IS NULL THEN NULL ELSE (p_movement_data->>'unit_cost')::numeric END,
    CASE WHEN p_movement_data->>'total_cost' IS NULL THEN NULL ELSE (p_movement_data->>'total_cost')::numeric END,
    CASE WHEN p_movement_data->>'supplier_id' IS NULL THEN NULL ELSE (p_movement_data->>'supplier_id')::integer END,
    CASE WHEN p_movement_data->>'order_id' IS NULL THEN NULL ELSE (p_movement_data->>'order_id')::integer END,
    COALESCE((p_movement_data->>'movement_date')::timestamptz, now()),
    p_movement_data->>'notes',
    p_movement_data->>'reference_document',
    auth.uid()
  )
  RETURNING * INTO new_movement;
  
  RETURN new_movement;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.create_stock_movement(JSONB) TO authenticated;