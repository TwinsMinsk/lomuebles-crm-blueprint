
-- Drop the existing function first
DROP FUNCTION IF EXISTS get_tasks_with_custom_sort(INTEGER, INTEGER, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, UUID, BOOLEAN, BOOLEAN, DATE, DATE, UUID);

-- Create updated RPC function that includes related entity names
CREATE OR REPLACE FUNCTION get_tasks_with_custom_sort(
  p_page INTEGER DEFAULT 1,
  p_page_size INTEGER DEFAULT 10,
  p_sort_column TEXT DEFAULT 'due_date',
  p_sort_direction TEXT DEFAULT 'asc',
  p_search TEXT DEFAULT NULL,
  p_task_status TEXT DEFAULT NULL,
  p_task_type TEXT DEFAULT NULL,
  p_priority TEXT DEFAULT NULL,
  p_assigned_user_id UUID DEFAULT NULL,
  p_assigned_to_me BOOLEAN DEFAULT FALSE,
  p_created_by_me BOOLEAN DEFAULT FALSE,
  p_due_date_from DATE DEFAULT NULL,
  p_due_date_to DATE DEFAULT NULL,
  p_current_user_id UUID DEFAULT NULL
)
RETURNS TABLE(
  task_id INTEGER,
  task_name TEXT,
  description TEXT,
  task_type TEXT,
  task_status TEXT,
  priority TEXT,
  creation_date TIMESTAMPTZ,
  due_date TIMESTAMPTZ,
  completion_date TIMESTAMPTZ,
  creator_user_id UUID,
  assigned_task_user_id UUID,
  google_calendar_event_id TEXT,
  related_lead_id INTEGER,
  related_contact_id INTEGER,
  related_order_id INTEGER,
  related_custom_request_id INTEGER,
  related_partner_manufacturer_id INTEGER,
  related_lead_name TEXT,
  related_contact_name TEXT,
  related_order_number TEXT,
  related_partner_name TEXT,
  related_request_name TEXT,
  assigned_user_name TEXT,
  creator_user_name TEXT,
  total_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_offset INTEGER;
  v_query TEXT;
  v_count_query TEXT;
  v_where_conditions TEXT := '';
  v_order_clause TEXT;
  v_total_count BIGINT;
BEGIN
  -- Calculate offset
  v_offset := (p_page - 1) * p_page_size;
  
  -- Build WHERE conditions
  IF p_search IS NOT NULL AND p_search != '' THEN
    v_where_conditions := v_where_conditions || ' AND (t.task_name ILIKE ''%' || p_search || '%'' OR t.description ILIKE ''%' || p_search || '%'')';
  END IF;
  
  IF p_task_status IS NOT NULL THEN
    v_where_conditions := v_where_conditions || ' AND t.task_status = ''' || p_task_status || '''';
  END IF;
  
  IF p_task_type IS NOT NULL THEN
    v_where_conditions := v_where_conditions || ' AND t.task_type = ''' || p_task_type || '''';
  END IF;
  
  IF p_priority IS NOT NULL THEN
    v_where_conditions := v_where_conditions || ' AND t.priority = ''' || p_priority || '''';
  END IF;
  
  IF p_assigned_user_id IS NOT NULL THEN
    v_where_conditions := v_where_conditions || ' AND t.assigned_task_user_id = ''' || p_assigned_user_id || '''';
  ELSIF p_assigned_to_me AND p_created_by_me AND p_current_user_id IS NOT NULL THEN
    v_where_conditions := v_where_conditions || ' AND (t.assigned_task_user_id = ''' || p_current_user_id || ''' OR t.creator_user_id = ''' || p_current_user_id || ''')';
  ELSIF p_assigned_to_me AND p_current_user_id IS NOT NULL THEN
    v_where_conditions := v_where_conditions || ' AND t.assigned_task_user_id = ''' || p_current_user_id || '''';
  ELSIF p_created_by_me AND p_current_user_id IS NOT NULL THEN
    v_where_conditions := v_where_conditions || ' AND t.creator_user_id = ''' || p_current_user_id || '''';
  END IF;
  
  IF p_due_date_from IS NOT NULL AND p_due_date_to IS NOT NULL THEN
    v_where_conditions := v_where_conditions || ' AND t.due_date >= ''' || p_due_date_from || ''' AND t.due_date <= ''' || p_due_date_to || ' 23:59:59''';
  ELSIF p_due_date_from IS NOT NULL THEN
    v_where_conditions := v_where_conditions || ' AND t.due_date >= ''' || p_due_date_from || '''';
  ELSIF p_due_date_to IS NOT NULL THEN
    v_where_conditions := v_where_conditions || ' AND t.due_date <= ''' || p_due_date_to || ' 23:59:59''';
  END IF;
  
  -- Custom sorting logic: inactive tasks (Выполнена, Отменена) go to the end
  v_order_clause := 'ORDER BY ' ||
    'CASE WHEN t.task_status IN (''Выполнена'', ''Отменена'') THEN 1 ELSE 0 END, ';
  
  -- Add regular sorting
  IF p_sort_column = 'due_date' THEN
    v_order_clause := v_order_clause || 't.due_date';
  ELSIF p_sort_column = 'task_name' THEN
    v_order_clause := v_order_clause || 't.task_name';
  ELSIF p_sort_column = 'task_status' THEN
    v_order_clause := v_order_clause || 't.task_status';
  ELSIF p_sort_column = 'priority' THEN
    v_order_clause := v_order_clause || 't.priority';
  ELSIF p_sort_column = 'creation_date' THEN
    v_order_clause := v_order_clause || 't.creation_date';
  ELSE
    v_order_clause := v_order_clause || 't.due_date';
  END IF;
  
  IF p_sort_direction = 'desc' THEN
    v_order_clause := v_order_clause || ' DESC';
  ELSE
    v_order_clause := v_order_clause || ' ASC';
  END IF;
  
  -- Get total count first
  v_count_query := 'SELECT COUNT(*) FROM tasks t WHERE 1=1' || v_where_conditions;
  EXECUTE v_count_query INTO v_total_count;
  
  -- Build main query with JOINs to get related entity names
  v_query := 'SELECT t.task_id, t.task_name, t.description, t.task_type, t.task_status, t.priority, ' ||
             't.creation_date, t.due_date, t.completion_date, t.creator_user_id, t.assigned_task_user_id, ' ||
             't.google_calendar_event_id, t.related_lead_id, t.related_contact_id, t.related_order_id, ' ||
             't.related_custom_request_id, t.related_partner_manufacturer_id, ' ||
             'l.name as related_lead_name, ' ||
             'c.full_name as related_contact_name, ' ||
             'o.order_number as related_order_number, ' ||
             'pm.company_name as related_partner_name, ' ||
             'cr.request_name as related_request_name, ' ||
             'au.full_name as assigned_user_name, ' ||
             'cu.full_name as creator_user_name, ' ||
             v_total_count || ' as total_count ' ||
             'FROM tasks t ' ||
             'LEFT JOIN leads l ON t.related_lead_id = l.lead_id ' ||
             'LEFT JOIN contacts c ON t.related_contact_id = c.contact_id ' ||
             'LEFT JOIN orders o ON t.related_order_id = o.id ' ||
             'LEFT JOIN partners_manufacturers pm ON t.related_partner_manufacturer_id = pm.partner_manufacturer_id ' ||
             'LEFT JOIN custom_requests cr ON t.related_custom_request_id = cr.custom_request_id ' ||
             'LEFT JOIN profiles au ON t.assigned_task_user_id = au.id ' ||
             'LEFT JOIN profiles cu ON t.creator_user_id = cu.id ' ||
             'WHERE 1=1' || v_where_conditions || ' ' || v_order_clause ||
             ' LIMIT ' || p_page_size || ' OFFSET ' || v_offset;
  
  -- Execute and return results
  RETURN QUERY EXECUTE v_query;
END;
$$;
