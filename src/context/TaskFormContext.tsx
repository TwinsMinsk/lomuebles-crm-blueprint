
import React, { createContext, useContext, ReactNode } from "react";
import { Task } from "@/types/task";
import { useTaskFormModal } from "@/hooks/tasks/useTaskFormModal";

type TaskFormContextType = {
  isOpen: boolean;
  selectedTask?: Task;
  openModal: (task?: Task) => void;
  closeModal: () => void;
};

const TaskFormContext = createContext<TaskFormContextType | undefined>(undefined);

export const TaskFormProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isOpen, selectedTask, openModal, closeModal } = useTaskFormModal();

  return (
    <TaskFormContext.Provider value={{ isOpen, selectedTask, openModal, closeModal }}>
      {children}
      
      {/* We import TaskFormModalContainer here to avoid circular dependencies */}
      {isOpen && <TaskFormModalContainer />}
    </TaskFormContext.Provider>
  );
};

export const useTaskForm = () => {
  const context = useContext(TaskFormContext);
  if (!context) {
    throw new Error("useTaskForm must be used within a TaskFormProvider");
  }
  return context;
};

// Import here to prevent circular dependencies
import TaskFormModalContainer from "@/components/tasks/TaskFormModalContainer";
