
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, User, AlertCircle, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle } from "@/components/ui/modern-card";
import { ModernStatusBadge } from "@/components/ui/modern-status-badge";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { ModernEmptyState } from "@/components/ui/modern-empty-state";
import TaskRelatedDetails from "@/components/tasks/TaskRelatedDetails";
import { useTaskById } from "@/hooks/tasks/useTaskById";
import { formatDateTimeInMadrid } from "@/utils/timezone";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const TaskDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const taskId = id ? parseInt(id, 10) : null;
  
  const { data: task, isLoading, error } = useTaskById(taskId);

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
      case 'Выполнена':
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

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6 space-y-6">
        <LoadingSkeleton variant="card" />
        <LoadingSkeleton variant="card" />
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="container mx-auto px-4 py-6">
        <ModernEmptyState
          icon={FileText}
          title="Задача не найдена"
          description="Запрашиваемая задача не существует или была удалена"
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/tasks">Задачи</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Задача #{task.task_id}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Back Button */}
      <Button
        variant="outline"
        onClick={() => navigate("/tasks")}
        className="flex items-center gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Назад к задачам
      </Button>

      {/* Task Details Card */}
      <ModernCard>
        <ModernCardHeader>
          <ModernCardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {task.task_name}
          </ModernCardTitle>
        </ModernCardHeader>
        <ModernCardContent className="space-y-6">
          {/* Basic Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Status */}
            <div className="space-y-2">
              <span className="text-sm font-medium text-gray-700">Статус</span>
              <div>
                <ModernStatusBadge
                  status={task.task_status}
                  variant={getStatusColor(task.task_status)}
                />
              </div>
            </div>

            {/* Priority */}
            {task.priority && (
              <div className="space-y-2">
                <span className="text-sm font-medium text-gray-700">Приоритет</span>
                <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {task.priority}
                </div>
              </div>
            )}

            {/* Type */}
            {task.task_type && (
              <div className="space-y-2">
                <span className="text-sm font-medium text-gray-700">Тип задачи</span>
                <div className="text-sm bg-gray-100 px-2 py-1 rounded w-fit">
                  {task.task_type}
                </div>
              </div>
            )}

            {/* Assigned User */}
            <div className="space-y-2">
              <span className="text-sm font-medium text-gray-700">Ответственный</span>
              <div className="flex items-center gap-1">
                <User className="h-3 w-3 text-gray-400" />
                <span className="text-sm">{task.assigned_user_name || "Не назначен"}</span>
              </div>
            </div>

            {/* Due Date */}
            {task.due_date && (
              <div className="space-y-2">
                <span className="text-sm font-medium text-gray-700">Срок выполнения</span>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3 text-gray-400" />
                  <span className="text-sm">{formatDateTimeInMadrid(task.due_date)}</span>
                </div>
              </div>
            )}

            {/* Creation Date */}
            <div className="space-y-2">
              <span className="text-sm font-medium text-gray-700">Дата создания</span>
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3 text-gray-400" />
                <span className="text-sm">{formatDateTimeInMadrid(task.creation_date)}</span>
              </div>
            </div>
          </div>

          {/* Description */}
          {task.description && (
            <div className="space-y-2">
              <span className="text-sm font-medium text-gray-700">Описание</span>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 whitespace-pre-wrap">{task.description}</p>
              </div>
            </div>
          )}
        </ModernCardContent>
      </ModernCard>

      {/* Related Details */}
      <TaskRelatedDetails taskId={task.task_id} />
    </div>
  );
};

export default TaskDetailPage;
