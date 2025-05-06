
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { ContactFormValues } from "../schema/contactFormSchema";

interface ContactAddressFieldsProps {
  form: UseFormReturn<ContactFormValues>;
}

const ContactAddressFields: React.FC<ContactAddressFieldsProps> = ({ form }) => {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="delivery_address_street"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Улица</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Calle Example" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="delivery_address_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Номер дома</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="123" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="delivery_address_apartment"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Квартира/офис</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="4A" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="delivery_address_city"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Город</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Барселона" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="delivery_address_postal_code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Почтовый индекс</FormLabel>
              <FormControl>
                <Input {...field} placeholder="08000" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="delivery_address_country"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Страна</FormLabel>
            <FormControl>
              <Input {...field} placeholder="Spain" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};

export default ContactAddressFields;
