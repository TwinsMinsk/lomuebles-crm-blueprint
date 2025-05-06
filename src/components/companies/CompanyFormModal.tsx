
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Company } from "@/hooks/useCompanies";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/AuthContext";

// Define the form schema with Zod
const formSchema = z.object({
  company_name: z.string().min(1, "Название компании обязательно"),
  nif_cif: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Некорректный формат email").optional().or(z.literal("")),
  address: z.string().optional(),
  industry: z.string().optional(),
  owner_user_id: z.string().optional().nullable(),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const industryOptions = [
  { value: "Розничная торговля", label: "Розничная торговля" },
  { value: "Дизайн интерьера", label: "Дизайн интерьера" },
  { value: "Строительство", label: "Строительство" },
  { value: "Другое", label: "Другое" },
];

interface CompanyFormModalProps {
  company?: Company | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  users: Array<{ id: string; full_name: string }>;
}

const CompanyFormModal: React.FC<CompanyFormModalProps> = ({
  company,
  isOpen,
  onClose,
  onSuccess,
  users,
}) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const isEditing = !!company;

  // Setup form with default values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      company_name: company?.company_name || "",
      nif_cif: company?.nif_cif || "",
      phone: company?.phone || "",
      email: company?.email || "",
      address: company?.address || "",
      industry: company?.industry || "",
      owner_user_id: company?.owner_user_id || null,
      notes: company?.notes || "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    try {
      if (isEditing) {
        // Update existing company
        const { error } = await supabase
          .from("companies")
          .update(data)
          .eq("company_id", company.company_id);

        if (error) throw error;

        toast({
          title: "Компания обновлена",
          description: "Данные компании успешно обновлены",
        });
      } else {
        // Create new company
        const { error } = await supabase.from("companies").insert(data);

        if (error) throw error;

        toast({
          title: "Компания добавлена",
          description: "Новая компания успешно создана",
        });
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error saving company:", error);
      toast({
        title: "Ошибка",
        description: `Не удалось ${isEditing ? "обновить" : "создать"} компанию`,
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Редактирование компании" : "Добавление компании"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Измените данные компании и нажмите Сохранить"
              : "Заполните данные о новой компании"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="company_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Название компании *</FormLabel>
                  <FormControl>
                    <Input placeholder="Введите название компании" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="nif_cif"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>NIF/CIF</FormLabel>
                  <FormControl>
                    <Input placeholder="Введите NIF/CIF" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      <Input placeholder="Введите email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Адрес</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Введите полный адрес"
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="industry"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Отрасль</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите отрасль" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {industryOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
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
                name="owner_user_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ответственный менеджер</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value || ""}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите менеджера" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">Не назначен</SelectItem>
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
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Заметки</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Дополнительная информация о компании"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button variant="outline" type="button" onClick={onClose}>
                Отмена
              </Button>
              <Button type="submit">Сохранить</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CompanyFormModal;
