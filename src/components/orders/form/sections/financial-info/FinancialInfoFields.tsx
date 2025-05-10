
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { OrderFormValues } from "../../orderFormSchema";
import { FinalAmountField } from "./FinalAmountField";
import { PaymentStatusField } from "./PaymentStatusField";

interface FinancialInfoFieldsProps {
  form: UseFormReturn<OrderFormValues>;
}

export const FinancialInfoFields: React.FC<FinancialInfoFieldsProps> = ({ form }) => {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <FinalAmountField form={form} />
      <PaymentStatusField form={form} />
    </div>
  );
};
