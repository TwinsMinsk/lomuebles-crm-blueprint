
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Product } from "@/types/product";
import { useProductForm } from "@/hooks/useProductForm";
import ProductBasicInfoFields from "./form-sections/ProductBasicInfoFields";
import ProductDetailsFields from "./form-sections/ProductDetailsFields";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onSuccess: () => void;
}

const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  product,
  onSuccess,
}) => {
  const { form, loading, onSubmit } = useProductForm({
    product,
    onSuccess,
    onClose,
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] flex flex-col max-h-[85vh] p-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>
            {product ? "Редактировать товар" : "Добавить новый товар"}
          </DialogTitle>
          <DialogDescription>
            Заполните форму для {product ? "обновления" : "создания"} товара
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6 overflow-y-auto">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6 py-4"
            >
              {/* Basic Information */}
              <ProductBasicInfoFields form={form} />

              {/* Additional Details */}
              <ProductDetailsFields form={form} />
            </form>
          </Form>
        </ScrollArea>

        <DialogFooter className="px-6 py-4 border-t mt-auto">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Отмена
          </Button>
          <Button 
            type="submit" 
            disabled={loading}
            onClick={() => form.handleSubmit(onSubmit)()}
          >
            {loading ? "Сохранение..." : "Сохранить"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProductFormModal;
