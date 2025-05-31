
import React, { useEffect } from "react";
import { Task } from "@/types/task";
import { useTaskForm } from "@/hooks/tasks/useTaskForm";
import { Form } from "@/components/ui/form";
import BasicTaskFields from "./form-sections/BasicTaskFields";
import AssignmentFields from "./form-sections/AssignmentFields";
import RelatedEntitiesFields from "./form-sections/RelatedEntitiesFields";
import TaskRelatedDetails from "./TaskRelatedDetails";
import { useAuth } from "@/context/AuthContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";

interface TaskFormProps {
  task?: Task;
  onClose: () => void;
}

const TaskForm: React.FC<TaskFormProps> = ({ task, onClose }) => {
  const { user, userRole } = useAuth();
  const { form, onSubmit, isLoading } = useTaskForm(task, () => {
    console.log("Task submission callback executed");
    onClose();
  });

  // Add debug log for tracking form submissions
  useEffect(() => {
    console.log("TaskForm mounted", { 
      isNew: !task?.task_id, 
      userRole,
      userId: user?.id 
    });
    
    return () => {
      console.log("TaskForm unmounted");
    };
  }, [task, userRole, user?.id]);

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
      {/* Info message for specialists */}
      {userRole === 'Специалист' && !task?.task_id && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Задача будет автоматически назначена на вас.
          </AlertDescription>
        </Alert>
      )}

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
