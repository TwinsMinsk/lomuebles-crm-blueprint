
import React from "react";
import { ContactWithRelations } from "./ContactTableRow";
import { useContactForm } from "@/hooks/contacts/useContactForm";
import { Loader2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Import form sections
import ContactBasicInfoFields from "./form-sections/ContactBasicInfoFields";
import ContactAddressFields from "./form-sections/ContactAddressFields";
import ContactAdditionalFields from "./form-sections/ContactAdditionalFields";

interface ContactFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  contactToEdit?: ContactWithRelations;
  onContactSaved: () => void;
}

const ContactFormModal: React.FC<ContactFormModalProps> = ({
  isOpen,
  onClose,
  contactToEdit,
  onContactSaved,
}) => {
  const { form, companies, users, loading, onSubmit } = useContactForm({
    contactToEdit,
    onContactSaved,
    onClose
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {contactToEdit ? "Редактировать контакт" : "Добавить новый контакт"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs defaultValue="main" className="w-full">
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="main">Основные данные</TabsTrigger>
                <TabsTrigger value="address">Адрес доставки</TabsTrigger>
                <TabsTrigger value="additional">Дополнительно</TabsTrigger>
              </TabsList>

              {/* Main Information Tab */}
              <TabsContent value="main" className="space-y-4">
                <ContactBasicInfoFields form={form} />
              </TabsContent>

              {/* Address Tab */}
              <TabsContent value="address" className="space-y-4">
                <ContactAddressFields form={form} />
              </TabsContent>

              {/* Additional Information Tab */}
              <TabsContent value="additional" className="space-y-4">
                <ContactAdditionalFields 
                  form={form}
                  companies={companies}
                  users={users}
                />
              </TabsContent>
            </Tabs>

            <DialogFooter>
              <Button variant="outline" type="button" onClick={onClose}>
                Отмена
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {contactToEdit ? "Обновить контакт" : "Создать контакт"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ContactFormModal;
