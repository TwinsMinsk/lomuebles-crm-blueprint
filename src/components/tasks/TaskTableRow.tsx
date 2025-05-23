
import React, { useState } from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Task } from "@/types/task";
import { format, isAfter, parseISO } from "date-fns";
import { ru } from "date-fns/locale";
import { MoreHorizontal, Trash } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import DeleteTaskDialog from "./DeleteTaskDialog";

interface TaskTableRowProps {
  task: Task;
  onTaskClick?: (task: Task) => void;
}

const TaskTableRow: React.FC<TaskTableRowProps> = ({ task, onTaskClick }) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  // Format dates
  const formattedDueDate = task.due_date
    ? format(new Date(task.due_date), "dd.MM.yyyy HH:mm", { locale: ru })
    : "—";
  
  const formattedCreationDate = task.creation_date
    ? format(new Date(task.creation_date), "dd.MM.yyyy", { locale: ru })
    : "—";
  
  // Check if task is overdue
  const isOverdue =
    task.due_date &&
    task.task_status !== "Выполнена" &&
    task.task_status !== "Отменена" &&
    isAfter(new Date(), parseISO(task.due_date));
  
  // Get related entity info
  const getRelatedEntityInfo = () => {
    if (task.related_lead_id && task.related_lead_name) {
      return <span>Лид: {task.related_lead_name}</span>;
    } else if (task.related_contact_id && task.related_contact_name) {
      return <span>Контакт: {task.related_contact_name}</span>;
    } else if (task.related_order_id && task.related_order_number) {
      return <span>Заказ: {task.related_order_number}</span>;
    } else if (task.related_partner_manufacturer_id && task.related_partner_name) {
      return <span>Партнер: {task.related_partner_name}</span>;
    } else if (task.related_custom_request_id && task.related_request_name) {
      return <span>Запрос: {task.related_request_name}</span>;
    }
    return "—";
  };

  return (
    <TableRow>
      <TableCell className="font-medium">{task.task_id}</TableCell>
      <TableCell>
        <button 
          className="text-blue-600 hover:underline text-left"
          onClick={() => onTaskClick && onTaskClick(task)}
        >
          {task.task_name}
        </button>
      </TableCell>
      <TableCell>{task.task_type || "—"}</TableCell>
      <TableCell>
        <span 
          className={`inline-flex px-2 py-1 rounded text-xs font-medium ${
            task.task_status === "Новая"
              ? "bg-blue-100 text-blue-800"
              : task.task_status === "В работе"
              ? "bg-yellow-100 text-yellow-800"
              : task.task_status === "Ожидает"
              ? "bg-purple-100 text-purple-800"
              : task.task_status === "Выполнена"
              ? "bg-green-100 text-green-800"
              : task.task_status === "Отменена"
              ? "bg-gray-100 text-gray-800"
              : ""
          }`}
        >
          {task.task_status}
        </span>
      </TableCell>
      <TableCell>
        <span
          className={isOverdue ? "text-red-600 font-medium" : ""}
        >
          {formattedDueDate}
        </span>
      </TableCell>
      <TableCell>{task.assigned_user_name || "—"}</TableCell>
      <TableCell>
        <span
          className={`${
            task.priority === "Низкий"
              ? "text-gray-600"
              : task.priority === "Средний"
              ? "text-blue-600"
              : task.priority === "Высокий"
              ? "text-orange-600"
              : task.priority === "Срочно"
              ? "text-red-600 font-medium"
              : ""
          }`}
        >
          {task.priority || "—"}
        </span>
      </TableCell>
      <TableCell>{getRelatedEntityInfo()}</TableCell>
      <TableCell>{formattedCreationDate}</TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Действия</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onTaskClick && onTaskClick(task)}>
              Редактировать
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="text-red-600 focus:text-red-600"
              onClick={() => setDeleteDialogOpen(true)}
            >
              <Trash className="h-4 w-4 mr-2" />
              Удалить
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <DeleteTaskDialog 
          task={task} 
          open={deleteDialogOpen} 
          onOpenChange={setDeleteDialogOpen}
        />
      </TableCell>
    </TableRow>
  );
};

export default TaskTableRow;
