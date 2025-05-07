
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import TaskTableRow from "./TaskTableRow";
import { ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { Task } from "@/types/task";
import { format } from "date-fns";

interface TasksTableProps {
  tasks: Task[];
  loading: boolean;
  onSort?: (column: string) => void;
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
  onTaskClick?: (task: Task) => void;
}

const TasksTable: React.FC<TasksTableProps> = ({
  tasks,
  loading,
  onSort,
  sortColumn,
  sortDirection,
  onTaskClick,
}) => {
  // Function to render sort indicator
  const renderSortIndicator = (column: string) => {
    if (sortColumn === column) {
      return sortDirection === 'asc' ? (
        <ChevronUp className="inline h-4 w-4" />
      ) : (
        <ChevronDown className="inline h-4 w-4" />
      );
    }
    return null;
  };

  // Function to create sortable column headers
  const createSortableHeader = (column: string, label: string) => {
    return (
      <TableHead 
        className={onSort ? "cursor-pointer hover:bg-muted/50" : ""}
        onClick={() => onSort && onSort(column)}
      >
        <div className="flex items-center gap-1">
          {label}
          {renderSortIndicator(column)}
        </div>
      </TableHead>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            {createSortableHeader("task_name", "Название задачи")}
            {createSortableHeader("task_type", "Тип задачи")}
            {createSortableHeader("task_status", "Статус")}
            {createSortableHeader("due_date", "Срок выполнения")}
            {createSortableHeader("assigned_task_user_id", "Ответственный")}
            {createSortableHeader("priority", "Приоритет")}
            <TableHead>Связанный объект</TableHead>
            {createSortableHeader("creation_date", "Дата создания")}
            <TableHead className="w-[80px]">Действия</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.length > 0 ? (
            tasks.map((task) => (
              <TaskTableRow 
                key={task.task_id} 
                task={task}
                onTaskClick={onTaskClick}
              />
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={10} className="text-center py-4">
                Задачи не найдены
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default TasksTable;
