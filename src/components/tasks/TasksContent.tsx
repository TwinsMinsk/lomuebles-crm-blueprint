
import React from "react";
import { Button } from "@/components/ui/button";
import TasksTable from "./TasksTable";
import TaskFilters from "./TaskFilters";
import TasksPagination from "./TasksPagination";
import { useTasksState } from "@/hooks/tasks/useTasksState";
import { PlusCircle } from "lucide-react";
import TaskFormModal from "./TaskFormModal";
import { useTaskFormModal } from "@/hooks/tasks/useTaskFormModal";

const TasksContent: React.FC = () => {
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

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="flex-grow">
          <TaskFilters 
            filters={filters}
            setFilters={setFilters}
            resetFilters={resetFilters}
          />
        </div>
        <div className="md:self-start">
          <Button onClick={() => openModal()}>
            <PlusCircle className="mr-2 h-4 w-4" /> Новая задача
          </Button>
        </div>
      </div>
      
      <TasksTable
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
        onTaskClick={(task) => openModal(task)}
      />
      
      {pageCount > 1 && (
        <div className="flex justify-center mt-4">
          <TasksPagination
            currentPage={currentPage}
            totalPages={pageCount}
            onPageChange={setPage}
          />
        </div>
      )}

      <TaskFormModal 
        open={isOpen} 
        onClose={() => {
          closeModal();
          refetch();
        }} 
        task={selectedTask} 
      />
    </div>
  );
};

export default TasksContent;
