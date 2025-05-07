
import React from "react";
import TaskFormModal from "./TaskFormModal";
import { useTaskForm } from "@/context/TaskFormContext";

const TaskFormModalContainer: React.FC = () => {
  const { isOpen, selectedTask, closeModal } = useTaskForm();

  return (
    <TaskFormModal 
      open={isOpen} 
      onClose={closeModal} 
      task={selectedTask}
    />
  );
};

export default TaskFormModalContainer;
