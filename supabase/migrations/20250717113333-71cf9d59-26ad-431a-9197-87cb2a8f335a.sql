-- Drop existing DELETE policies for stock_movements
DROP POLICY IF EXISTS "Admins can delete all stock movements (direct check)" ON public.stock_movements;
DROP POLICY IF EXISTS "Admins can delete all stock movements" ON public.stock_movements;

-- Create RPC function to handle stock movement deletion with SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.delete_stock_movement(p_movement_id INTEGER)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role_val text;
  movement_exists boolean;
  deleted_count integer;
BEGIN
  -- Get the current user's role
  SELECT role::text INTO user_role_val 
  FROM public.profiles 
  WHERE id = auth.uid();
  
  -- Check if user has permission (admin roles only)
  IF user_role_val IS NULL OR user_role_val NOT IN ('Главный Администратор', 'Администратор') THEN
    RAISE EXCEPTION 'Access denied: Insufficient permissions to delete stock movements';
  END IF;
  
  -- Check if movement exists
  SELECT EXISTS(SELECT 1 FROM public.stock_movements WHERE id = p_movement_id) INTO movement_exists;
  
  IF NOT movement_exists THEN
    RAISE EXCEPTION 'Stock movement with ID % not found', p_movement_id;
  END IF;
  
  -- Delete the stock movement
  DELETE FROM public.stock_movements WHERE id = p_movement_id;
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  -- Return success result
  RETURN jsonb_build_object(
    'success', true,
    'movement_id', p_movement_id,
    'deleted_count', deleted_count,
    'user_role', user_role_val
  );
END;
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION public.delete_stock_movement(INTEGER) TO authenticated;