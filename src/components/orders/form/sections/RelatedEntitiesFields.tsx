
import React, { useState, useEffect } from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { OrderFormValues } from "../orderFormSchema";
import { supabase } from "@/integrations/supabase/client";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { cn } from "@/lib/utils";

interface RelatedEntitiesFieldsProps {
  form: UseFormReturn<OrderFormValues>;
  orderType: string;
}

export const RelatedEntitiesFields: React.FC<RelatedEntitiesFieldsProps> = ({ form, orderType }) => {
  const [contacts, setContacts] = useState<{contact_id: number, full_name: string}[]>([]);
  const [companies, setCompanies] = useState<{company_id: number, company_name: string}[]>([]);
  const [leads, setLeads] = useState<{lead_id: number, name: string}[]>([]);
  const [managers, setManagers] = useState<{id: string, full_name: string}[]>([]);
  const [partners, setPartners] = useState<{partner_manufacturer_id: number, company_name: string}[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fetch related data
  useEffect(() => {
    const fetchRelatedData = async () => {
      setIsLoading(true);
      try {
        // Fetch contacts
        const { data: contactsData, error: contactsError } = await supabase
          .from("contacts")
          .select("contact_id, full_name")
          .order("full_name");
        
        if (contactsError) throw contactsError;
        setContacts(contactsData || []);
        
        // Fetch companies
        const { data: companiesData, error: companiesError } = await supabase
          .from("companies")
          .select("company_id, company_name")
          .order("company_name");
        
        if (companiesError) throw companiesError;
        setCompanies(companiesData || []);
        
        // Fetch leads
        const { data: leadsData, error: leadsError } = await supabase
          .from("leads")
          .select("lead_id, name")
          .order("name");
        
        if (leadsError) throw leadsError;
        setLeads(leadsData || []);
        
        // Fetch managers
        const { data: managersData, error: managersError } = await supabase
          .from("profiles")
          .select("id, full_name")
          .order("full_name");
        
        if (managersError) throw managersError;
        setManagers(managersData || []);
        
        // Fetch partners/manufacturers
        const { data: partnersData, error: partnersError } = await supabase
          .from("partners_manufacturers")
          .select("partner_manufacturer_id, company_name")
          .order("company_name");
        
        if (partnersError) throw partnersError;
        setPartners(partnersData || []);
        
      } catch (error) {
        console.error("Error fetching related data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchRelatedData();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Associated Contact (required) */}
      <FormField
        control={form.control}
        name="associatedContactId"
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel>Клиент *</FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant="outline"
                    role="combobox"
                    className={cn(
                      "justify-between",
                      !field.value && "text-muted-foreground"
                    )}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : field.value ? (
                      contacts.find((contact) => contact.contact_id === field.value)?.full_name || "Выберите клиента"
                    ) : (
                      "Выберите клиента"
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-[300px] p-0">
                <Command>
                  <CommandInput placeholder="Поиск клиента..." />
                  <CommandEmpty>Клиент не найден.</CommandEmpty>
                  <CommandGroup>
                    {contacts.map((contact) => (
                      <CommandItem
                        key={contact.contact_id}
                        value={contact.contact_id.toString()}
                        onSelect={() => {
                          form.setValue("associatedContactId", contact.contact_id);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            contact.contact_id === field.value
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                        {contact.full_name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Associated Company (optional) */}
      <FormField
        control={form.control}
        name="associatedCompanyId"
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel>Компания клиента</FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant="outline"
                    role="combobox"
                    className={cn(
                      "justify-between",
                      !field.value && "text-muted-foreground"
                    )}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : field.value ? (
                      companies.find((company) => company.company_id === field.value)?.company_name || "Выберите компанию"
                    ) : (
                      "Выберите компанию"
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-[300px] p-0">
                <Command>
                  <CommandInput placeholder="Поиск компании..." />
                  <CommandEmpty>Компания не найдена.</CommandEmpty>
                  <CommandGroup>
                    {companies.map((company) => (
                      <CommandItem
                        key={company.company_id}
                        value={company.company_name}
                        onSelect={() => {
                          form.setValue("associatedCompanyId", company.company_id);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            company.company_id === field.value
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                        {company.company_name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Source Lead (optional) */}
      <FormField
        control={form.control}
        name="sourceLeadId"
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel>Исходный лид</FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant="outline"
                    role="combobox"
                    className={cn(
                      "justify-between",
                      !field.value && "text-muted-foreground"
                    )}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : field.value ? (
                      leads.find((lead) => lead.lead_id === field.value)?.name || "Выберите лид"
                    ) : (
                      "Выберите лид"
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-[300px] p-0">
                <Command>
                  <CommandInput placeholder="Поиск лида..." />
                  <CommandEmpty>Лид не найден.</CommandEmpty>
                  <CommandGroup>
                    {leads.map((lead) => (
                      <CommandItem
                        key={lead.lead_id}
                        value={lead.name || `Лид #${lead.lead_id}`}
                        onSelect={() => {
                          form.setValue("sourceLeadId", lead.lead_id);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            lead.lead_id === field.value
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                        {lead.name || `Лид #${lead.lead_id}`}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Assigned Manager (optional) */}
      <FormField
        control={form.control}
        name="assignedUserId"
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel>Ответственный менеджер</FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant="outline"
                    role="combobox"
                    className={cn(
                      "justify-between",
                      !field.value && "text-muted-foreground"
                    )}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : field.value ? (
                      managers.find((manager) => manager.id === field.value)?.full_name || "Выберите менеджера"
                    ) : (
                      "Выберите менеджера"
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-[300px] p-0">
                <Command>
                  <CommandInput placeholder="Поиск менеджера..." />
                  <CommandEmpty>Менеджер не найден.</CommandEmpty>
                  <CommandGroup>
                    {managers.map((manager) => (
                      <CommandItem
                        key={manager.id}
                        value={manager.full_name || manager.id}
                        onSelect={() => {
                          form.setValue("assignedUserId", manager.id);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            manager.id === field.value
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                        {manager.full_name || manager.id}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Partner/Manufacturer - only visible when orderType is "Мебель на заказ" */}
      {orderType === "Мебель на заказ" && (
        <FormField
          control={form.control}
          name="associatedPartnerManufacturerId"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Партнер-изготовитель</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      className={cn(
                        "justify-between",
                        !field.value && "text-muted-foreground"
                      )}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : field.value ? (
                        partners.find((partner) => partner.partner_manufacturer_id === field.value)?.company_name || "Выберите партнера"
                      ) : (
                        "Выберите партнера"
                      )}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] p-0">
                  <Command>
                    <CommandInput placeholder="Поиск партнера..." />
                    <CommandEmpty>Партнер не найден.</CommandEmpty>
                    <CommandGroup>
                      {partners.map((partner) => (
                        <CommandItem
                          key={partner.partner_manufacturer_id}
                          value={partner.company_name}
                          onSelect={() => {
                            form.setValue("associatedPartnerManufacturerId", partner.partner_manufacturer_id);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              partner.partner_manufacturer_id === field.value
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          {partner.company_name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </div>
  );
};
