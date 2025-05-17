
import { z } from "zod";

// Define interfaces for order-related types
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

// OrderItem interface for OrderItemsTable
export interface OrderItem {
  order_item_id: number;
  parent_deal_order_id: number;
  product_name_from_tilda: string;
  sku_from_tilda?: string | null;
  quantity: number;
  price_per_item_from_tilda: number;
  total_item_price: number;
  link_to_product_on_tilda?: string | null;
}

// Form schema for order editing
export const orderSchema = z.object({
  orderName: z.string().optional().nullable(),
  orderType: z.enum(["Готовая мебель (Tilda)", "Мебель на заказ"]),
  status: z.string(),
  clientContactId: z.number(),
  clientCompanyId: z.number().optional().nullable(),
  sourceLeadId: z.number().optional().nullable(),
  assignedUserId: z.string().optional().nullable(),
  partnerManufacturerId: z.number().optional().nullable(),
  finalAmount: z.number().optional().nullable(),
  paymentStatus: z.string().optional().nullable(),
  partialPaymentAmount: z.number().optional().nullable(),
  deliveryAddressFull: z.string().optional().nullable(),
  notesHistory: z.string().optional().nullable(),
  closingDate: z.string().optional().nullable(),
  clientLanguage: z.enum(["ES", "EN", "RU"]).default("RU")
});

// Values type for the order form
export type OrderFormValues = z.infer<typeof orderSchema>;
