
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
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {supplier ? "Редактировать поставщика" : "Добавить нового поставщика"}
          </DialogTitle>
          <DialogDescription>
            Заполните форму для {supplier ? "обновления" : "создания"} поставщика
          </DialogDescription>
        </DialogHeader>

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

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
              >
                Отмена
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Сохранение..." : "Сохранить"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default SupplierFormModal;
