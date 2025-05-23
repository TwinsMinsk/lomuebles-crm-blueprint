
import React, { useEffect } from "react";
import { Task } from "@/types/task";
import { useTaskForm } from "@/hooks/tasks/useTaskForm";
import { Form } from "@/components/ui/form";
import BasicTaskFields from "./form-sections/BasicTaskFields";
import AssignmentFields from "./form-sections/AssignmentFields";
import RelatedEntitiesFields from "./form-sections/RelatedEntitiesFields";

interface TaskFormProps {
  task?: Task;
  onClose: () => void;
}

const TaskForm: React.FC<TaskFormProps> = ({ task, onClose }) => {
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

  return (
    <Form {...form}>
      <form 
        id="task-form" 
        onSubmit={form.handleSubmit(handleSubmit)} 
        className="space-y-6"
      >
        <BasicTaskFields />
        
        <AssignmentFields />
        
        <RelatedEntitiesFields />
      </form>
    </Form>
  );
};

export default TaskForm;
