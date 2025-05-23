
import React from "react";
import TaskFormModal from "./TaskFormModal";
import { useTaskFormContext } from "@/context/TaskFormContext";

const TaskFormModalContainer: React.FC = () => {
  const { isOpen, selectedTask, closeModal } = useTaskFormContext();

  return isOpen ? (
    <TaskFormModal 
      open={isOpen} 
      onClose={closeModal} 
      task={selectedTask}
    />
  ) : null;
};

export default TaskFormModalContainer;
