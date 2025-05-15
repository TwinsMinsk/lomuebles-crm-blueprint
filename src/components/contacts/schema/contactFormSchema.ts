
import * as z from "zod";

// Define validation schema
export const formSchema = z.object({
  full_name: z.string().min(1, { message: "ФИО обязательно" }),
  nie: z.string().optional(),
  primary_phone: z.string().optional(),
  secondary_phone: z.string().optional(),
  primary_email: z
    .string()
    .email({ message: "Неверный формат email" })
    .optional()
    .or(z.literal("")),
  secondary_email: z
    .string()
    .email({ message: "Неверный формат email" })
    .optional()
    .or(z.literal("")),
  delivery_address_street: z.string().optional(),
  delivery_address_number: z.string().optional(),
  delivery_address_apartment: z.string().optional(),
  delivery_address_city: z.string().optional(),
  delivery_address_postal_code: z.string().optional(),
  delivery_address_country: z.string().optional().default("Spain"),
  associated_company_id: z
    .number()
    .nullable()
    .or(
      z.string()
        .transform((val) => (val === "" || val === "null" ? null : Number(val)))
    ),
  owner_user_id: z
    .string()
    .nullable()
    .or(z.literal(""))
    .transform((val) => (val === "" || val === "null" ? null : val)),
  notes: z.string().optional(),
});

export type ContactFormValues = z.infer<typeof formSchema>;
