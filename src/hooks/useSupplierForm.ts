
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Supplier } from "@/types/supplier";

// Form validation schema
const supplierFormSchema = z.object({
  supplier_name: z.string().min(1, "Название поставщика обязательно"),
  contact_person: z.string().nullable(),
  phone: z.string().nullable(),
  email: z.string().email("Неверный формат email").nullable(),
  website: z.string().nullable(),
  product_categories: z.string().nullable(),
  terms: z.string().nullable(),
});

export type SupplierFormValues = z.infer<typeof supplierFormSchema>;

interface UseSupplierFormProps {
  supplier: Supplier | null;
  onSuccess: () => void;
  onClose: () => void;
}

export const useSupplierForm = ({
  supplier,
  onSuccess,
  onClose,
}: UseSupplierFormProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<any[]>([]);

  // Initialize form with empty values
  const form = useForm<SupplierFormValues>({
    resolver: zodResolver(supplierFormSchema),
    defaultValues: {
      supplier_name: "",
      contact_person: null,
      phone: null,
      email: null,
      website: null,
      product_categories: null,
      terms: null,
    },
  });

  // Update form when supplier changes
  useEffect(() => {
    if (supplier) {
      form.reset({
        supplier_name: supplier.supplier_name,
        contact_person: supplier.contact_person,
        phone: supplier.phone,
        email: supplier.email,
        website: supplier.website,
        product_categories: supplier.product_categories,
        terms: supplier.terms,
      });
      
      // Load attached files if they exist
      if (supplier.attached_files) {
        setAttachedFiles(supplier.attached_files || []);
      } else {
        setAttachedFiles([]);
      }
    } else {
      setAttachedFiles([]);
    }
  }, [supplier, form]);

  const onSubmit = async (values: SupplierFormValues) => {
    try {
      setLoading(true);

      // Prepare data with files
      const supplierData = {
        ...values,
        attached_files: attachedFiles.length > 0 ? attachedFiles : null,
      };

      if (supplier) {
        // Update existing supplier
        const { error } = await supabase
          .from("suppliers")
          .update(supplierData)
          .eq("supplier_id", supplier.supplier_id);

        if (error) throw error;
        toast.success("Поставщик успешно обновлен!");
      } else {
        // Create new supplier - make sure supplier_name is explicitly set
        const { error } = await supabase.from("suppliers").insert({
          ...supplierData,
          supplier_name: values.supplier_name, // Explicitly set supplier_name
          creator_user_id: user?.id || null,
        });

        if (error) throw error;
        toast.success("Поставщик успешно создан!");
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error saving supplier:", error);
      toast.error("Ошибка при сохранении поставщика");
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
