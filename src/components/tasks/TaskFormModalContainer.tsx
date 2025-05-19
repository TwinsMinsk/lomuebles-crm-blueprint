
import React from "react";
import TaskFormModal from "./TaskFormModal";
import { useTaskForm } from "@/context/TaskFormContext";

const TaskFormModalContainer: React.FC = () => {
  const { isOpen, selectedTask, closeModal } = useTaskForm();

  return isOpen ? (
    <TaskFormModal 
      open={isOpen} 
      onClose={closeModal} 
      task={selectedTask}
    />
  ) : null;
};

export default TaskFormModalContainer;
