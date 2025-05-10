
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { OrderFormValues } from "../../orderFormSchema";
import EntitySelector, { EntityOption } from "./EntitySelector";

interface ContactSelectorProps {
  form: UseFormReturn<OrderFormValues>;
  contacts: EntityOption[];
  isLoading: boolean;
}

const ContactSelector: React.FC<ContactSelectorProps> = ({ form, contacts = [], isLoading }) => {
  // Log for debugging
  React.useEffect(() => {
    console.log("ContactSelector mounted with", contacts?.length || 0, "contacts");
  }, [contacts]);

  return (
    <EntitySelector
      form={form}
      fieldName="associatedContactId"
      label="Клиент *"
      options={contacts}
      placeholder="Выберите клиента"
      emptyMessage="Клиент не найден."
      isLoading={isLoading}
    />
  );
};

export default ContactSelector;
