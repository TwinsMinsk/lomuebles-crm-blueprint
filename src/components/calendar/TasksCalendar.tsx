
import React from "react";
import CalendarFilters from "./CalendarFilters";
import CalendarViewSelector from "./CalendarViewSelector";
import CalendarComponent from "./CalendarComponent";
import { useCalendarState } from "@/hooks/calendar/useCalendarState";
import { useCalendarEvents } from "@/hooks/calendar/useCalendarEvents";
import { convertTasksToEvents } from "./utils/taskToEventConverter";
import { useTaskFormContext } from "@/context/TaskFormContext";

const TasksCalendar: React.FC = () => {
  const { 
    calendarRef, 
    tasks, 
    filters, 
    currentView, 
    handleFilterChange, 
    handleViewChange,
    handleEventDrop 
  } = useCalendarState();
  
  const { openModal } = useTaskFormContext();
  const { handleEventClick, handleDateClick } = useCalendarEvents(tasks);

  // Convert tasks to calendar events
  const events = convertTasksToEvents(tasks);

  // Make sure filters are properly initialized
  const safeFilters = {
    assignedUserId: filters?.assignedUserId || null,
    taskStatus: filters?.taskStatus || null
  };

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-lg shadow">
        <CalendarFilters 
          onFilterChange={handleFilterChange} 
          currentFilters={safeFilters}
        />
        
        <CalendarViewSelector
          currentView={currentView || "dayGridMonth"}
          onViewChange={handleViewChange}
        />
        
        <CalendarComponent
          calendarRef={calendarRef}
          events={events}
          onEventClick={handleEventClick}
          onDateClick={handleDateClick}
          onEventDrop={handleEventDrop}
        />
      </div>
    </div>
  );
};

export default TasksCalendar;
