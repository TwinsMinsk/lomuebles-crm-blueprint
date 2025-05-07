
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Task, TasksQueryParams } from "@/types/task";
import { useAuth } from "@/context/AuthContext";
import { format } from "date-fns";

export function useTasks() {
  const [totalCount, setTotalCount] = useState(0);
  const { user } = useAuth();
  
  // Function to fetch tasks from Supabase
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
      
      // Start building the query
      let query = supabase
        .from('tasks')
        .select('*, profiles!tasks_assigned_task_user_id_fkey(full_name), creator:profiles!tasks_creator_user_id_fkey(full_name)', { count: 'exact' });
      
      // Apply search filter
      if (search) {
        query = query.or(`task_name.ilike.%${search}%,description.ilike.%${search}%`);
      }
      
      // Apply status filter
      if (taskStatus) {
        query = query.eq('task_status', taskStatus);
      }
      
      // Apply task type filter
      if (taskType) {
        query = query.eq('task_type', taskType);
      }
      
      // Apply priority filter
      if (priority) {
        query = query.eq('priority', priority);
      }
      
      // Apply assigned user filter
      if (assignedUserId) {
        query = query.eq('assigned_task_user_id', assignedUserId);
      }
      // Filter by assigned to me or created by me if no specific assignedUserId is set
      else if (assignedToMe && createdByMe && user?.id) {
        query = query.or(`assigned_task_user_id.eq.${user.id},creator_user_id.eq.${user.id}`);
      } else if (assignedToMe && user?.id) {
        query = query.eq('assigned_task_user_id', user.id);
      } else if (createdByMe && user?.id) {
        query = query.eq('creator_user_id', user.id);
      }
      
      // Apply due date range filter
      if (dueDateFrom && dueDateTo) {
        const fromDateStr = format(dueDateFrom, 'yyyy-MM-dd');
        const toDateStr = format(dueDateTo, 'yyyy-MM-dd');
        query = query.gte('due_date', fromDateStr).lte('due_date', toDateStr + 'T23:59:59');
      } else if (dueDateFrom) {
        const fromDateStr = format(dueDateFrom, 'yyyy-MM-dd');
        query = query.gte('due_date', fromDateStr);
      } else if (dueDateTo) {
        const toDateStr = format(dueDateTo, 'yyyy-MM-dd');
        query = query.lte('due_date', toDateStr + 'T23:59:59');
      }
      
      // Add sorting
      query = query.order(sortColumn, { ascending: sortDirection === 'asc' });
      
      // Add pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);
      
      // Execute the query
      const { data, error, count } = await query;
      
      if (error) {
        throw new Error(error.message);
      }
      
      // Store the total count
      if (count !== null) {
        setTotalCount(count);
      }
      
      // Process the data
      const processedTasks: Task[] = data.map(task => {
        return {
          ...task,
          assigned_user_name: task.profiles?.full_name || null,
          creator_user_name: task.creator?.full_name || null
        };
      });
      
      // Fetch related entity names in separate queries
      const processedTasksWithRelations = await Promise.all(
        processedTasks.map(async (task) => {
          // For leads
          if (task.related_lead_id) {
            const { data: leadData } = await supabase
              .from('leads')
              .select('name')
              .eq('lead_id', task.related_lead_id)
              .single();
              
            if (leadData) {
              task.related_lead_name = leadData.name;
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
              task.related_contact_name = contactData.full_name;
            }
          }
          
          // For orders
          if (task.related_deal_order_id) {
            const { data: orderData } = await supabase
              .from('deals_orders')
              .select('order_number')
              .eq('deal_order_id', task.related_deal_order_id)
              .single();
              
            if (orderData) {
              task.related_order_number = orderData.order_number;
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
              task.related_partner_name = partnerData.company_name;
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
              task.related_request_name = requestData.request_name;
            }
          }
          
          return task;
        })
      );
      
      return processedTasksWithRelations;
    } catch (error) {
      console.error("Error fetching tasks:", error);
      throw error;
    }
  };

  return { fetchTasks, totalCount };
}
