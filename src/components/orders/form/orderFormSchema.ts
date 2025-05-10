
import * as z from "zod";

export const orderFormSchema = z.object({
  // Basic order information
  orderNumber: z.string().optional(),
  orderName: z.string().optional(),
  orderType: z.string({
    required_error: "Тип заказа обязателен",
  }),
  statusReadyMade: z.string().optional().nullable(),
  statusCustomMade: z.string().optional().nullable(),
  clientLanguage: z.string({
    required_error: "Язык клиента обязателен",
  }),

  // Related entities
  associatedContactId: z.number({
    required_error: "Выбор клиента обязателен",
  }),
  associatedCompanyId: z.number().optional().nullable(),
  sourceLeadId: z.number().optional().nullable(),
  assignedUserId: z.string().optional().nullable(),
  associatedPartnerManufacturerId: z.number().optional().nullable(),
  
  // Financial information
  finalAmount: z.number().optional().nullable(),
  paymentStatus: z.string().optional().nullable(),
  
  // Additional information
  deliveryAddressFull: z.string().optional(),
  notesHistory: z.string().optional(),
  attachedFilesOrderDocs: z.array(z.any()).optional().nullable(),
  closingDate: z.string().optional().nullable(),
  
  // These will be set automatically, not from form
  creatorUserId: z.string().optional().nullable(),
  creationDate: z.string().optional().nullable(),
});

export type OrderFormValues = z.infer<typeof orderFormSchema>;
