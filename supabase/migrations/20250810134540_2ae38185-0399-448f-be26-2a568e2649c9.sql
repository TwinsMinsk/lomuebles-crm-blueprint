-- Revert storage buckets to public for immediate file accessibility
UPDATE storage.buckets
SET public = true
WHERE id IN ('order_files', 'crm_files');

-- Backward-compatible wrapper for get_task_related_details
-- Keeps older frontend calls (with p_user_id) working by delegating to the new 1-arg version
CREATE OR REPLACE FUNCTION public.get_task_related_details(
  p_task_id integer,
  p_user_id uuid
)
RETURNS json
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Delegate to the 1-argument version
  RETURN public.get_task_related_details(p_task_id);
END;
$$;