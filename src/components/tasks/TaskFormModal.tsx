
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import TaskForm from "./TaskForm";
import { Task } from "@/types/task";
import { useTaskForm } from "@/hooks/tasks/useTaskForm";
import { Loader2, Trash } from "lucide-react";
import DeleteTaskDialog from "./DeleteTaskDialog";

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
  const isNewTask = !task?.task_id;
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  // Debug the modal rendering
  useEffect(() => {
    console.log("TaskFormModal rendered", { isOpen: open, isNewTask });
  }, [open, isNewTask]);

  return (
    <>
      <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isNewTask ? "Создать новую задачу" : "Редактировать задачу"}
            </DialogTitle>
          </DialogHeader>
          
          <TaskForm task={task} onClose={onClose} />
          
          <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:justify-between mt-4">
            <div>
              {!isNewTask && (
                <Button 
                  variant="destructive" 
                  type="button" 
                  onClick={() => setDeleteDialogOpen(true)}
                >
                  <Trash className="h-4 w-4 mr-2" />
                  Удалить задачу
                </Button>
              )}
            </div>
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={onClose}
              >
                Отмена
              </Button>
              <Button 
                type="submit"
                form="task-form"
              >
                {isNewTask ? "Создать" : "Сохранить"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {!isNewTask && (
        <DeleteTaskDialog
          task={task || null}
          open={deleteDialogOpen}
          onOpenChange={(isOpen) => {
            setDeleteDialogOpen(isOpen);
            if (!isOpen) {
              // Close the form modal if deletion is successful
              onClose();
            }
          }}
        />
      )}
    </>
  );
};

export default TaskFormModal;
