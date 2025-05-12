
import React from "react";
import { LeadWithProfile } from "./LeadTableRow";
import { useLeadForm } from "./hooks/useLeadForm";
import { FileUploadSection } from "@/components/common/FileUploadSection";

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
import { ScrollArea } from "@/components/ui/scroll-area";

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
  const { form, users, loading, onSubmit, attachedFiles, setAttachedFiles } = useLeadForm({ 
    lead, 
    onSuccess, 
    onClose 
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] flex flex-col max-h-[85vh] p-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>
            {lead ? "Редактировать лид" : "Добавить новый лид"}
          </DialogTitle>
          <DialogDescription>
            Заполните форму для {lead ? "обновления" : "создания"} лида
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6 overflow-y-auto">
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
              
              {/* File Attachments */}
              <FileUploadSection
                entityType="leads"
                entityId={lead?.lead_id}
                existingFiles={attachedFiles}
                onFilesChange={setAttachedFiles}
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

export default LeadFormModal;
