
import React from "react";
import { Task } from "@/types/task";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import TaskForm from "./TaskForm";

interface TaskFormModalProps {
  open: boolean;
  onClose: () => void;
  task?: Task;
}

const TaskFormModal: React.FC<TaskFormModalProps> = ({
  open,
  onClose,
  task,
}) => {
  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {task ? "Редактировать задачу" : "Новая задача"}
          </DialogTitle>
        </DialogHeader>
        <TaskForm task={task} onClose={onClose} />
      </DialogContent>
    </Dialog>
  );
};

export default TaskFormModal;
