
import { useState } from "react";
import { Task } from "@/types/task";

export function useTaskFormModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | undefined>(undefined);

  const openModal = (task?: Task) => {
    setSelectedTask(task);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setSelectedTask(undefined);
  };

  return {
    isOpen,
    selectedTask,
    openModal,
    closeModal,
  };
}
