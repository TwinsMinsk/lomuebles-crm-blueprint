
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CompanyFormValues, companyFormSchema } from "./CompanyFormSchema";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Company } from "@/hooks/useCompanies";

interface UseCompanyFormProps {
  company?: Company | null;
  onSuccess: () => void;
  onClose: () => void;
}

export const useCompanyForm = ({ company, onSuccess, onClose }: UseCompanyFormProps) => {
  const { toast } = useToast();
  const isEditing = !!company;
  
  // Setup form with default values
  const form = useForm<CompanyFormValues>({
    resolver: zodResolver(companyFormSchema),
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

  const onSubmit = async (data: CompanyFormValues) => {
    try {
      // We ensure company_name is defined (it should be due to validation)
      const companyData = {
        company_name: data.company_name,
        nif_cif: data.nif_cif,
        phone: data.phone,
        email: data.email,
        address: data.address,
        industry: data.industry,
        owner_user_id: data.owner_user_id,
        notes: data.notes,
      };

      if (isEditing) {
        // Update existing company
        const { error } = await supabase
          .from("companies")
          .update(companyData)
          .eq("company_id", company.company_id);

        if (error) throw error;

        toast({
          title: "Компания обновлена",
          description: "Данные компании успешно обновлены",
        });
      } else {
        // Create new company
        const { error } = await supabase.from("companies").insert(companyData);

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

  return {
    form,
    onSubmit,
    isEditing,
  };
};
