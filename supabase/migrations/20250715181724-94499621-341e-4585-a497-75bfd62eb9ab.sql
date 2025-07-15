-- First, let's check the current RLS policies and fix the authentication issue
-- The problem appears to be that auth.uid() is returning null in the database context

-- Let's check what get_current_user_role() returns for debugging
DO $$
BEGIN
  RAISE NOTICE 'Checking current RLS setup...';
END $$;

-- Drop the problematic policies and recreate them with better error handling
DROP POLICY IF EXISTS "Admins can delete stock movements" ON public.stock_movements;
DROP POLICY IF EXISTS "Admins can insert stock movements" ON public.stock_movements;
DROP POLICY IF EXISTS "Admins can update stock movements" ON public.stock_movements;
DROP POLICY IF EXISTS "Admins can view all stock movements" ON public.stock_movements;

-- Create a debug function to check auth state
CREATE OR REPLACE FUNCTION public.debug_auth_state()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'auth_uid', auth.uid(),
    'auth_role', auth.role(),
    'current_user', current_user,
    'user_role', get_current_user_role(),
    'session_user', session_user
  ) INTO result;
  
  RETURN result;
END;
$$;

-- Create comprehensive RLS policies for stock_movements with better debugging
CREATE POLICY "Admins can view all stock movements" 
ON public.stock_movements 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL AND
  get_current_user_role() = ANY (ARRAY['Главный Администратор'::text, 'Администратор'::text])
);

CREATE POLICY "Admins can insert stock movements" 
ON public.stock_movements 
FOR INSERT 
WITH CHECK (
  auth.uid() IS NOT NULL AND
  get_current_user_role() = ANY (ARRAY['Главный Администратор'::text, 'Администратор'::text])
);

CREATE POLICY "Admins can update stock movements" 
ON public.stock_movements 
FOR UPDATE 
USING (
  auth.uid() IS NOT NULL AND
  get_current_user_role() = ANY (ARRAY['Главный Администратор'::text, 'Администратор'::text])
);

CREATE POLICY "Admins can delete stock movements" 
ON public.stock_movements 
FOR DELETE 
USING (
  auth.uid() IS NOT NULL AND
  get_current_user_role() = ANY (ARRAY['Главный Администратор'::text, 'Администратор'::text])
);

-- Let's also create a function to help with debugging stock movement operations
CREATE OR REPLACE FUNCTION public.can_delete_stock_movement(movement_id integer)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
  user_role_val text;
  auth_uid_val uuid;
BEGIN
  auth_uid_val := auth.uid();
  user_role_val := get_current_user_role();
  
  SELECT jsonb_build_object(
    'movement_id', movement_id,
    'auth_uid', auth_uid_val,
    'user_role', user_role_val,
    'can_delete', (
      auth_uid_val IS NOT NULL AND
      user_role_val = ANY (ARRAY['Главный Администратор'::text, 'Администратор'::text])
    ),
    'movement_exists', EXISTS(SELECT 1 FROM public.stock_movements WHERE id = movement_id)
  ) INTO result;
  
  RETURN result;
END;
$$;