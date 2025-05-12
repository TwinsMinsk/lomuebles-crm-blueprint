
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

  // Initialize form with empty values
  const form = useForm<PartnerFormValues>({
    resolver: zodResolver(partnerFormSchema),
    defaultValues: {
      company_name: "",
      contact_person: null,
      phone: null,
      email: null,
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
        specialization: partner.specialization,
        terms: partner.terms,
        requisites: partner.requisites,
        notes: partner.notes,
      });
    }
  }, [partner, form]);

  const onSubmit = async (values: PartnerFormValues) => {
    try {
      setLoading(true);

      if (partner) {
        // Update existing partner
        const { error } = await supabase
          .from("partners_manufacturers")
          .update(values)
          .eq("partner_manufacturer_id", partner.partner_manufacturer_id);

        if (error) throw error;
        toast.success("Партнер-изготовитель успешно обновлен!");
      } else {
        // Create new partner
        const { error } = await supabase.from("partners_manufacturers").insert({
          company_name: values.company_name,
          contact_person: values.contact_person,
          phone: values.phone,
          email: values.email,
          specialization: values.specialization,
          terms: values.terms,
          requisites: values.requisites,
          notes: values.notes,
          creator_user_id: user?.id || null,
        });

        if (error) throw error;
        toast.success("Партнер-изготовитель успешно создан!");
      }

      onSuccess();
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
  };
};
