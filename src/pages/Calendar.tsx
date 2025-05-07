
import React from "react";
import { useAuth } from "@/context/AuthContext";
import PageHeader from "@/components/common/PageHeader";
import TasksCalendar from "@/components/calendar/TasksCalendar";

const Calendar: React.FC = () => {
  return (
    <div>
      <PageHeader
        title="Календарь задач"
        description="Просмотр и управление задачами в календаре"
      />
      <TasksCalendar />
    </div>
  );
};

export default Calendar;
