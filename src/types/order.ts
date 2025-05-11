
import { z } from "zod";

// This schema defines the shape of an order in our system
export const orderSchema = z.object({
  id: z.number().optional(),
  orderNumber: z.string().optional(),
  orderName: z.string().optional(),
  orderType: z.enum(["Готовая мебель (Tilda)", "Мебель на заказ"]),
  status: z.string(),
  clientContactId: z.number(),
  clientCompanyId: z.number().optional().nullable(),
  sourceLeadId: z.number().optional().nullable(),
  assignedUserId: z.string().optional().nullable(),
  partnerManufacturerId: z.number().optional().nullable(),
  finalAmount: z.number().optional().nullable(),
  paymentStatus: z.enum(["Не оплачен", "Частично оплачен", "Оплачен полностью", "Возврат"]).optional().nullable(),
  deliveryAddressFull: z.string().optional().nullable(),
  notesHistory: z.string().optional().nullable(),
  attachedFilesOrderDocs: z.array(z.any()).optional().nullable(),
  closingDate: z.string().optional().nullable(),
  clientLanguage: z.enum(["ES", "EN", "RU"])
});

export type OrderFormValues = z.infer<typeof orderSchema>;

export type Order = {
  id: number;
  created_at: string;
  order_number: string;
  order_name: string | null;
  order_type: "Готовая мебель (Tilda)" | "Мебель на заказ";
  status: string;
  client_contact_id: number;
  client_company_id: number | null;
  source_lead_id: number | null;
  assigned_user_id: string | null;
  partner_manufacturer_id: number | null;
  final_amount: number | null;
  payment_status: string | null;
  delivery_address_full: string | null;
  notes_history: string | null;
  attached_files_order_docs: any[] | null;
  closing_date: string | null;
  creator_user_id: string;
  client_language: "ES" | "EN" | "RU";
  contact_name?: string;
  company_name?: string;
  assigned_user_name?: string;
};

export interface OrdersQueryParams {
  page?: number;
  pageSize?: number;
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
  filters?: {
    search?: string;
    orderType?: string;
    status?: string;
    clientLanguage?: string;
    dateFrom?: Date;
    dateTo?: Date;
    assignedToMe?: boolean;
    createdByMe?: boolean;
    assignedUserId?: string;
  };
}

export interface OrderItem {
  order_item_id: number;
  product_name_from_tilda: string;
  sku_from_tilda: string | null;
  quantity: number;
  price_per_item_from_tilda: number;
  total_item_price: number;
  link_to_product_on_tilda: string | null;
  parent_deal_order_id: number;
}
