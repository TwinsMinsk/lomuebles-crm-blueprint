
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { ContactFormValues } from "../schema/contactFormSchema";

interface ContactBasicInfoFieldsProps {
  form: UseFormReturn<ContactFormValues>;
}

const ContactBasicInfoFields: React.FC<ContactBasicInfoFieldsProps> = ({ form }) => {
  return (
    <>
      <FormField
        control={form.control}
        name="full_name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>ФИО *</FormLabel>
            <FormControl>
              <Input {...field} placeholder="Иванов Иван Иванович" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="nie"
        render={({ field }) => (
          <FormItem>
            <FormLabel>NIE</FormLabel>
            <FormControl>
              <Input {...field} placeholder="X-0000000-A" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="primary_phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Основной телефон</FormLabel>
              <FormControl>
                <Input {...field} placeholder="+34 600 000 000" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="secondary_phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Дополнительный телефон</FormLabel>
              <FormControl>
                <Input {...field} placeholder="+34 600 000 000" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="primary_email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Основной email</FormLabel>
              <FormControl>
                <Input {...field} placeholder="email@example.com" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="secondary_email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Дополнительный email</FormLabel>
              <FormControl>
                <Input {...field} placeholder="email@example.com" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </>
  );
};

export default ContactBasicInfoFields;
