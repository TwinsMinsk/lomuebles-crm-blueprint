
import React from "react";

interface CalendarViewSelectorProps {
  currentView: string;
  onViewChange: (viewType: string) => void;
}

const CalendarViewSelector: React.FC<CalendarViewSelectorProps> = ({ 
  currentView, 
  onViewChange 
}) => {
  // Ensure currentView is never an empty string
  const safeCurrentView = currentView || "dayGridMonth";
  
  return (
    <div className="mb-4 flex space-x-2">
      <button
        onClick={() => onViewChange("dayGridMonth")}
        className={`px-3 py-1.5 rounded ${
          safeCurrentView === "dayGridMonth" ? "bg-blue-600 text-white" : "bg-gray-200"
        }`}
      >
        Месяц
      </button>
      <button
        onClick={() => onViewChange("timeGridWeek")}
        className={`px-3 py-1.5 rounded ${
          safeCurrentView === "timeGridWeek" ? "bg-blue-600 text-white" : "bg-gray-200"
        }`}
      >
        Неделя
      </button>
      <button
        onClick={() => onViewChange("timeGridDay")}
        className={`px-3 py-1.5 rounded ${
          safeCurrentView === "timeGridDay" ? "bg-blue-600 text-white" : "bg-gray-200"
        }`}
      >
        День
      </button>
    </div>
  );
};

export default CalendarViewSelector;
