
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
      contactsLength: contacts?.length || 0,
      firstContact: contacts?.[0] || "none",
      isLoading,
      contactsArray: contacts // Log the actual contacts array
    });
  }, [contacts, isLoading]);

  return (
    <EntitySelector
      form={form}
      fieldName="associatedContactId"
      label="Клиент *"
      options={contacts || []} // Ensure we always pass an array
      placeholder="Выберите клиента"
      emptyMessage="Клиент не найден."
      isLoading={isLoading}
    />
  );
};

export default ContactSelector;
