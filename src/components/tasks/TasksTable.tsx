
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
import { ChevronDown, ChevronUp } from "lucide-react";
import { Task } from "@/types/task";

interface TasksTableProps {
  tasks: Task[];
  loading: boolean;
  onSort?: (column: string) => void;
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
}

const TasksTable: React.FC<TasksTableProps> = ({
  tasks,
  loading,
  onSort,
  sortColumn,
  sortDirection,
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
            {createSortableHeader("assigned_name", "Ответственный")}
            {createSortableHeader("priority", "Приоритет")}
            <TableHead>Связанный объект</TableHead>
            {createSortableHeader("creation_date", "Дата создания")}
            <TableHead className="w-[80px]">Действия</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={10} className="text-center py-4">
                Загрузка задач...
              </TableCell>
            </TableRow>
          ) : tasks.length > 0 ? (
            tasks.map((task) => (
              <TaskTableRow 
                key={task.task_id} 
                task={task}
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
