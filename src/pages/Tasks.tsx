
import React from "react";
import { useAuth } from "@/context/AuthContext";
import PageHeader from "@/components/common/PageHeader";
import TasksContent from "@/components/tasks/TasksContent";

const Tasks: React.FC = () => {
  const { userRole } = useAuth();

  return (
    <div>
      <PageHeader
        title="Задачи"
        description="Управление задачами и отслеживание их выполнения"
      />
      <TasksContent />
    </div>
  );
};

export default Tasks;
