
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Task, TasksQueryParams } from "@/types/task";
import { useAuth } from "@/context/AuthContext";
import { format } from "date-fns";

export function useTasks() {
  const [totalCount, setTotalCount] = useState(0);
  const { user } = useAuth();
  
  // Function to fetch tasks using standard Supabase queries
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
      
      // Build the query
      let query = supabase
        .from('tasks')
        .select(`
          *,
          assigned_user:profiles!tasks_assigned_task_user_id_fkey(full_name),
          creator_user:profiles!tasks_creator_user_id_fkey(full_name),
          related_lead:leads(name),
          related_contact:contacts(full_name),
          related_order:orders(order_number),
          related_partner:partners_manufacturers(company_name),
          related_request:custom_requests(request_name)
        `, { count: 'exact' });

      // Apply filters
      if (search) {
        query = query.or(`task_name.ilike.%${search}%,description.ilike.%${search}%`);
      }

      if (taskStatus) {
        query = query.eq('task_status', taskStatus);
      }

      if (taskType) {
        query = query.eq('task_type', taskType);
      }

      if (priority) {
        query = query.eq('priority', priority);
      }

      // User-based filtering
      if (assignedUserId && assignedUserId !== 'my' && assignedUserId !== 'all') {
        query = query.eq('assigned_task_user_id', assignedUserId);
      } else if (assignedUserId === 'my' || assignedToMe) {
        if (user?.id) {
          query = query.eq('assigned_task_user_id', user.id);
        }
      } else if (createdByMe) {
        if (user?.id) {
          query = query.eq('creator_user_id', user.id);
        }
      }

      // Date filtering
      if (dueDateFrom && dueDateTo) {
        query = query.gte('due_date', format(dueDateFrom, 'yyyy-MM-dd'))
                     .lte('due_date', format(dueDateTo, 'yyyy-MM-dd'));
      } else if (dueDateFrom) {
        query = query.gte('due_date', format(dueDateFrom, 'yyyy-MM-dd'));
      } else if (dueDateTo) {
        query = query.lte('due_date', format(dueDateTo, 'yyyy-MM-dd'));
      }

      // Apply sorting with custom logic for completed/cancelled tasks
      const isAscending = sortDirection === 'asc';
      
      // First sort by status to push completed/cancelled tasks to the end
      query = query.order('task_status', { 
        ascending: true,
        nullsFirst: false,
        // Custom order: active statuses first, then completed/cancelled
        foreignTable: undefined,
        referencedTable: undefined
      });
      
      // Then sort by the requested column
      if (sortColumn && sortColumn !== 'task_status') {
        query = query.order(sortColumn, { ascending: isAscending });
      }

      // Apply pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;
      
      if (error) {
        console.error("Query error:", error);
        throw new Error(error.message);
      }
      
      console.log("Fetched tasks data:", data);
      console.log("Applied filters:", {
        assignedToMe,
        createdByMe,
        assignedUserId,
        taskStatus,
        search
      });
      
      // Set total count
      setTotalCount(count || 0);
      
      // Process the tasks data
      const processedTasks: Task[] = (data || []).map((task) => ({
        task_id: task.task_id,
        task_name: task.task_name,
        description: task.description,
        task_type: task.task_type,
        task_status: task.task_status,
        priority: task.priority,
        creation_date: task.creation_date,
        due_date: task.due_date,
        completion_date: task.completion_date,
        creator_user_id: task.creator_user_id,
        assigned_task_user_id: task.assigned_task_user_id,
        google_calendar_event_id: task.google_calendar_event_id,
        related_lead_id: task.related_lead_id,
        related_contact_id: task.related_contact_id,
        related_order_id: task.related_order_id,
        related_custom_request_id: task.related_custom_request_id,
        related_partner_manufacturer_id: task.related_partner_manufacturer_id,
        // Use the names fetched by the JOINs
        related_lead_name: task.related_lead?.name || null,
        related_contact_name: task.related_contact?.full_name || null,
        related_order_number: task.related_order?.order_number || null,
        related_partner_name: task.related_partner?.company_name || null,
        related_request_name: task.related_request?.request_name || null,
        assigned_user_name: task.assigned_user?.full_name || null,
        creator_user_name: task.creator_user?.full_name || null
      }));
      
      console.log("Processed tasks count:", processedTasks.length);
      return processedTasks;
    } catch (error) {
      console.error("Error fetching tasks:", error);
      throw error;
    }
  };

  return { fetchTasks, totalCount };
}
