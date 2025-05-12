
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
import { FileUploadSection } from "@/components/common/FileUploadSection";

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
  const { 
    form, 
    loading, 
    onSubmit, 
    attachedFiles, 
    setAttachedFiles 
  } = useSupplierForm({
    supplier,
    onSuccess,
    onClose,
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] flex flex-col max-h-[85vh] p-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>
            {supplier ? "Редактировать поставщика" : "Добавить нового поставщика"}
          </DialogTitle>
          <DialogDescription>
            Заполните форму для {supplier ? "обновления" : "создания"} поставщика
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6 overflow-y-auto">
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
              
              {/* File Attachments */}
              <FileUploadSection
                entityType="suppliers"
                entityId={supplier?.supplier_id}
                existingFiles={attachedFiles}
                onFilesChange={setAttachedFiles}
                label="Документы поставщика"
              />
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

export default SupplierFormModal;
