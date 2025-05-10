
import React, { useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { OrderFormValues } from "../../orderFormSchema";
import EntitySelector, { EntityOption } from "./EntitySelector";

interface ContactSelectorProps {
  form: UseFormReturn<OrderFormValues>;
  contacts: EntityOption[];
  isLoading: boolean;
}

const ContactSelector: React.FC<ContactSelectorProps> = ({ form, contacts = [], isLoading }) => {
  // Debug logging to confirm data is being passed
  useEffect(() => {
    console.log("ContactSelector rendered with:", {
      contactsLength: Array.isArray(contacts) ? contacts.length : 0,
      firstContact: Array.isArray(contacts) && contacts.length > 0 ? contacts[0] : "none",
      isLoading,
      contactsArray: contacts // Log the actual contacts array
    });
  }, [contacts, isLoading]);

  // Ensure contacts is always an array
  const safeContacts = Array.isArray(contacts) ? contacts : [];

  return (
    <EntitySelector
      form={form}
      fieldName="associatedContactId"
      label="Клиент *"
      options={safeContacts}
      placeholder="Выберите клиента"
      emptyMessage="Клиент не найден."
      isLoading={isLoading}
    />
  );
};

export default ContactSelector;
