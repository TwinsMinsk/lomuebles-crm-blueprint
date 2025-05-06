
import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { ContactWithRelations } from "./ContactTableRow";

interface ContactFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  contactToEdit?: ContactWithRelations;
  onContactSaved: () => void;
}

// Define validation schema
const contactFormSchema = z.object({
  full_name: z.string().min(1, { message: "ФИО обязательно" }),
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
    .string()
    .nullable()
    .transform((val) => (val === "" || val === "null" ? null : Number(val))),
  owner_user_id: z
    .string()
    .nullable()
    .transform((val) => (val === "" || val === "null" ? null : val)),
  notes: z.string().optional(),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

// Define company and user types
type Company = {
  company_id: number;
  company_name: string;
};

type User = {
  id: string;
  full_name: string;
};

const ContactFormModal: React.FC<ContactFormModalProps> = ({
  isOpen,
  onClose,
  contactToEdit,
  onContactSaved,
}) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  // Initialize form with default values
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      full_name: "",
      primary_phone: "",
      secondary_phone: "",
      primary_email: "",
      secondary_email: "",
      delivery_address_street: "",
      delivery_address_number: "",
      delivery_address_apartment: "",
      delivery_address_city: "",
      delivery_address_postal_code: "",
      delivery_address_country: "Spain",
      associated_company_id: null,
      owner_user_id: null,
      notes: "",
    },
  });

  // Fetch companies and users when component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch companies
        const { data: companiesData, error: companiesError } = await supabase
          .from("companies")
          .select("company_id, company_name")
          .order("company_name");

        if (companiesError) throw companiesError;
        setCompanies(companiesData || []);

        // Fetch users (with roles that can manage contacts)
        const { data: usersData, error: usersError } = await supabase
          .from("profiles")
          .select("id, full_name, role")
          .in("role", ["Главный Администратор", "Администратор", "Менеджер"])
          .order("full_name");

        if (usersError) throw usersError;
        setUsers(usersData || []);
      } catch (err) {
        console.error("Error fetching form data:", err);
        toast.error("Ошибка при загрузке данных формы");
      }
    };

    fetchData();
  }, []);

  // Set form values when editing a contact
  useEffect(() => {
    if (contactToEdit) {
      form.reset({
        full_name: contactToEdit.full_name || "",
        primary_phone: contactToEdit.primary_phone || "",
        secondary_phone: contactToEdit.secondary_phone || "",
        primary_email: contactToEdit.primary_email || "",
        secondary_email: contactToEdit.secondary_email || "",
        delivery_address_street: contactToEdit.delivery_address_street || "",
        delivery_address_number: contactToEdit.delivery_address_number || "",
        delivery_address_apartment: contactToEdit.delivery_address_apartment || "",
        delivery_address_city: contactToEdit.delivery_address_city || "",
        delivery_address_postal_code: contactToEdit.delivery_address_postal_code || "",
        delivery_address_country: contactToEdit.delivery_address_country || "Spain",
        associated_company_id: contactToEdit.associated_company_id,
        owner_user_id: contactToEdit.owner_user_id || null,
        notes: contactToEdit.notes || "",
      });
    } else {
      // Reset form when adding a new contact
      form.reset({
        full_name: "",
        primary_phone: "",
        secondary_phone: "",
        primary_email: "",
        secondary_email: "",
        delivery_address_street: "",
        delivery_address_number: "",
        delivery_address_apartment: "",
        delivery_address_city: "",
        delivery_address_postal_code: "",
        delivery_address_country: "Spain",
        associated_company_id: null,
        owner_user_id: user?.id || null,
        notes: "",
      });
    }
  }, [contactToEdit, form, user]);

  const onSubmit = async (values: ContactFormValues) => {
    try {
      setLoading(true);
      
      // Ensure full_name is present since it's required
      if (!values.full_name) {
        toast.error("ФИО обязательно для заполнения");
        return;
      }
      
      // Create a typed object that matches the expected Supabase structure
      const contactData = {
        full_name: values.full_name,
        primary_phone: values.primary_phone,
        secondary_phone: values.secondary_phone,
        primary_email: values.primary_email,
        secondary_email: values.secondary_email,
        delivery_address_street: values.delivery_address_street,
        delivery_address_number: values.delivery_address_number,
        delivery_address_apartment: values.delivery_address_apartment,
        delivery_address_city: values.delivery_address_city,
        delivery_address_postal_code: values.delivery_address_postal_code,
        delivery_address_country: values.delivery_address_country,
        associated_company_id: values.associated_company_id,
        owner_user_id: values.owner_user_id,
        notes: values.notes,
        creator_user_id: contactToEdit ? undefined : user?.id
      };
      
      let result;
      
      if (contactToEdit) {
        // Update existing contact
        result = await supabase
          .from("contacts")
          .update(contactData)
          .eq("contact_id", contactToEdit.contact_id);
      } else {
        // Insert new contact
        result = await supabase
          .from("contacts")
          .insert(contactData);
      }
      
      const { error } = result;
      
      if (error) throw error;
      
      toast.success(
        contactToEdit
          ? "Контакт успешно обновлен"
          : "Контакт успешно создан"
      );
      
      onContactSaved();
      onClose();
    } catch (err) {
      console.error("Error saving contact:", err);
      toast.error(
        contactToEdit
          ? "Ошибка при обновлении контакта"
          : "Ошибка при создании контакта"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {contactToEdit ? "Редактировать контакт" : "Добавить новый контакт"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs defaultValue="main" className="w-full">
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="main">Основные данные</TabsTrigger>
                <TabsTrigger value="address">Адрес доставки</TabsTrigger>
                <TabsTrigger value="additional">Дополнительно</TabsTrigger>
              </TabsList>

              {/* Main Information Tab */}
              <TabsContent value="main" className="space-y-4">
                <FormField
                  control={form.control}
                  name="full_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ФИО *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Иванов Иван Иванович" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="primary_phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Основной телефон</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="+34 600 000 000" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="secondary_phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Дополнительный телефон</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="+34 600 000 000" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="primary_email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Основной email</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="email@example.com" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="secondary_email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Дополнительный email</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="email@example.com" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>

              {/* Address Tab */}
              <TabsContent value="address" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="delivery_address_street"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Улица</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Calle Example" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="delivery_address_number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Номер дома</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="123" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="delivery_address_apartment"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Квартира/офис</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="4A" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="delivery_address_city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Город</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Барселона" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="delivery_address_postal_code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Почтовый индекс</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="08000" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="delivery_address_country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Страна</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Spain" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              {/* Additional Information Tab */}
              <TabsContent value="additional" className="space-y-4">
                <FormField
                  control={form.control}
                  name="associated_company_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Связанная компания</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value?.toString() || ""}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Выберите компанию" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="no_company">Не выбрана (частное лицо)</SelectItem>
                          {companies.map((company) => (
                            <SelectItem
                              key={company.company_id}
                              value={company.company_id.toString()}
                            >
                              {company.company_name}
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
                        value={field.value || ""}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Выберите менеджера" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="no_manager">Не назначен</SelectItem>
                          {users.map((user) => (
                            <SelectItem key={user.id} value={user.id}>
                              {user.full_name}
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
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Заметки</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Общие заметки о контакте..."
                          className="min-h-32"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Note: File upload functionality would be added here in future implementation */}
                <div className="bg-muted/50 p-4 rounded-md">
                  <p className="text-sm text-muted-foreground">
                    Функционал загрузки файлов будет доступен в будущих версиях.
                  </p>
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter>
              <Button variant="outline" type="button" onClick={onClose}>
                Отмена
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {contactToEdit ? "Обновить контакт" : "Создать контакт"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ContactFormModal;
