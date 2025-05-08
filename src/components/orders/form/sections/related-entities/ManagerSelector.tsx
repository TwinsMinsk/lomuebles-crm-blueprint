
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { OrderFormValues } from "../../orderFormSchema";
import EntitySelector from "./EntitySelector";
import { EntityOption } from "./EntitySelector";

interface ManagerSelectorProps {
  form: UseFormReturn<OrderFormValues>;
  managers: EntityOption[];
  isLoading: boolean;
}

const ManagerSelector: React.FC<ManagerSelectorProps> = ({ form, managers, isLoading }) => {
  return (
    <EntitySelector
      form={form}
      fieldName="assignedUserId"
      label="Ответственный менеджер"
      options={managers}
      placeholder="Выберите менеджера"
      emptyMessage="Менеджер не найден."
      isLoading={isLoading}
    />
  );
};

export default ManagerSelector;
