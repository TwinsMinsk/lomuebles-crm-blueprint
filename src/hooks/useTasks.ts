
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Task, TasksQueryParams } from "@/types/task";
import { useAuth } from "@/context/AuthContext";
import { format } from "date-fns";

export function useTasks() {
  const [totalCount, setTotalCount] = useState(0);
  const { user } = useAuth();
  
  // Function to fetch tasks using the new RPC function with custom sorting
  const fetchTasks = async ({
    page = 1,
    pageSize = 10,
    sortColumn = 'due_date',
    sortDirection = 'asc',
    filters = {}
  }: TasksQueryParams) => {
    try {
      const { 
        search, 
        taskStatus, 
        taskType, 
        priority, 
        assignedToMe, 
        createdByMe, 
        assignedUserId,
        dueDateFrom,
        dueDateTo
      } = filters;
      
      // Call the new RPC function
      const { data, error } = await supabase.rpc('get_tasks_with_custom_sort', {
        p_page: page,
        p_page_size: pageSize,
        p_sort_column: sortColumn,
        p_sort_direction: sortDirection,
        p_search: search || null,
        p_task_status: taskStatus || null,
        p_task_type: taskType || null,
        p_priority: priority || null,
        p_assigned_user_id: assignedUserId || null,
        p_assigned_to_me: assignedToMe || false,
        p_created_by_me: createdByMe || false,
        p_due_date_from: dueDateFrom ? format(dueDateFrom, 'yyyy-MM-dd') : null,
        p_due_date_to: dueDateTo ? format(dueDateTo, 'yyyy-MM-dd') : null,
        p_current_user_id: user?.id || null
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      // Set total count from the first row (all rows have the same total_count)
      if (data && data.length > 0) {
        setTotalCount(data[0].total_count || 0);
      } else {
        setTotalCount(0);
      }
      
      // Process the data to match our Task interface
      const processedTasks: Task[] = await Promise.all(
        (data || []).map(async (task) => {
          // Fetch related entity names in separate queries for better performance
          const taskWithRelations = { ...task };
          
          // For leads
          if (task.related_lead_id) {
            const { data: leadData } = await supabase
              .from('leads')
              .select('name')
              .eq('lead_id', task.related_lead_id)
              .single();
              
            if (leadData) {
              taskWithRelations.related_lead_name = leadData.name;
            }
          }
          
          // For contacts
          if (task.related_contact_id) {
            const { data: contactData } = await supabase
              .from('contacts')
              .select('full_name')
              .eq('contact_id', task.related_contact_id)
              .single();
              
            if (contactData) {
              taskWithRelations.related_contact_name = contactData.full_name;
            }
          }
          
          // For orders
          if (task.related_order_id) {
            const { data: orderData } = await supabase
              .from('orders')
              .select('order_number')
              .eq('id', task.related_order_id)
              .single();
              
            if (orderData) {
              taskWithRelations.related_order_number = orderData.order_number;
            }
          }
          
          // For partners
          if (task.related_partner_manufacturer_id) {
            const { data: partnerData } = await supabase
              .from('partners_manufacturers')
              .select('company_name')
              .eq('partner_manufacturer_id', task.related_partner_manufacturer_id)
              .single();
              
            if (partnerData) {
              taskWithRelations.related_partner_name = partnerData.company_name;
            }
          }
          
          // For custom requests
          if (task.related_custom_request_id) {
            const { data: requestData } = await supabase
              .from('custom_requests')
              .select('request_name')
              .eq('custom_request_id', task.related_custom_request_id)
              .single();
              
            if (requestData) {
              taskWithRelations.related_request_name = requestData.request_name;
            }
          }
          
          // Fetch user names
          if (task.assigned_task_user_id) {
            const { data: assignedUserData } = await supabase
              .from('profiles')
              .select('full_name')
              .eq('id', task.assigned_task_user_id)
              .single();
              
            if (assignedUserData) {
              taskWithRelations.assigned_user_name = assignedUserData.full_name;
            }
          }
          
          if (task.creator_user_id) {
            const { data: creatorUserData } = await supabase
              .from('profiles')
              .select('full_name')
              .eq('id', task.creator_user_id)
              .single();
              
            if (creatorUserData) {
              taskWithRelations.creator_user_name = creatorUserData.full_name;
            }
          }
          
          return taskWithRelations;
        })
      );
      
      return processedTasks;
    } catch (error) {
      console.error("Error fetching tasks:", error);
      throw error;
    }
  };

  return { fetchTasks, totalCount };
}
