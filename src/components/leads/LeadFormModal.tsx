
import React from "react";
import { LeadWithProfile } from "./LeadTableRow";
import { useLeadForm } from "./hooks/useLeadForm";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";

// Import form sections
import BasicInfoFields from "./form-sections/BasicInfoFields";
import ClassificationFields from "./form-sections/ClassificationFields";
import AssignmentAndCommentFields from "./form-sections/AssignmentAndCommentFields";

interface LeadFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead?: LeadWithProfile;
  onSuccess: () => void;
}

const LeadFormModal: React.FC<LeadFormModalProps> = ({
  isOpen,
  onClose,
  lead,
  onSuccess,
}) => {
  const { form, users, loading, onSubmit } = useLeadForm({ 
    lead, 
    onSuccess, 
    onClose 
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {lead ? "Редактировать лид" : "Добавить новый лид"}
          </DialogTitle>
          <DialogDescription>
            Заполните форму для {lead ? "обновления" : "создания"} лида
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 py-4"
          >
            {/* Basic Information */}
            <BasicInfoFields form={form} />

            {/* Classification Information */}
            <ClassificationFields form={form} />

            {/* Assignment and Comment */}
            <AssignmentAndCommentFields form={form} users={users} />

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

export default LeadFormModal;
