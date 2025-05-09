
import React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { Company } from "@/hooks/useCompanies";
import { useCompanyForm } from "./forms/useCompanyForm";
import CompanyBasicInfoFields from "./forms/CompanyBasicInfoFields";
import CompanyContactFields from "./forms/CompanyContactFields";
import CompanyAddressField from "./forms/CompanyAddressField";
import CompanyClassificationFields from "./forms/CompanyClassificationFields";
import CompanyNotesField from "./forms/CompanyNotesField";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CompanyFormModalProps {
  company?: Company | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  users: Array<{ id: string; full_name: string }>;
}

const CompanyFormModal: React.FC<CompanyFormModalProps> = ({
  company,
  isOpen,
  onClose,
  onSuccess,
  users,
}) => {
  const { form, onSubmit, isEditing } = useCompanyForm({ 
    company, 
    onSuccess, 
    onClose 
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-hidden p-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>
            {isEditing ? "Редактирование компании" : "Добавление компании"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Измените данные компании и нажмите Сохранить"
              : "Заполните данные о новой компании"}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(85vh-130px)] px-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
              <CompanyBasicInfoFields form={form} />
              <CompanyContactFields form={form} />
              <CompanyAddressField form={form} />
              <CompanyClassificationFields form={form} users={users} />
              <CompanyNotesField form={form} />
            </form>
          </Form>
        </ScrollArea>

        <DialogFooter className="px-6 py-4 border-t">
          <Button variant="outline" type="button" onClick={onClose}>
            Отмена
          </Button>
          <Button type="submit" onClick={() => form.handleSubmit(onSubmit)()}>
            Сохранить
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CompanyFormModal;
