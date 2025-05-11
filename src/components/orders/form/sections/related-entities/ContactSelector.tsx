
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
  return (
    <EntitySelector
      form={form}
      fieldName="associatedContactId"
      label="Клиент"
      options={contacts}
      placeholder="Выберите клиента"
      emptyMessage="Клиент не найден. Сначала создайте контакт."
      isLoading={isLoading}
      required={true}
    />
  );
};

export default ContactSelector;
