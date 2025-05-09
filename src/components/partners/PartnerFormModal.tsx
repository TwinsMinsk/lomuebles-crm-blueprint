
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
  const { form, loading, onSubmit } = usePartnerForm({
    partner,
    onSuccess,
    onClose,
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-hidden p-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>
            {partner ? "Редактировать партнера" : "Добавить нового партнера"}
          </DialogTitle>
          <DialogDescription>
            Заполните форму для {partner ? "обновления" : "создания"} партнера-изготовителя
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(85vh-130px)] px-6">
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

export default PartnerFormModal;
