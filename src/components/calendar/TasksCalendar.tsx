
import React from "react";
import { useTaskFormModal } from "@/hooks/tasks/useTaskFormModal";
import TaskFormModal from "@/components/tasks/TaskFormModal";
import CalendarFilters from "./CalendarFilters";
import CalendarViewSelector from "./CalendarViewSelector";
import CalendarComponent from "./CalendarComponent";
import { useCalendarState } from "@/hooks/calendar/useCalendarState";
import { useCalendarEvents } from "@/hooks/calendar/useCalendarEvents";
import { convertTasksToEvents } from "./utils/taskToEventConverter";

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
  
  const { isOpen, selectedTask, closeModal } = useTaskFormModal();
  const { handleEventClick, handleDateClick } = useCalendarEvents(tasks);

  // Convert tasks to calendar events
  const events = convertTasksToEvents(tasks);

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-lg shadow">
        <CalendarFilters 
          onFilterChange={handleFilterChange} 
          currentFilters={filters}
        />
        
        <CalendarViewSelector
          currentView={currentView}
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
      
      {isOpen && (
        <TaskFormModal
          open={isOpen}
          onClose={closeModal}
          task={selectedTask}
        />
      )}
    </div>
  );
};

export default TasksCalendar;
