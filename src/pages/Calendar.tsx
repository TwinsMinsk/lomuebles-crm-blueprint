
import React from "react";
import PageHeader from "@/components/common/PageHeader";
import TasksCalendar from "@/components/calendar/TasksCalendar";
import TaskFormModalContainer from "@/components/tasks/TaskFormModalContainer";

const Calendar: React.FC = () => {
  return (
    <div>
      <PageHeader
        title="Календарь задач"
        description="Просмотр и управление задачами в календаре"
      />
      <TasksCalendar />
      <TaskFormModalContainer />
    </div>
  );
};

export default Calendar;
