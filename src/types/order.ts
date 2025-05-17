
// We need to add the relational fields to the Order type
export interface Order {
  id: number;
  order_number: string;
  order_name: string | null;
  order_type: "Готовая мебель (Tilda)" | "Мебель на заказ";
  status: string;
  client_language: "ES" | "EN" | "RU";
  final_amount: number | null;
  partial_payment_amount: number | null;
  delivery_address_full: string | null;
  payment_status: string | null;
  notes_history: string | null;
  created_at: string;
  closing_date: string | null;
  
  // IDs for relations
  client_contact_id: number;
  client_company_id: number | null;
  creator_user_id: string;
  assigned_user_id: string | null;
  partner_manufacturer_id: number | null;
  source_lead_id: number | null;
  
  // File attachments
  attached_files_order_docs: any[];
  
  // Relational objects
  contact: {
    contact_id: number;
    full_name: string;
    primary_phone?: string | null;
    primary_email?: string | null;
  } | null;
  company: {
    company_id: number;
    company_name: string;
  } | null;
  creator: {
    id: string;
    full_name: string;
  };
  assigned_user: {
    id: string;
    full_name: string;
  } | null;
  partner_manufacturer: {
    partner_manufacturer_id: number;
    company_name: string;
  } | null;
  source_lead: {
    lead_id: number;
  } | null;
}
