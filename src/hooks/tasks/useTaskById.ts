
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Task } from "@/types/task";

export const useTaskById = (taskId: number | null) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["task", taskId],
    queryFn: async (): Promise<Task | null> => {
      if (!taskId || !user) {
        return null;
      }

      console.log("Fetching task by ID:", taskId);

      // Fetch the main task data with user relationships
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          assigned_user:profiles!tasks_assigned_task_user_id_fkey(full_name),
          creator_user:profiles!tasks_creator_user_id_fkey(full_name)
        `)
        .eq('task_id', taskId)
        .single();

      if (error) {
        console.error("Error fetching task:", error);
        throw new Error(`Failed to fetch task: ${error.message}`);
      }

      if (!data) {
        return null;
      }

      // Process the task data
      const processedTask: Task = {
        ...data,
        assigned_user_name: data.assigned_user?.full_name || null,
        creator_user_name: data.creator_user?.full_name || null
      };

      // Fetch related entity names
      const fetchPromises = [];

      // For leads
      if (processedTask.related_lead_id) {
        fetchPromises.push(
          supabase
            .from('leads')
            .select('name')
            .eq('lead_id', processedTask.related_lead_id)
            .single()
            .then(({ data: leadData }) => {
              if (leadData) {
                processedTask.related_lead_name = leadData.name;
              }
            })
        );
      }

      // For contacts
      if (processedTask.related_contact_id) {
        fetchPromises.push(
          supabase
            .from('contacts')
            .select('full_name')
            .eq('contact_id', processedTask.related_contact_id)
            .single()
            .then(({ data: contactData }) => {
              if (contactData) {
                processedTask.related_contact_name = contactData.full_name;
              }
            })
        );
      }

      // For orders
      if (processedTask.related_order_id) {
        fetchPromises.push(
          supabase
            .from('orders')
            .select('order_number')
            .eq('id', processedTask.related_order_id)
            .single()
            .then(({ data: orderData }) => {
              if (orderData) {
                processedTask.related_order_number = orderData.order_number;
              }
            })
        );
      }

      // For partners
      if (processedTask.related_partner_manufacturer_id) {
        fetchPromises.push(
          supabase
            .from('partners_manufacturers')
            .select('company_name')
            .eq('partner_manufacturer_id', processedTask.related_partner_manufacturer_id)
            .single()
            .then(({ data: partnerData }) => {
              if (partnerData) {
                processedTask.related_partner_name = partnerData.company_name;
              }
            })
        );
      }

      // For custom requests
      if (processedTask.related_custom_request_id) {
        fetchPromises.push(
          supabase
            .from('custom_requests')
            .select('request_name')
            .eq('custom_request_id', processedTask.related_custom_request_id)
            .single()
            .then(({ data: requestData }) => {
              if (requestData) {
                processedTask.related_request_name = requestData.request_name;
              }
            })
        );
      }

      // Wait for all related entity fetches to complete
      await Promise.all(fetchPromises);

      console.log("Task fetched successfully:", processedTask);
      return processedTask;
    },
    enabled: !!taskId && !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      // Don't retry on access denied errors
      if (error?.message?.includes('Access denied')) {
        return false;
      }
      return failureCount < 3;
    }
  });
};
