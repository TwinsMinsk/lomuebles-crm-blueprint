
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Task, TasksQueryParams } from "@/types/task";
import { useAuth } from "@/context/AuthContext";
import { format, parseISO, isWithinInterval } from "date-fns";

export function useTasks() {
  const [totalCount, setTotalCount] = useState(0);
  const { user } = useAuth();
  
  // Function to fetch all tasks using the RPC function
  const fetchTasks = async ({
    page = 1,
    pageSize = 10,
    sortColumn = 'task_status',
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
      
      // Call the RPC function to get all sorted tasks
      const { data: allTasks, error } = await supabase.rpc('get_sorted_tasks');
      
      if (error) {
        console.error("RPC error:", error);
        throw new Error(error.message);
      }
      
      console.log("Fetched all tasks from RPC:", allTasks?.length || 0);
      console.log("First 3 tasks order from RPC:", allTasks?.slice(0, 3).map(t => ({ 
        id: t.task_id, 
        name: t.task_name, 
        status: t.task_status 
      })));
      
      // Convert to Task format and apply client-side filtering
      let filteredTasks: Task[] = (allTasks || []).map((task: any) => ({
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
        // Names are now included from the RPC function
        assigned_user_name: task.assigned_user_name,
        creator_user_name: task.creator_user_name,
        // Set null values for related entity names (not included in RPC)
        related_lead_name: null,
        related_contact_name: null,
        related_order_number: null,
        related_partner_name: null,
        related_request_name: null
      }));

      // Apply filters
      if (search) {
        const searchLower = search.toLowerCase();
        filteredTasks = filteredTasks.filter(task =>
          task.task_name.toLowerCase().includes(searchLower) ||
          (task.description && task.description.toLowerCase().includes(searchLower))
        );
      }

      if (taskStatus) {
        filteredTasks = filteredTasks.filter(task => task.task_status === taskStatus);
      }

      if (taskType) {
        filteredTasks = filteredTasks.filter(task => task.task_type === taskType);
      }

      if (priority) {
        filteredTasks = filteredTasks.filter(task => task.priority === priority);
      }

      // User-based filtering
      if (assignedUserId && assignedUserId !== 'my' && assignedUserId !== 'all') {
        filteredTasks = filteredTasks.filter(task => task.assigned_task_user_id === assignedUserId);
      } else if (assignedUserId === 'my' || assignedToMe) {
        if (user?.id) {
          filteredTasks = filteredTasks.filter(task => task.assigned_task_user_id === user.id);
        }
      } else if (createdByMe) {
        if (user?.id) {
          filteredTasks = filteredTasks.filter(task => task.creator_user_id === user.id);
        }
      }

      // Date filtering
      if (dueDateFrom || dueDateTo) {
        filteredTasks = filteredTasks.filter(task => {
          if (!task.due_date) return false;
          
          const taskDate = parseISO(task.due_date);
          
          if (dueDateFrom && dueDateTo) {
            return isWithinInterval(taskDate, { start: dueDateFrom, end: dueDateTo });
          } else if (dueDateFrom) {
            return taskDate >= dueDateFrom;
          } else if (dueDateTo) {
            return taskDate <= dueDateTo;
          }
          
          return true;
        });
      }

      // Set total count after filtering
      setTotalCount(filteredTasks.length);
      
      // Only apply client-side sorting if the user explicitly chose a different sort column
      // The RPC function already provides optimal sorting by status, so we preserve that order
      // unless the user wants to sort by a specific column
      if (sortColumn && sortColumn !== 'task_status') {
        console.log("Applying client-side sorting by:", sortColumn, sortDirection);
        filteredTasks.sort((a, b) => {
          const aValue = a[sortColumn as keyof Task];
          const bValue = b[sortColumn as keyof Task];
          
          if (aValue === null || aValue === undefined) return 1;
          if (bValue === null || bValue === undefined) return -1;
          
          let comparison = 0;
          if (aValue < bValue) comparison = -1;
          if (aValue > bValue) comparison = 1;
          
          return sortDirection === 'desc' ? -comparison : comparison;
        });
        
        console.log("After client sorting, first 3 tasks:", filteredTasks.slice(0, 3).map(t => ({ 
          id: t.task_id, 
          name: t.task_name, 
          status: t.task_status,
          sortField: t[sortColumn as keyof Task]
        })));
      } else {
        console.log("Using RPC sorting order (by status), first 3 tasks:", filteredTasks.slice(0, 3).map(t => ({ 
          id: t.task_id, 
          name: t.task_name, 
          status: t.task_status 
        })));
      }
      
      // Apply pagination
      const startIndex = (page - 1) * pageSize;
      const paginatedTasks = filteredTasks.slice(startIndex, startIndex + pageSize);
      
      console.log("Applied filters:", {
        assignedToMe,
        createdByMe,
        assignedUserId,
        taskStatus,
        search,
        totalFiltered: filteredTasks.length,
        paginated: paginatedTasks.length,
        sortColumn,
        sortDirection
      });
      
      return paginatedTasks;
    } catch (error) {
      console.error("Error fetching tasks:", error);
      throw error;
    }
  };

  return { fetchTasks, totalCount };
}
