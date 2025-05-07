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
  const { leads } = useLeads();
  const { contacts } = useContacts();
  const { fetchOrders, totalCount } = useOrders(); // Исправлено - удален аргумент
  const { partners } = usePartners();
  const { customRequests } = useCustomRequests();
  
  const [orders, setOrders] = useState<any[]>([]);

  // Fetch orders with required parameters
  useEffect(() => {
    const loadOrders = async () => {
      try {
        const fetchedOrders = await fetchOrders({
          page: 1,
          pageSize: 100,
          sortColumn: 'creation_date',
          sortDirection: 'desc'
        });
        setOrders(fetchedOrders);
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
                defaultValue={field.value?.toString() || "none"}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите лид" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="none">Нет</SelectItem>
                  {leads?.map((lead) => (
                    <SelectItem key={lead.lead_id} value={lead.lead_id.toString()}>
                      {lead.name}
                    </SelectItem>
                  ))}
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
                defaultValue={field.value?.toString() || "none"}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите контакт" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="none">Нет</SelectItem>
                  {contacts?.map((contact) => (
                    <SelectItem key={contact.contact_id} value={contact.contact_id.toString()}>
                      {contact.full_name}
                    </SelectItem>
                  ))}
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
                defaultValue={field.value?.toString() || "none"}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите заказ" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="none">Нет</SelectItem>
                  {orders?.map((order) => (
                    <SelectItem key={order.deal_order_id} value={order.deal_order_id.toString()}>
                      {order.order_number}
                    </SelectItem>
                  ))}
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
                defaultValue={field.value?.toString() || "none"}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите партнера" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="none">Нет</SelectItem>
                  {partners?.map((partner) => (
                    <SelectItem key={partner.partner_manufacturer_id} value={partner.partner_manufacturer_id.toString()}>
                      {partner.company_name}
                    </SelectItem>
                  ))}
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
                defaultValue={field.value?.toString() || "none"}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите запрос" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="none">Нет</SelectItem>
                  {customRequests?.map((request) => (
                    <SelectItem key={request.custom_request_id} value={request.custom_request_id.toString()}>
                      {request.request_name}
                    </SelectItem>
                  ))}
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
