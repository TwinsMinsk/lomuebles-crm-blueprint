
import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { LeadWithProfile } from "./LeadTableRow";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Tables } from "@/integrations/supabase/types";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

// Define lead sources
const leadSources = [
  "Веб-сайт Tilda",
  "Телефонный звонок",
  "Email-рассылка",
  "Партнер",
  "Мероприятие",
  "Другое",
];

// Define client languages
const clientLanguages = ["ES", "EN", "RU"];

// Define lead statuses
const leadStatuses = [
  "Новый",
  "В обработке",
  "Квалифицирован",
  "Некачественный лид",
  "Конвертирован",
];

const formSchema = z.object({
  name: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Неверный формат email").optional().or(z.literal("")),
  lead_source: z.string().optional(),
  client_language: z.enum(["ES", "EN", "RU"] as const),
  lead_status: z.string().default("Новый"),
  initial_comment: z.string().optional(),
  assigned_user_id: z.string().uuid().optional().or(z.literal("")),
});

export type LeadFormData = z.infer<typeof formSchema>;

interface LeadFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead?: LeadWithProfile;
  onSuccess: () => void;
}

interface UserProfile {
  id: string;
  full_name: string;
  role: string;
}

const LeadFormModal: React.FC<LeadFormModalProps> = ({
  isOpen,
  onClose,
  lead,
  onSuccess,
}) => {
  const { toast } = useToast();
  const [users, setUsers] = React.useState<UserProfile[]>([]);
  const [loading, setLoading] = React.useState(false);

  // Fetch users that can be assigned to leads (managers and admins)
  React.useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, role")
        .in("role", ["Менеджер", "Администратор", "Главный Администратор"]);

      if (error) {
        console.error("Error fetching users:", error);
        return;
      }

      if (data) {
        setUsers(data as UserProfile[]);
      }
    };

    fetchUsers();
  }, []);

  const form = useForm<LeadFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: lead?.name || "",
      phone: lead?.phone || "",
      email: lead?.email || "",
      lead_source: lead?.lead_source || "",
      client_language: (lead?.client_language as "ES" | "EN" | "RU") || "ES",
      lead_status: lead?.lead_status || "Новый",
      initial_comment: lead?.initial_comment || "",
      assigned_user_id: lead?.assigned_user_id || "",
    },
  });

  const onSubmit = async (data: LeadFormData) => {
    setLoading(true);
    try {
      if (lead) {
        // Update existing lead
        const { error } = await supabase
          .from("leads")
          .update({
            name: data.name,
            phone: data.phone,
            email: data.email,
            lead_source: data.lead_source,
            client_language: data.client_language,
            lead_status: data.lead_status,
            initial_comment: data.initial_comment,
            assigned_user_id: data.assigned_user_id || null,
          })
          .eq("lead_id", lead.lead_id);

        if (error) {
          console.error("Error updating lead:", error);
          toast({
            title: "Ошибка",
            description: "Не удалось обновить лид",
            variant: "destructive",
          });
          return;
        }

        toast({
          title: "Успех",
          description: "Лид успешно обновлен",
        });
      } else {
        // Create new lead
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          toast({
            title: "Ошибка",
            description: "Пользователь не авторизован",
            variant: "destructive",
          });
          return;
        }

        const { error } = await supabase.from("leads").insert({
          name: data.name,
          phone: data.phone,
          email: data.email,
          lead_source: data.lead_source,
          client_language: data.client_language,
          lead_status: data.lead_status,
          initial_comment: data.initial_comment,
          assigned_user_id: data.assigned_user_id || null,
          creator_user_id: user.id,
          creation_date: new Date().toISOString(),
        });

        if (error) {
          console.error("Error creating lead:", error);
          toast({
            title: "Ошибка",
            description: "Не удалось создать лид",
            variant: "destructive",
          });
          return;
        }

        toast({
          title: "Успех",
          description: "Лид успешно создан",
        });
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error submitting lead form:", error);
      toast({
        title: "Ошибка",
        description: "Произошла ошибка при сохранении данных",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {lead ? "Редактировать лид" : "Добавить новый лид"}
          </DialogTitle>
          <DialogDescription>
            Заполните форму для {lead ? "обновления" : "создания"} лида
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 py-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Имя</FormLabel>
                  <FormControl>
                    <Input placeholder="Введите имя" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Телефон</FormLabel>
                  <FormControl>
                    <Input placeholder="Введите телефон" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="Введите email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lead_source"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Источник лида</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите источник" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {leadSources.map((source) => (
                        <SelectItem key={source} value={source}>
                          {source}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="client_language"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Язык клиента *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите язык" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {clientLanguages.map((language) => (
                        <SelectItem key={language} value={language}>
                          {language}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lead_status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Статус лида</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите статус" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {leadStatuses.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="initial_comment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Первоначальный комментарий</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Введите комментарий"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="assigned_user_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ответственный менеджер</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите менеджера" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="not_assigned">Не назначен</SelectItem>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.full_name || user.id}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
              >
                Отмена
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Сохранение..." : "Сохранить"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default LeadFormModal;
