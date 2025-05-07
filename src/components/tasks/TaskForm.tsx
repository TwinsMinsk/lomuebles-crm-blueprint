
import React from "react";
import { Task } from "@/types/task";
import { useTaskForm } from "@/hooks/tasks/useTaskForm";
import { Form } from "@/components/ui/form";
import BasicTaskFields from "./form-sections/BasicTaskFields";
import AssignmentFields from "./form-sections/AssignmentFields";
import RelatedEntitiesFields_TEMP from "./form-sections/RelatedEntitiesFields_TEMP";

interface TaskFormProps {
  task?: Task;
  onClose: () => void;
}

const TaskForm: React.FC<TaskFormProps> = ({ task, onClose }) => {
  const { form, onSubmit, isLoading } = useTaskForm(task, () => {
    onClose();
  });

  return (
    <Form {...form}>
      <form id="task-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <BasicTaskFields />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AssignmentFields />
        </div>
        
        <RelatedEntitiesFields_TEMP />
      </form>
    </Form>
  );
};

export default TaskForm;
