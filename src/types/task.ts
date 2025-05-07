
export interface Task {
  task_id: number;
  task_name: string;
  description?: string;
  task_type?: string;
  task_status: string;
  priority?: string;
  creation_date: string;
  due_date?: string | null;
  completion_date?: string | null;
  creator_user_id?: string;
  creator_user_name?: string;
  assigned_task_user_id: string;
  assigned_user_name?: string;
  google_calendar_event_id?: string;
  related_lead_id?: number;
  related_lead_name?: string;
  related_contact_id?: number;
  related_contact_name?: string;
  related_deal_order_id?: number;
  related_order_number?: string;
  related_custom_request_id?: number;
  related_request_name?: string;
  related_partner_manufacturer_id?: number;
  related_partner_name?: string;
}

export interface TasksQueryParams {
  page: number;
  pageSize: number;
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
  filters?: TaskFiltersType;
}

export interface TaskFiltersType {
  search?: string | null;
  taskStatus?: string | null;
  taskType?: string | null;
  priority?: string | null;
  assignedToMe?: boolean;
  createdByMe?: boolean;
  viewType?: 'my' | 'all';
}
