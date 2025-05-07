
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import TasksTable from "./TasksTable";
import TaskFilters from "./TaskFilters";
import TasksPagination from "./TasksPagination";
import { useTasksState } from "@/hooks/tasks/useTasksState";
import { PlusCircle } from "lucide-react";

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
  } = useTasksState();

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <TaskFilters 
          filters={filters}
          setFilters={setFilters}
          resetFilters={resetFilters}
        />
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Новая задача
        </Button>
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
    </div>
  );
};

export default TasksContent;
