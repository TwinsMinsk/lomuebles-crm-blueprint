
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Partner } from "@/types/partner";

// Form validation schema
const partnerFormSchema = z.object({
  company_name: z.string().min(1, "Название компании обязательно"),
  contact_person: z.string().nullable(),
  phone: z.string().nullable(),
  email: z.string().email("Неверный формат email").nullable(),
  website: z.string().nullable(),
  specialization: z.string().nullable(),
  terms: z.string().nullable(),
  requisites: z.string().nullable(),
  notes: z.string().nullable(),
});

export type PartnerFormValues = z.infer<typeof partnerFormSchema>;

interface UsePartnerFormProps {
  partner: Partner | null;
  onSuccess: () => void;
  onClose: () => void;
}

export const usePartnerForm = ({
  partner,
  onSuccess,
  onClose,
}: UsePartnerFormProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<any[]>([]);

  // Initialize form with empty values
  const form = useForm<PartnerFormValues>({
    resolver: zodResolver(partnerFormSchema),
    defaultValues: {
      company_name: "",
      contact_person: null,
      phone: null,
      email: null,
      website: null,
      specialization: null,
      terms: null,
      requisites: null,
      notes: null,
    },
  });

  // Update form when partner changes
  useEffect(() => {
    if (partner) {
      form.reset({
        company_name: partner.company_name,
        contact_person: partner.contact_person,
        phone: partner.phone,
        email: partner.email,
        website: partner.website,
        specialization: partner.specialization,
        terms: partner.terms,
        requisites: partner.requisites,
        notes: partner.notes,
      });
      
      // Load attached files if they exist
      if (partner.attached_files_partner_docs) {
        setAttachedFiles(partner.attached_files_partner_docs || []);
      } else {
        setAttachedFiles([]);
      }
    } else {
      setAttachedFiles([]);
    }
  }, [partner, form]);

  const onSubmit = async (values: PartnerFormValues) => {
    try {
      setLoading(true);

      // Prepare data with files
      const partnerData = {
        ...values,
        attached_files_partner_docs: attachedFiles.length > 0 ? attachedFiles : null,
      };

      if (partner) {
        // Update existing partner
        const { error } = await supabase
          .from("partners_manufacturers")
          .update(partnerData)
          .eq("partner_manufacturer_id", partner.partner_manufacturer_id);

        if (error) throw error;
        toast.success("Партнер-изготовитель успешно обновлен!");
      } else {
        // Create new partner - make sure company_name is specified
        const { error } = await supabase.from("partners_manufacturers").insert({
          ...partnerData,
          company_name: values.company_name, // Ensure company_name is explicitly set
          creator_user_id: user?.id || null,
        });

        if (error) throw error;
        toast.success("Партнер-изготовитель успешно создан!");
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error saving partner:", error);
      toast.error("Ошибка при сохранении партнера-изготовителя");
    } finally {
      setLoading(false);
    }
  };

  return {
    form,
    loading,
    onSubmit,
    attachedFiles,
    setAttachedFiles
  };
};
