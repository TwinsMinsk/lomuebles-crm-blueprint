
export interface TaskRelatedOrder {
  id: number;
  order_number: string;
  order_name?: string;
  order_type?: string;
  status?: string;
  final_amount?: number;
  payment_status?: string;
  delivery_address_full?: string;
  client_language?: string;
  closing_date?: string;
  client_name?: string;
  client_phone?: string;
  client_contact?: {
    contact_id: number;
    full_name: string;
    primary_phone?: string;
    primary_email?: string;
  };
  client_company?: {
    company_id: number;
    company_name: string;
    phone?: string;
    email?: string;
  };
}

export interface TaskRelatedContact {
  contact_id: number;
  full_name: string;
  primary_phone?: string;
  primary_email?: string;
  secondary_phone?: string;
  secondary_email?: string;
  nie?: string;
  notes?: string;
  formatted_address?: string;
  delivery_address?: {
    street?: string;
    number?: string;
    apartment?: string;
    city?: string;
    postal_code?: string;
    country?: string;
  };
  associated_company?: {
    company_id: number;
    company_name: string;
  };
}

export interface TaskRelatedLead {
  lead_id: number;
  name?: string;
  phone?: string;
  email?: string;
  lead_source?: string;
  lead_status?: string;
  client_language?: string;
  initial_comment?: string;
  creation_date?: string;
}

export interface TaskRelatedPartner {
  partner_manufacturer_id: number;
  company_name: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  specialization?: string;
  website?: string;
}

export interface TaskRelatedCustomRequest {
  custom_request_id: number;
  request_name?: string;
  client_description?: string;
  request_status?: string;
  desired_completion_date?: string;
  preliminary_cost?: number;
  desired_materials?: string;
  estimated_dimensions?: string;
}

export interface TaskRelatedEntities {
  order?: TaskRelatedOrder | null;
  contact?: TaskRelatedContact | null;
  lead?: TaskRelatedLead | null;
  partner?: TaskRelatedPartner | null;
  custom_request?: TaskRelatedCustomRequest | null;
}

export interface TaskRelatedDetailsResponse {
  task_id: number;
  task_name: string;
  description?: string;
  task_status: string;
  priority?: string;
  due_date?: string;
  main_source_type?: 'order' | 'contact' | 'lead' | 'partner' | 'custom_request' | null;
  related_entities: TaskRelatedEntities;
}
