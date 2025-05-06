
import * as z from "zod";

// Define lead sources
export const leadSources = [
  "Веб-сайт Tilda",
  "Телефонный звонок",
  "Email-рассылка",
  "Партнер",
  "Мероприятие",
  "Другое",
];

// Define client languages
export const clientLanguages = ["ES", "EN", "RU"];

// Define lead statuses
export const leadStatuses = [
  "Новый",
  "В обработке",
  "Квалифицирован",
  "Некачественный лид",
  "Конвертирован",
];

export const formSchema = z.object({
  name: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Неверный формат email").optional().or(z.literal("")),
  lead_source: z.string().optional(),
  client_language: z.enum(["ES", "EN", "RU"] as const),
  lead_status: z.string().default("Новый"),
  initial_comment: z.string().optional(),
  assigned_user_id: z.string().uuid().optional().or(z.literal("not_assigned")),
});

export type LeadFormData = z.infer<typeof formSchema>;
