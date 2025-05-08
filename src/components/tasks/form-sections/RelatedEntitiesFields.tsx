
import React, { useState, useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLeads } from "@/hooks/useLeads";
import { useContacts } from "@/hooks/useContacts";
import { useOrders } from "@/hooks/useOrders";
import { usePartners } from "@/hooks/usePartners";
import { useCustomRequests } from "@/hooks/useCustomRequests";

const RelatedEntitiesFields: React.FC = () => {
  const { control } = useFormContext();
  const { leads = [] } = useLeads();
  const { contacts = [] } = useContacts();
  // Provide the required parameter to useOrders hook
  const { fetchOrders } = useOrders();
  const { partners = [] } = usePartners();
  const { customRequests = [] } = useCustomRequests();
  
  const [orders, setOrders] = useState<any[]>([]);

  // Fetch orders with required parameters
  useEffect(() => {
    const loadOrders = async () => {
      try {
        const fetchedOrders = await fetchOrders({
          page: 1,
          pageSize: 100,
          sortColumn: 'creation_date',
          sortDirection: 'desc',
          filters: {}
        });
        setOrders(Array.isArray(fetchedOrders) ? fetchedOrders : []);
      } catch (error) {
        console.error("Failed to load orders:", error);
        setOrders([]);
      }
    };
    
    loadOrders();
  }, [fetchOrders]);

  return (
    <div className="border-t pt-4 mt-6">
      <h3 className="text-lg font-medium mb-4">Связанные объекты</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={control}
          name="related_lead_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Связанный лид</FormLabel>
              <Select
                onValueChange={(value) => field.onChange(value === "none" ? null : parseInt(value))}
                value={field.value?.toString() || "none"}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите лид" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="none">Нет</SelectItem>
                  {leads && leads.length > 0 ? leads.map((lead) => (
                    <SelectItem 
                      key={lead.lead_id} 
                      value={String(lead.lead_id || "unknown")} // Ensure non-empty string value
                    >
                      {lead.name || "Лид без имени"}
                    </SelectItem>
                  )) : (
                    <SelectItem value="no-leads">Нет доступных лидов</SelectItem>
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="related_contact_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Связанный контакт</FormLabel>
              <Select
                onValueChange={(value) => field.onChange(value === "none" ? null : parseInt(value))}
                value={field.value?.toString() || "none"}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите контакт" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="none">Нет</SelectItem>
                  {contacts && contacts.length > 0 ? contacts.map((contact) => (
                    <SelectItem 
                      key={contact.contact_id} 
                      value={String(contact.contact_id || "unknown")} // Ensure non-empty string value
                    >
                      {contact.full_name || "Контакт без имени"}
                    </SelectItem>
                  )) : (
                    <SelectItem value="no-contacts">Нет доступных контактов</SelectItem>
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="related_deal_order_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Связанный заказ</FormLabel>
              <Select
                onValueChange={(value) => field.onChange(value === "none" ? null : parseInt(value))}
                value={field.value?.toString() || "none"}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите заказ" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="none">Нет</SelectItem>
                  {orders && orders.length > 0 ? orders.map((order) => (
                    <SelectItem 
                      key={order.deal_order_id} 
                      value={String(order.deal_order_id || "unknown")} // Ensure non-empty string value
                    >
                      {order.order_number || "Заказ без номера"}
                    </SelectItem>
                  )) : (
                    <SelectItem value="no-orders">Нет доступных заказов</SelectItem>
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="related_partner_manufacturer_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Связанный партнер</FormLabel>
              <Select
                onValueChange={(value) => field.onChange(value === "none" ? null : parseInt(value))}
                value={field.value?.toString() || "none"}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите партнера" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="none">Нет</SelectItem>
                  {partners && partners.length > 0 ? partners.map((partner) => (
                    <SelectItem 
                      key={partner.partner_manufacturer_id} 
                      value={String(partner.partner_manufacturer_id || "unknown")} // Ensure non-empty string value
                    >
                      {partner.company_name || "Партнер без названия"}
                    </SelectItem>
                  )) : (
                    <SelectItem value="no-partners">Нет доступных партнеров</SelectItem>
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="related_custom_request_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Связанный запрос</FormLabel>
              <Select
                onValueChange={(value) => field.onChange(value === "none" ? null : parseInt(value))}
                value={field.value?.toString() || "none"}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите запрос" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="none">Нет</SelectItem>
                  {customRequests && customRequests.length > 0 ? customRequests.map((request) => (
                    <SelectItem 
                      key={request.custom_request_id} 
                      value={String(request.custom_request_id || "unknown")} // Ensure non-empty string value
                    >
                      {request.request_name || "Запрос без названия"}
                    </SelectItem>
                  )) : (
                    <SelectItem value="no-requests">Нет доступных запросов</SelectItem>
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};

export default RelatedEntitiesFields;
