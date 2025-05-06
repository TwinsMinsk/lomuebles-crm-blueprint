
import * as z from "zod";

// Define the form schema with Zod
export const companyFormSchema = z.object({
  company_name: z.string().min(1, "Название компании обязательно"),
  nif_cif: z.string().optional(),
  phone: z.string()
    .optional()
    .refine(val => !val || /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,10}[-\s.]?[0-9]{1,10}$/.test(val), {
      message: "Введите корректный номер телефона"
    }),
  email: z.string().email("Некорректный формат email").optional().or(z.literal("")),
  address: z.string().optional(),
  industry: z.string().optional(),
  owner_user_id: z.string().optional().nullable(),
  notes: z.string().optional(),
});

export type CompanyFormValues = z.infer<typeof companyFormSchema>;

export const industryOptions = [
  { value: "Розничная торговля", label: "Розничная торговля" },
  { value: "Дизайн интерьера", label: "Дизайн интерьера" },
  { value: "Строительство", label: "Строительство" },
  { value: "Другое", label: "Другое" },
];
