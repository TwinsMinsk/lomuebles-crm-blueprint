
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/integrations/supabase/client";
import { leadFormSchema, LeadFormValues } from "../schema/leadFormSchema";
import { LeadWithProfile } from "../LeadTableRow";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

interface UseLeadFormProps {
  lead?: LeadWithProfile;
  onSuccess: () => void;
  onClose: () => void;
}

export const useLeadForm = ({ lead, onSuccess, onClose }: UseLeadFormProps) => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const [attachedFiles, setAttachedFiles] = useState<any[]>([]);

  const form = useForm<LeadFormValues>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      initial_comment: "",
      lead_source: "",
      lead_status: "Новый",
      client_language: "RU",
      assigned_user_id: null,
    },
  });

  useEffect(() => {
    // Fetch users for assignment dropdown
    const fetchUsers = async () => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("id, full_name, role")
          .order("full_name");

        if (error) throw error;
        setUsers(data || []);
      } catch (error) {
        console.error("Error fetching users:", error);
        toast.error("Не удалось загрузить список пользователей");
      }
    };

    fetchUsers();

    // Reset form values if editing lead
    if (lead) {
      form.reset({
        name: lead.name || "",
        phone: lead.phone || "",
        email: lead.email || "",
        initial_comment: lead.initial_comment || "",
        lead_source: lead.lead_source || "",
        lead_status: lead.lead_status || "Новый",
        client_language: lead.client_language || "RU",
        assigned_user_id: lead.assigned_user_id || null,
      });
      
      // Initialize attached files
      if (lead.attached_files) {
        setAttachedFiles(lead.attached_files);
      }
    }
  }, [lead, form]);

  const onSubmit = async (values: LeadFormValues) => {
    try {
      setLoading(true);
      
      // Prepare data with attached files
      const leadData = {
        ...values,
        attached_files: attachedFiles.length > 0 ? attachedFiles : null,
        creator_user_id: user?.id
      };

      if (lead) {
        // Update existing lead
        const { error } = await supabase
          .from("leads")
          .update(leadData)
          .eq("lead_id", lead.lead_id);

        if (error) throw error;
        toast.success("Лид успешно обновлен!");
      } else {
        // Create new lead
        const { error } = await supabase.from("leads").insert(leadData);
        if (error) throw error;
        toast.success("Лид успешно создан!");
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error saving lead:", error);
      toast.error("Ошибка при сохранении лида");
    } finally {
      setLoading(false);
    }
  };

  return {
    form,
    users,
    loading,
    onSubmit,
    attachedFiles,
    setAttachedFiles
  };
};
