
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { LeadWithProfile } from "../LeadTableRow";
import { formSchema, LeadFormData } from "../schema/leadFormSchema";

interface UserProfile {
  id: string;
  full_name: string;
  role: string;
}

interface UseLeadFormProps {
  lead?: LeadWithProfile;
  onSuccess: () => void;
  onClose: () => void;
}

export const useLeadForm = ({ lead, onSuccess, onClose }: UseLeadFormProps) => {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);

  // Set up form with default values
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
      assigned_user_id: lead?.assigned_user_id || "not_assigned",
    },
  });

  // Fetch users that can be assigned to leads (managers and admins)
  useEffect(() => {
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

  const onSubmit = async (data: LeadFormData) => {
    setLoading(true);
    try {
      // Handle not_assigned as null for the database
      const assignedUserId = data.assigned_user_id === "not_assigned" ? null : data.assigned_user_id;

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
            assigned_user_id: assignedUserId,
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
          assigned_user_id: assignedUserId,
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

  return {
    form,
    users,
    loading,
    onSubmit,
  };
};
