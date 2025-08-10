-- Secure RPCs and storage policies
-- 1) Restrict get_sorted_tasks to return only permitted tasks
CREATE OR REPLACE FUNCTION public.get_sorted_tasks()
RETURNS TABLE(
  task_id integer, task_name text, description text, task_type text, task_status text, priority text,
  creation_date timestamp with time zone, due_date timestamp with time zone, completion_date timestamp with time zone,
  creator_user_id uuid, assigned_task_user_id uuid, google_calendar_event_id text,
  related_lead_id integer, related_contact_id integer, related_order_id integer, related_custom_request_id integer, related_partner_manufacturer_id integer,
  assigned_user_name text, creator_user_name text
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO public
AS $$
  WITH user_ctx AS (
    SELECT public.get_current_user_role() AS role, auth.uid() AS uid
  )
  SELECT 
    t.task_id, t.task_name, t.description, t.task_type, t.task_status, t.priority,
    t.creation_date, t.due_date, t.completion_date, t.creator_user_id, t.assigned_task_user_id,
    t.google_calendar_event_id, t.related_lead_id, t.related_contact_id, t.related_order_id,
    t.related_custom_request_id, t.related_partner_manufacturer_id,
    assigned_prof.full_name AS assigned_user_name,
    creator_prof.full_name AS creator_user_name
  FROM public.tasks t
  LEFT JOIN public.profiles assigned_prof ON t.assigned_task_user_id = assigned_prof.id
  LEFT JOIN public.profiles creator_prof ON t.creator_user_id = creator_prof.id
  CROSS JOIN user_ctx
  WHERE (
    user_ctx.role IN ('Главный Администратор','Администратор','Менеджер')
    OR (user_ctx.role = 'Специалист' AND t.assigned_task_user_id = user_ctx.uid)
    OR (t.creator_user_id = user_ctx.uid OR t.assigned_task_user_id = user_ctx.uid)
  )
  ORDER BY
    CASE t.task_status
      WHEN 'Просрочена' THEN 1
      WHEN 'Новая' THEN 2
      WHEN 'В работе' THEN 3
      WHEN 'Выполнена' THEN 4
      WHEN 'Отменена' THEN 5
      ELSE 6
    END ASC,
    t.due_date ASC NULLS LAST,
    t.creation_date DESC;
$$;

-- 2) Harden get_task_related_details: use auth.uid() instead of external param
CREATE OR REPLACE FUNCTION public.get_task_related_details(p_task_id integer)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_user_role TEXT;
  v_task_record RECORD;
  v_result JSON := '{}';
  v_related_data JSON := '{}';
  v_main_source_type TEXT := NULL;
  v_order_data JSON;
  v_contact_data JSON;
  v_lead_data JSON;
  v_partner_data JSON;
  v_request_data JSON;
  v_uid uuid := auth.uid();
BEGIN
  -- Get user role of current user
  SELECT public.get_current_user_role() INTO v_user_role;
  IF v_user_role IS NULL OR v_uid IS NULL THEN
    RAISE EXCEPTION 'User not found or not authenticated';
  END IF;

  -- Get task details
  SELECT * INTO v_task_record FROM public.tasks WHERE task_id = p_task_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Task not found';
  END IF;

  -- Check access permissions
  IF v_user_role = 'Специалист' THEN
    IF v_task_record.assigned_task_user_id != v_uid THEN
      RAISE EXCEPTION 'Access denied: Task not assigned to user';
    END IF;
  ELSIF v_user_role NOT IN ('Главный Администратор', 'Администратор', 'Менеджер') THEN
    -- Other roles must be creator or assignee
    IF v_task_record.creator_user_id != v_uid AND v_task_record.assigned_task_user_id != v_uid THEN
      RAISE EXCEPTION 'Access denied: Insufficient permissions';
    END IF;
  END IF;

  -- Determine main source type based on priority
  IF v_task_record.related_order_id IS NOT NULL THEN
    v_main_source_type := 'order';
  ELSIF v_task_record.related_contact_id IS NOT NULL THEN
    v_main_source_type := 'contact';
  ELSIF v_task_record.related_lead_id IS NOT NULL THEN
    v_main_source_type := 'lead';
  ELSIF v_task_record.related_partner_manufacturer_id IS NOT NULL THEN
    v_main_source_type := 'partner';
  ELSIF v_task_record.related_custom_request_id IS NOT NULL THEN
    v_main_source_type := 'custom_request';
  END IF;

  -- Related data fetching (unchanged business logic from previous version), with role-sensitive fields
  -- Order
  IF v_task_record.related_order_id IS NOT NULL THEN
    IF v_user_role IN ('Главный Администратор', 'Администратор') THEN
      SELECT json_build_object(
        'id', o.id,
        'order_number', o.order_number,
        'order_name', o.order_name,
        'order_type', o.order_type,
        'status', o.status,
        'final_amount', o.final_amount,
        'payment_status', o.payment_status,
        'delivery_address_full', o.delivery_address_full,
        'client_language', o.client_language,
        'closing_date', o.closing_date,
        'client_contact', CASE 
          WHEN c.contact_id IS NOT NULL THEN json_build_object(
            'contact_id', c.contact_id,
            'full_name', c.full_name,
            'primary_phone', c.primary_phone,
            'primary_email', c.primary_email
          )
          ELSE NULL
        END,
        'client_company', CASE 
          WHEN comp.company_id IS NOT NULL THEN json_build_object(
            'company_id', comp.company_id,
            'company_name', comp.company_name,
            'phone', comp.phone,
            'email', comp.email
          )
          ELSE NULL
        END
      )
      INTO v_order_data
      FROM public.orders o
      LEFT JOIN public.contacts c ON o.client_contact_id = c.contact_id
      LEFT JOIN public.companies comp ON o.client_company_id = comp.company_id
      WHERE o.id = v_task_record.related_order_id;
    ELSE
      SELECT json_build_object(
        'id', o.id,
        'order_number', o.order_number,
        'delivery_address_full', o.delivery_address_full,
        'client_language', o.client_language,
        'client_name', COALESCE(c.full_name, comp.company_name),
        'client_phone', COALESCE(c.primary_phone, comp.phone)
      )
      INTO v_order_data
      FROM public.orders o
      LEFT JOIN public.contacts c ON o.client_contact_id = c.contact_id
      LEFT JOIN public.companies comp ON o.client_company_id = comp.company_id
      WHERE o.id = v_task_record.related_order_id;
    END IF;
  END IF;

  -- Contact
  IF v_task_record.related_contact_id IS NOT NULL THEN
    IF v_user_role IN ('Главный Администратор', 'Администратор') THEN
      SELECT json_build_object(
        'contact_id', c.contact_id,
        'full_name', c.full_name,
        'primary_phone', c.primary_phone,
        'primary_email', c.primary_email,
        'secondary_phone', c.secondary_phone,
        'secondary_email', c.secondary_email,
        'nie', c.nie,
        'notes', c.notes,
        'delivery_address', json_build_object(
          'street', c.delivery_address_street,
          'number', c.delivery_address_number,
          'apartment', c.delivery_address_apartment,
          'city', c.delivery_address_city,
          'postal_code', c.delivery_address_postal_code,
          'country', c.delivery_address_country
        ),
        'associated_company', CASE 
          WHEN comp.company_id IS NOT NULL THEN json_build_object(
            'company_id', comp.company_id,
            'company_name', comp.company_name
          )
          ELSE NULL
        END
      )
      INTO v_contact_data
      FROM public.contacts c
      LEFT JOIN public.companies comp ON c.associated_company_id = comp.company_id
      WHERE c.contact_id = v_task_record.related_contact_id;
    ELSE
      SELECT json_build_object(
        'contact_id', c.contact_id,
        'full_name', c.full_name,
        'primary_phone', c.primary_phone,
        'primary_email', c.primary_email,
        'formatted_address', CONCAT_WS(', ',
          NULLIF(CONCAT_WS(' ', c.delivery_address_street, c.delivery_address_number), ''),
          NULLIF(c.delivery_address_apartment, ''),
          NULLIF(c.delivery_address_city, ''),
          NULLIF(c.delivery_address_postal_code, ''),
          NULLIF(c.delivery_address_country, '')
        )
      )
      INTO v_contact_data
      FROM public.contacts c
      WHERE c.contact_id = v_task_record.related_contact_id;
    END IF;
  END IF;

  -- Lead
  IF v_task_record.related_lead_id IS NOT NULL THEN
    IF v_user_role IN ('Главный Администратор', 'Администратор') THEN
      SELECT json_build_object(
        'lead_id', l.lead_id,
        'name', l.name,
        'phone', l.phone,
        'email', l.email,
        'lead_source', l.lead_source,
        'lead_status', l.lead_status,
        'client_language', l.client_language,
        'initial_comment', l.initial_comment,
        'creation_date', l.creation_date
      )
      INTO v_lead_data
      FROM public.leads l
      WHERE l.lead_id = v_task_record.related_lead_id;
    ELSE
      SELECT json_build_object(
        'lead_id', l.lead_id,
        'name', l.name,
        'phone', l.phone,
        'email', l.email
      )
      INTO v_lead_data
      FROM public.leads l
      WHERE l.lead_id = v_task_record.related_lead_id;
    END IF;
  END IF;

  -- Partner
  IF v_task_record.related_partner_manufacturer_id IS NOT NULL THEN
    SELECT json_build_object(
      'partner_manufacturer_id', p.partner_manufacturer_id,
      'company_name', p.company_name,
      'contact_person', p.contact_person,
      'phone', p.phone,
      'email', p.email,
      'specialization', p.specialization,
      'website', p.website
    )
    INTO v_partner_data
    FROM public.partners_manufacturers p
    WHERE p.partner_manufacturer_id = v_task_record.related_partner_manufacturer_id;
  END IF;

  -- Custom request
  IF v_task_record.related_custom_request_id IS NOT NULL THEN
    SELECT json_build_object(
      'custom_request_id', cr.custom_request_id,
      'request_name', cr.request_name,
      'client_description', cr.client_description,
      'request_status', cr.request_status,
      'desired_completion_date', cr.desired_completion_date,
      'preliminary_cost', cr.preliminary_cost,
      'desired_materials', cr.desired_materials,
      'estimated_dimensions', cr.estimated_dimensions
    )
    INTO v_request_data
    FROM public.custom_requests cr
    WHERE cr.custom_request_id = v_task_record.related_custom_request_id;
  END IF;

  v_related_data := json_build_object(
    'order', v_order_data,
    'contact', v_contact_data,
    'lead', v_lead_data,
    'partner', v_partner_data,
    'custom_request', v_request_data
  );

  v_result := json_build_object(
    'task_id', v_task_record.task_id,
    'task_name', v_task_record.task_name,
    'description', v_task_record.description,
    'task_status', v_task_record.task_status,
    'priority', v_task_record.priority,
    'due_date', v_task_record.due_date,
    'main_source_type', v_main_source_type,
    'related_entities', v_related_data
  );
  RETURN v_result;
END;
$$;

-- 3) Authorize reserve_materials_from_estimate by role and ownership
CREATE OR REPLACE FUNCTION public.reserve_materials_from_estimate(p_estimate_id integer)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public, pg_temp
AS $$
DECLARE
  v_order_id INTEGER;
  v_estimate_record RECORD;
  v_item_record RECORD;
  v_reserved_count INTEGER := 0;
  v_result jsonb;
  v_role TEXT := public.get_current_user_role();
  v_uid uuid := auth.uid();
  v_allowed BOOLEAN := FALSE;
BEGIN
  -- Access control
  IF v_role IN ('Главный Администратор','Администратор') THEN
    v_allowed := TRUE;
  ELSIF v_role = 'Менеджер' THEN
    SELECT TRUE INTO v_allowed
    FROM public.estimates e
    JOIN public.orders o ON o.id = e.order_id
    WHERE e.id = p_estimate_id AND (o.assigned_user_id = v_uid OR o.creator_user_id = v_uid)
    LIMIT 1;
    v_allowed := COALESCE(v_allowed, FALSE);
  ELSE
    v_allowed := FALSE;
  END IF;

  IF NOT v_allowed THEN
    RAISE EXCEPTION 'Access denied: insufficient permissions to reserve materials';
  END IF;

  -- Existing business logic
  SELECT e.order_id, e.status INTO v_estimate_record
  FROM public.estimates e
  WHERE e.id = p_estimate_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Estimate with ID % not found', p_estimate_id;
  END IF;
  IF v_estimate_record.status != 'утверждена' THEN
    RAISE EXCEPTION 'Can only reserve materials from approved estimates. Current status: %', v_estimate_record.status;
  END IF;
  v_order_id := v_estimate_record.order_id;

  DELETE FROM public.material_reservations WHERE order_id = v_order_id;

  FOR v_item_record IN 
    SELECT ei.material_id, ei.quantity_needed
    FROM public.estimate_items ei
    WHERE ei.estimate_id = p_estimate_id
  LOOP
    INSERT INTO public.material_reservations (
      material_id, order_id, quantity_reserved, created_at, updated_at
    ) VALUES (
      v_item_record.material_id, v_order_id, v_item_record.quantity_needed, now(), now()
    );
    v_reserved_count := v_reserved_count + 1;
  END LOOP;

  v_result := jsonb_build_object(
    'success', true,
    'estimate_id', p_estimate_id,
    'order_id', v_order_id,
    'materials_reserved', v_reserved_count,
    'message', format('Successfully reserved %s materials for order %s', v_reserved_count, v_order_id)
  );
  RETURN v_result;
END;
$$;

-- 4) Secure storage buckets and policies
-- Ensure buckets exist and are private
INSERT INTO storage.buckets (id, name, public)
VALUES ('order_files','order_files', false)
ON CONFLICT (id) DO UPDATE SET public = false;

INSERT INTO storage.buckets (id, name, public)
VALUES ('crm_files','crm_files', false)
ON CONFLICT (id) DO UPDATE SET public = false;

-- Policies for order_files
DO $$ BEGIN
  -- SELECT policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Order files: view if related to order or admin'
  ) THEN
    CREATE POLICY "Order files: view if related to order or admin"
    ON storage.objects
    FOR SELECT
    USING (
      bucket_id = 'order_files'
      AND (
        public.get_current_user_role() = ANY (ARRAY['Главный Администратор','Администратор'])
        OR EXISTS (
          SELECT 1 FROM public.orders o
          WHERE o.id = ((storage.foldername(name))[2])::int
          AND (o.assigned_user_id = auth.uid() OR o.creator_user_id = auth.uid())
        )
      )
    );
  END IF;

  -- INSERT policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Order files: users can upload to own folder'
  ) THEN
    CREATE POLICY "Order files: users can upload to own folder"
    ON storage.objects
    FOR INSERT
    WITH CHECK (
      bucket_id = 'order_files'
      AND (auth.uid()::text = (storage.foldername(name))[1])
    );
  END IF;

  -- UPDATE policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Order files: update by admin or owner'
  ) THEN
    CREATE POLICY "Order files: update by admin or owner"
    ON storage.objects
    FOR UPDATE
    USING (
      bucket_id = 'order_files'
      AND (
        public.get_current_user_role() = ANY (ARRAY['Главный Администратор','Администратор'])
        OR auth.uid()::text = (storage.foldername(name))[1]
      )
    )
    WITH CHECK (
      bucket_id = 'order_files'
      AND (
        public.get_current_user_role() = ANY (ARRAY['Главный Администратор','Администратор'])
        OR auth.uid()::text = (storage.foldername(name))[1]
      )
    );
  END IF;

  -- DELETE policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Order files: delete by admin or owner'
  ) THEN
    CREATE POLICY "Order files: delete by admin or owner"
    ON storage.objects
    FOR DELETE
    USING (
      bucket_id = 'order_files'
      AND (
        public.get_current_user_role() = ANY (ARRAY['Главный Администратор','Администратор'])
        OR auth.uid()::text = (storage.foldername(name))[1]
      )
    );
  END IF;
END $$;

-- Policies for crm_files (generic): allow admins or uploader to view/manage
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'CRM files: select by admin or uploader'
  ) THEN
    CREATE POLICY "CRM files: select by admin or uploader"
    ON storage.objects
    FOR SELECT
    USING (
      bucket_id = 'crm_files'
      AND (
        public.get_current_user_role() = ANY (ARRAY['Главный Администратор','Администратор'])
        OR auth.uid()::text = (storage.foldername(name))[2]
      )
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'CRM files: insert by uploader'
  ) THEN
    CREATE POLICY "CRM files: insert by uploader"
    ON storage.objects
    FOR INSERT
    WITH CHECK (
      bucket_id = 'crm_files'
      AND auth.uid()::text = (storage.foldername(name))[2]
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'CRM files: update by admin or uploader'
  ) THEN
    CREATE POLICY "CRM files: update by admin or uploader"
    ON storage.objects
    FOR UPDATE
    USING (
      bucket_id = 'crm_files'
      AND (
        public.get_current_user_role() = ANY (ARRAY['Главный Администратор','Администратор'])
        OR auth.uid()::text = (storage.foldername(name))[2]
      )
    )
    WITH CHECK (
      bucket_id = 'crm_files'
      AND (
        public.get_current_user_role() = ANY (ARRAY['Главный Администратор','Администратор'])
        OR auth.uid()::text = (storage.foldername(name))[2]
      )
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'CRM files: delete by admin or uploader'
  ) THEN
    CREATE POLICY "CRM files: delete by admin or uploader"
    ON storage.objects
    FOR DELETE
    USING (
      bucket_id = 'crm_files'
      AND (
        public.get_current_user_role() = ANY (ARRAY['Главный Администратор','Администратор'])
        OR auth.uid()::text = (storage.foldername(name))[2]
      )
    );
  END IF;
END $$;