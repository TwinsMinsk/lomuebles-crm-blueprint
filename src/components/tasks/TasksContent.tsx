
import React from "react";
import { Button } from "@/components/ui/button";
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle } from "@/components/ui/modern-card";
import { FloatingActionButton } from "@/components/ui/floating-action-button";
import ModernTasksTable from "./ModernTasksTable";
import CollapsibleTaskFilters from "./CollapsibleTaskFilters";
import TasksPagination from "./TasksPagination";
import { useTasksState } from "@/hooks/tasks/useTasksState";
import { PlusCircle, CheckSquare } from "lucide-react";
import TaskFormModal from "./TaskFormModal";
import { useTaskFormModal } from "@/hooks/tasks/useTaskFormModal";
import { Task } from "@/types/task";
import { useAuth } from "@/context/AuthContext";

const TasksContent: React.FC = () => {
  const { userRole } = useAuth();
  const {
    tasks,
    isLoading,
    pageCount,
    currentPage,
    pageSize,
    sortColumn,
    sortDirection,
    filters,
    setPage,
    setPageSize,
    setSortColumn,
    setSortDirection,
    setFilters,
    resetFilters,
    refetch,
  } = useTasksState();

  const { isOpen, selectedTask, openModal, closeModal } = useTaskFormModal();

  const handleTaskEdit = (task: Task) => {
    openModal(task);
  };

  const handleCloseModal = () => {
    closeModal();
    refetch();
  };

  // Only show create button for admins and managers
  const canCreateTasks = userRole !== 'Специалист';

  return (
    <div className="space-y-6">
      <CollapsibleTaskFilters 
        filters={filters}
        setFilters={setFilters}
        resetFilters={resetFilters}
      />

      <ModernCard>
        <ModernCardHeader>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <ModernCardTitle className="flex items-center gap-2">
                <CheckSquare className="h-5 w-5" />
                Список задач
              </ModernCardTitle>
              <p className="text-gray-600 mt-1">
                Управление задачами и отслеживание их выполнения
              </p>
            </div>
            {canCreateTasks && (
              <div className="hidden lg:block">
                <Button onClick={() => openModal()} className="flex items-center gap-2">
                  <PlusCircle className="h-4 w-4" />
                  Новая задача
                </Button>
              </div>
            )}
          </div>
        </ModernCardHeader>
        <ModernCardContent className="p-0">
          <ModernTasksTable
            tasks={tasks}
            loading={isLoading}
            sortColumn={sortColumn}
            sortDirection={sortDirection}
            onSort={(column) => {
              if (sortColumn === column) {
                setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
              } else {
                setSortColumn(column);
                setSortDirection('asc');
              }
            }}
            onTaskEdit={handleTaskEdit}
          />
        </ModernCardContent>
      </ModernCard>
      
      {pageCount > 1 && (
        <div className="flex justify-center">
          <TasksPagination
            currentPage={currentPage}
            totalPages={pageCount}
            onPageChange={setPage}
          />
        </div>
      )}

      {/* Mobile FAB - only for admins and managers */}
      {canCreateTasks && (
        <FloatingActionButton
          onClick={() => openModal()}
          icon={<PlusCircle className="h-6 w-6" />}
          label="Новая задача"
        />
      )}

      {/* Task Modal - only for admins and managers */}
      {canCreateTasks && isOpen && (
        <TaskFormModal 
          open={isOpen} 
          onClose={handleCloseModal} 
          task={selectedTask} 
        />
      )}
    </div>
  );
};

export default TasksContent;
