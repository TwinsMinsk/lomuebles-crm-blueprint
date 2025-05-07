
import { z } from "zod";

export const taskFormSchema = z.object({
  task_name: z.string().min(1, { message: "Название задачи обязательно" }),
  description: z.string().optional(),
  task_type: z.string().optional(),
  task_status: z.string().default("Новая"),
  priority: z.string().default("Средний"),
  due_date: z.date().nullable().optional(),
  assigned_task_user_id: z.string().min(1, { message: "Ответственный исполнитель обязателен" }),
  related_lead_id: z.number().optional().nullable(),
  related_contact_id: z.number().optional().nullable(),
  related_deal_order_id: z.number().optional().nullable(),
  related_partner_manufacturer_id: z.number().optional().nullable(),
  related_custom_request_id: z.number().optional().nullable(),
});

export type TaskFormValues = z.infer<typeof taskFormSchema>;

export const taskTypeOptions = [
  { label: "Звонок", value: "Звонок" },
  { label: "Встреча", value: "Встреча" },
  { label: "Замер", value: "Замер" },
  { label: "Подготовка КП", value: "Подготовка КП" },
  { label: "Дизайн", value: "Дизайн" },
  { label: "Монтаж", value: "Монтаж" },
  { label: "Другое", value: "Другое" }
];

export const taskStatusOptions = [
  { label: "Новая", value: "Новая" },
  { label: "В работе", value: "В работе" },
  { label: "Ожидает", value: "Ожидает" },
  { label: "Выполнена", value: "Выполнена" },
  { label: "Отменена", value: "Отменена" }
];

export const priorityOptions = [
  { label: "Низкий", value: "Низкий" },
  { label: "Средний", value: "Средний" },
  { label: "Высокий", value: "Высокий" },
  { label: "Срочно", value: "Срочно" }
];
