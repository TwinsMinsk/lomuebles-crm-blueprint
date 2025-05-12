
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
import { Partner } from "@/types/partner";
import { usePartnerForm } from "@/hooks/usePartnerForm";
import PartnerBasicInfoFields from "./form-sections/PartnerBasicInfoFields";
import PartnerContactFields from "./form-sections/PartnerContactFields";
import PartnerBusinessFields from "./form-sections/PartnerBusinessFields";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileUploadSection } from "@/components/common/FileUploadSection";

interface PartnerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  partner: Partner | null;
  onSuccess: () => void;
}

const PartnerFormModal: React.FC<PartnerFormModalProps> = ({
  isOpen,
  onClose,
  partner,
  onSuccess,
}) => {
  const { 
    form, 
    loading, 
    onSubmit, 
    attachedFiles, 
    setAttachedFiles 
  } = usePartnerForm({
    partner,
    onSuccess,
    onClose,
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] flex flex-col max-h-[85vh] p-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>
            {partner ? "Редактировать партнера" : "Добавить нового партнера"}
          </DialogTitle>
          <DialogDescription>
            Заполните форму для {partner ? "обновления" : "создания"} партнера-изготовителя
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6 overflow-y-auto">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6 py-4"
            >
              {/* Basic Information */}
              <PartnerBasicInfoFields form={form} />

              {/* Contact Information */}
              <PartnerContactFields form={form} />

              {/* Business Information */}
              <PartnerBusinessFields form={form} />
              
              {/* File Attachments */}
              <FileUploadSection
                entityType="partners"
                entityId={partner?.partner_manufacturer_id}
                existingFiles={attachedFiles}
                onFilesChange={setAttachedFiles}
                label="Документы партнера"
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

export default PartnerFormModal;
