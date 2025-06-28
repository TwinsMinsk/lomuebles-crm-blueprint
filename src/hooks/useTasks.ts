
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Task, TasksQueryParams } from "@/types/task";
import { useAuth } from "@/context/AuthContext";
import { format } from "date-fns";

export function useTasks() {
  const [totalCount, setTotalCount] = useState(0);
  const { user } = useAuth();
  
  // Function to fetch tasks using the updated RPC function with JOINs
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
      
      // Improved filter logic: Use OR condition when both assignedToMe and createdByMe are true
      // This ensures we show tasks that are either assigned to the user OR created by them
      let finalAssignedToMe = assignedToMe || false;
      let finalCreatedByMe = createdByMe || false;
      let finalAssignedUserId = assignedUserId || null;
      
      // If a specific user is selected, override the me filters
      if (assignedUserId && assignedUserId !== 'my' && assignedUserId !== 'all') {
        finalAssignedUserId = assignedUserId;
        finalAssignedToMe = false;
        finalCreatedByMe = false;
      } else if (assignedUserId === 'my') {
        finalAssignedToMe = true;
        finalCreatedByMe = false;
        finalAssignedUserId = null;
      } else if (assignedUserId === 'all') {
        finalAssignedToMe = false;
        finalCreatedByMe = false;
        finalAssignedUserId = null;
      }
      
      // Call the updated RPC function
      const { data, error } = await supabase.rpc('get_tasks_with_custom_sort', {
        p_page: page,
        p_page_size: pageSize,
        p_sort_column: sortColumn,
        p_sort_direction: sortDirection,
        p_search: search || null,
        p_task_status: taskStatus || null,
        p_task_type: taskType || null,
        p_priority: priority || null,
        p_assigned_user_id: finalAssignedUserId,
        p_assigned_to_me: finalAssignedToMe,
        p_created_by_me: finalCreatedByMe,
        p_due_date_from: dueDateFrom ? format(dueDateFrom, 'yyyy-MM-dd') : null,
        p_due_date_to: dueDateTo ? format(dueDateTo, 'yyyy-MM-dd') : null,
        p_current_user_id: user?.id || null
      });
      
      if (error) {
        console.error("RPC function error:", error);
        throw new Error(error.message);
      }
      
      console.log("Fetched tasks data:", data);
      console.log("Applied filters:", {
        finalAssignedToMe,
        finalCreatedByMe,
        finalAssignedUserId,
        taskStatus,
        search
      });
      
      // Set total count from the first row (all rows have the same total_count)
      if (data && data.length > 0) {
        setTotalCount(data[0].total_count || 0);
      } else {
        setTotalCount(0);
      }
      
      // The data now includes all the related entity names from the JOINs
      // No need for additional queries - just return the data as Task objects
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
        related_lead_name: task.related_lead_name,
        related_contact_name: task.related_contact_name,
        related_order_number: task.related_order_number,
        related_partner_name: task.related_partner_name,
        related_request_name: task.related_request_name,
        assigned_user_name: task.assigned_user_name,
        creator_user_name: task.creator_user_name
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
