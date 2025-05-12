
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Product } from "@/types/product";

// Form validation schema
const productFormSchema = z.object({
  internal_product_name: z.string().min(1, "Название товара обязательно"),
  internal_sku: z.string().nullable(),
  description: z.string().nullable(),
  base_price: z.number().nullable(),
  category: z.string().nullable(),
  is_custom_template: z.boolean().default(true),
  template_image: z.string().nullable(),
  notes: z.string().nullable(),
});

export type ProductFormValues = z.infer<typeof productFormSchema>;

interface UseProductFormProps {
  product: Product | null;
  onSuccess: () => void;
  onClose: () => void;
}

export const useProductForm = ({
  product,
  onSuccess,
  onClose,
}: UseProductFormProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  // Initialize form with empty values
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      internal_product_name: "",
      internal_sku: null,
      description: null,
      base_price: null,
      category: null,
      is_custom_template: true,
      template_image: null,
      notes: null,
    },
  });

  // Update form when product changes
  useEffect(() => {
    if (product) {
      form.reset({
        internal_product_name: product.internal_product_name,
        internal_sku: product.internal_sku,
        description: product.description,
        base_price: product.base_price,
        category: product.category,
        is_custom_template: product.is_custom_template,
        template_image: product.template_image,
        notes: product.notes,
      });
    }
  }, [product, form]);

  const onSubmit = async (values: ProductFormValues) => {
    try {
      setLoading(true);

      if (product) {
        // Update existing product
        const { error } = await supabase
          .from("products")
          .update(values)
          .eq("product_id", product.product_id);

        if (error) throw error;
        toast.success("Товар успешно обновлен!");
      } else {
        // Create new product - ensure internal_product_name is explicitly set
        const { error } = await supabase.from("products").insert({
          internal_product_name: values.internal_product_name,
          internal_sku: values.internal_sku,
          description: values.description,
          base_price: values.base_price,
          category: values.category,
          is_custom_template: values.is_custom_template,
          template_image: values.template_image,
          notes: values.notes,
          creator_user_id: user?.id || null,
        });

        if (error) throw error;
        toast.success("Товар успешно создан!");
      }

      onSuccess();
    } catch (error) {
      console.error("Error saving product:", error);
      toast.error("Ошибка при сохранении товара");
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
