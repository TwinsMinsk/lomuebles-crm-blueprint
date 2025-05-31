
import React, { useEffect } from "react";
import { Task } from "@/types/task";
import { useTaskForm } from "@/hooks/tasks/useTaskForm";
import { Form } from "@/components/ui/form";
import BasicTaskFields from "./form-sections/BasicTaskFields";
import AssignmentFields from "./form-sections/AssignmentFields";
import RelatedEntitiesFields from "./form-sections/RelatedEntitiesFields";
import TaskRelatedDetails from "./TaskRelatedDetails";
import { useAuth } from "@/context/AuthContext";

interface TaskFormProps {
  task?: Task;
  onClose: () => void;
}

const TaskForm: React.FC<TaskFormProps> = ({ task, onClose }) => {
  const { userRole } = useAuth();
  const { form, onSubmit, isLoading } = useTaskForm(task, () => {
    console.log("Task submission callback executed");
    onClose();
  });

  // Add debug log for tracking form submissions
  useEffect(() => {
    console.log("TaskForm mounted", { isNew: !task?.task_id });
    
    return () => {
      console.log("TaskForm unmounted");
    };
  }, [task]);

  const handleSubmit = (data: any) => {
    console.log("Form submitted with data:", data);
    onSubmit(data);
  };

  // Show related details for existing tasks, especially for specialists
  const shouldShowRelatedDetails = task?.task_id && (
    userRole === 'Специалист' || 
    userRole === 'Главный Администратор' || 
    userRole === 'Администратор'
  );

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form 
          id="task-form" 
          onSubmit={form.handleSubmit(handleSubmit)} 
          className="space-y-6"
        >
          <BasicTaskFields />
          
          <AssignmentFields />
          
          <RelatedEntitiesFields />

          {/* Note: We're not adding a submit button here as it's in the modal footer */}
        </form>
      </Form>

      {/* Show related details section for existing tasks */}
      {shouldShowRelatedDetails && (
        <div className="border-t pt-6">
          <TaskRelatedDetails taskId={task?.task_id} />
        </div>
      )}
    </div>
  );
};

export default TaskForm;
