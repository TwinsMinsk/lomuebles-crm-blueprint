
import React from "react";
import { useAuth } from "@/context/AuthContext";
import { ModernHeader } from "@/components/ui/modern-header";
import TasksContent from "@/components/tasks/TasksContent";
import { CheckSquare } from "lucide-react";

const Tasks: React.FC = () => {
  const { userRole } = useAuth();

  const breadcrumbs = [
    { label: "CRM", href: "/dashboard" },
    { label: "Задачи" }
  ];

  return (
    <div className="container mx-auto py-6 px-4 lg:px-6">
      <ModernHeader
        title="Задачи"
        description="Управление задачами и отслеживание их выполнения"
        breadcrumbs={breadcrumbs}
      />
      <TasksContent />
    </div>
  );
};

export default Tasks;
