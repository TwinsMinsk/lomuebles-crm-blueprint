
import React from "react";
import { TableRow, TableCell } from "@/components/ui/table";
import { formatDate } from "@/lib/utils";
import { Task } from "@/types/task";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Edit, Eye } from "lucide-react";
import { cn } from "@/lib/utils";

interface TaskTableRowProps {
  task: Task;
}

const TaskTableRow: React.FC<TaskTableRowProps> = ({ task }) => {
  // Function to format the due date and check if it's overdue
  const formatDueDate = (dueDate: string | null) => {
    if (!dueDate) return "-";
    
    const formattedDate = new Date(dueDate).toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    
    const isOverdue = task.task_status !== 'Завершена' && new Date(dueDate) < new Date();
    
    return (
      <span className={cn(isOverdue ? "text-red-500 font-medium" : "")}>
        {formattedDate}
      </span>
    );
  };

  // Function to render the related entity link
  const renderRelatedEntity = () => {
    if (task.related_lead_id && task.related_lead_name) {
      return (
        <Link to={`/leads/${task.related_lead_id}`} className="text-blue-600 hover:underline">
          Лид: {task.related_lead_name}
        </Link>
      );
    } else if (task.related_contact_id && task.related_contact_name) {
      return (
        <Link to={`/contacts/${task.related_contact_id}`} className="text-blue-600 hover:underline">
          Контакт: {task.related_contact_name}
        </Link>
      );
    } else if (task.related_deal_order_id && task.related_order_number) {
      return (
        <Link to={`/orders/${task.related_deal_order_id}`} className="text-blue-600 hover:underline">
          Заказ: {task.related_order_number}
        </Link>
      );
    } else if (task.related_partner_manufacturer_id && task.related_partner_name) {
      return (
        <Link to={`/partners/${task.related_partner_manufacturer_id}`} className="text-blue-600 hover:underline">
          Партнер-изготовитель: {task.related_partner_name}
        </Link>
      );
    } else if (task.related_custom_request_id && task.related_request_name) {
      return (
        <Link to={`/custom-requests/${task.related_custom_request_id}`} className="text-blue-600 hover:underline">
          Запрос на кастом: {task.related_request_name}
        </Link>
      );
    } else {
      return "Нет связи";
    }
  };

  return (
    <TableRow>
      <TableCell>{task.task_id}</TableCell>
      <TableCell>{task.task_name}</TableCell>
      <TableCell>{task.task_type || "-"}</TableCell>
      <TableCell>{task.task_status}</TableCell>
      <TableCell>{formatDueDate(task.due_date)}</TableCell>
      <TableCell>{task.assigned_user_name || "-"}</TableCell>
      <TableCell>{task.priority || "Средний"}</TableCell>
      <TableCell>{renderRelatedEntity()}</TableCell>
      <TableCell>{formatDate(task.creation_date)}</TableCell>
      <TableCell>
        <div className="flex items-center space-x-1">
          <Button variant="ghost" size="sm">
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};

export default TaskTableRow;
