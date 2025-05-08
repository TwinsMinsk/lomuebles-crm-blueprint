
import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const companyFormSchema = z.object({
  companyName: z.string().min(2, "Название компании должно содержать минимум 2 символа"),
  taxId: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Введите корректный email").optional().or(z.literal("")),
  address: z.string().optional(),
  website: z.string().optional(),
  description: z.string().optional(),
});

type CompanyFormValues = z.infer<typeof companyFormSchema>;

const CompanySettings = () => {
  const form = useForm<CompanyFormValues>({
    resolver: zodResolver(companyFormSchema),
    defaultValues: {
      companyName: "lomuebles.es",
      taxId: "",
      phone: "",
      email: "",
      address: "",
      website: "https://lomuebles.es",
      description: "",
    },
  });

  function onSubmit(data: CompanyFormValues) {
    // In a real application, save to database
    console.log(data);
    toast.success("Информация о компании сохранена");
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Данные компании</h2>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="companyName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Название компании</FormLabel>
                  <FormControl>
                    <Input placeholder="Название компании" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="taxId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ИНН/КПП</FormLabel>
                  <FormControl>
                    <Input placeholder="ИНН/КПП компании" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Телефон</FormLabel>
                  <FormControl>
                    <Input placeholder="Контактный телефон" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="Контактный email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Веб-сайт</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Адрес</FormLabel>
                  <FormControl>
                    <Input placeholder="Юридический адрес" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Описание</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Краткое описание компании"
                    className="min-h-[100px]"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <Button type="submit">Сохранить изменения</Button>
        </form>
      </Form>
      
      <div className="mt-6 p-4 bg-amber-50 text-amber-800 rounded-md">
        <p className="text-sm">Данный функционал находится в разработке. Настройки будут применены в следующих версиях CRM.</p>
      </div>
    </div>
  );
};

export default CompanySettings;
