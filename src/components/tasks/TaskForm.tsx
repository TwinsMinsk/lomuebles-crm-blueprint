
import React from "react";
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
    onClose();
  });

  return (
    <Form {...form}>
      <form id="task-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <BasicTaskFields />
        
        <AssignmentFields />
        
        <RelatedEntitiesFields />
      </form>
    </Form>
  );
};

export default TaskForm;
