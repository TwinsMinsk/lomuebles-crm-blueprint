
import React from "react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { Task } from "@/types/task";
import { ResponsiveTable, ResponsiveRow, ResponsiveRowItem } from "@/components/ui/responsive-table";
import { Button } from "@/components/ui/button";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { ModernStatusBadge } from "@/components/ui/modern-status-badge";
import { ModernEmptyState } from "@/components/ui/modern-empty-state";
import { CheckSquare, Calendar, User, AlertCircle, ExternalLink } from "lucide-react";

interface ModernTasksTableProps {
  tasks: Task[];
  loading: boolean;
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
  onSort?: (column: string) => void;
  onTaskClick?: (task: Task) => void;
}

const ModernTasksTable: React.FC<ModernTasksTableProps> = ({
  tasks,
  loading,
  sortColumn,
  sortDirection,
  onSort,
  onTaskClick,
}) => {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "—";
    return format(new Date(dateString), "dd MMM yyyy", { locale: ru });
  };

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return "—";
    return format(new Date(dateString), "dd MMM yyyy HH:mm", { locale: ru });
  };

  const getPriorityColor = (priority: string | null) => {
    switch (priority) {
      case 'Высокий':
        return 'text-red-600 bg-red-50';
      case 'Средний':
        return 'text-yellow-600 bg-yellow-50';
      case 'Низкий':
        return 'text-green-600 bg-green-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Завершена':
        return 'success';
      case 'В работе':
        return 'warning';
      case 'Новая':
        return 'info';
      case 'Отменена':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  const getRelatedEntityInfo = (task: Task) => {
    if (task.related_lead_name) {
      return { type: 'Лид', name: task.related_lead_name };
    }
    if (task.related_contact_name) {
      return { type: 'Контакт', name: task.related_contact_name };
    }
    if (task.related_order_number) {
      return { type: 'Заказ', name: task.related_order_number };
    }
    if (task.related_partner_name) {
      return { type: 'Партнер', name: task.related_partner_name };
    }
    return null;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="hidden lg:block space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <LoadingSkeleton key={i} variant="table" />
          ))}
        </div>
        <div className="lg:hidden space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <LoadingSkeleton key={i} variant="card" />
          ))}
        </div>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <ModernEmptyState
        icon={CheckSquare}
        title="Задачи не найдены"
        description="Создайте первую задачу, чтобы начать работу"
      />
    );
  }

  return (
    <ResponsiveTable>
      {/* Desktop Header */}
      <thead className="hidden lg:table-header-group">
        <tr className="border-b bg-gray-50/50">
          <th className="text-left p-4 font-medium text-gray-700">Задача</th>
          <th className="text-left p-4 font-medium text-gray-700">Статус</th>
          <th className="text-left p-4 font-medium text-gray-700">Приоритет</th>
          <th className="text-left p-4 font-medium text-gray-700">Срок выполнения</th>
          <th className="text-left p-4 font-medium text-gray-700">Ответственный</th>
          <th className="text-left p-4 font-medium text-gray-700">Связанный объект</th>
        </tr>
      </thead>

      <tbody>
        {tasks.map((task) => {
          const relatedEntity = getRelatedEntityInfo(task);
          
          return (
            <ResponsiveRow
              key={task.task_id}
              onClick={() => onTaskClick?.(task)}
              className="group"
            >
              {/* Task Info */}
              <ResponsiveRowItem
                label="Задача"
                value={
                  <div className="space-y-2">
                    <div className="font-medium text-gray-900">
                      {task.task_name}
                    </div>
                    {task.description && (
                      <div className="text-sm text-gray-500 line-clamp-2">
                        {task.description}
                      </div>
                    )}
                    {task.task_type && (
                      <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded w-fit">
                        {task.task_type}
                      </div>
                    )}
                  </div>
                }
                fullWidth
              />

              {/* Status */}
              <ResponsiveRowItem
                label="Статус"
                value={
                  <ModernStatusBadge
                    status={task.task_status}
                    variant={getStatusColor(task.task_status)}
                  />
                }
              />

              {/* Priority */}
              <ResponsiveRowItem
                label="Приоритет"
                value={
                  task.priority ? (
                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {task.priority}
                    </div>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )
                }
              />

              {/* Due Date */}
              <ResponsiveRowItem
                label="Срок выполнения"
                value={
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-gray-400" />
                    <span className="text-sm">
                      {formatDateTime(task.due_date)}
                    </span>
                  </div>
                }
              />

              {/* Assigned User */}
              <ResponsiveRowItem
                label="Ответственный"
                value={
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3 text-gray-400" />
                    <span className="text-sm">
                      {task.assigned_user_name || "Не назначен"}
                    </span>
                  </div>
                }
              />

              {/* Related Entity */}
              <ResponsiveRowItem
                label="Связанный объект"
                value={
                  relatedEntity ? (
                    <div className="flex items-center gap-1">
                      <ExternalLink className="h-3 w-3 text-gray-400" />
                      <span className="text-sm">
                        <span className="font-medium">{relatedEntity.type}:</span> {relatedEntity.name}
                      </span>
                    </div>
                  ) : (
                    <span className="text-gray-400 text-sm">—</span>
                  )
                }
                fullWidth
              />
            </ResponsiveRow>
          );
        })}
      </tbody>
    </ResponsiveTable>
  );
};

export default ModernTasksTable;
