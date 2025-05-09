
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
import { Supplier } from "@/types/supplier";
import { useSupplierForm } from "@/hooks/useSupplierForm";
import SupplierBasicInfoFields from "./form-sections/SupplierBasicInfoFields";
import SupplierContactFields from "./form-sections/SupplierContactFields";
import SupplierBusinessFields from "./form-sections/SupplierBusinessFields";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SupplierFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  supplier: Supplier | null;
  onSuccess: () => void;
}

const SupplierFormModal: React.FC<SupplierFormModalProps> = ({
  isOpen,
  onClose,
  supplier,
  onSuccess,
}) => {
  const { form, loading, onSubmit } = useSupplierForm({
    supplier,
    onSuccess,
    onClose,
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-hidden p-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>
            {supplier ? "Редактировать поставщика" : "Добавить нового поставщика"}
          </DialogTitle>
          <DialogDescription>
            Заполните форму для {supplier ? "обновления" : "создания"} поставщика
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(85vh-130px)] px-6">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6 py-4"
            >
              {/* Basic Information */}
              <SupplierBasicInfoFields form={form} />

              {/* Contact Information */}
              <SupplierContactFields form={form} />

              {/* Business Information */}
              <SupplierBusinessFields form={form} />
            </form>
          </Form>
        </ScrollArea>

        <DialogFooter className="px-6 py-4 border-t">
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
            onClick={form.handleSubmit(onSubmit)}
          >
            {loading ? "Сохранение..." : "Сохранить"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SupplierFormModal;
