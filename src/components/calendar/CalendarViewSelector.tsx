
import React from "react";

interface CalendarViewSelectorProps {
  currentView: string;
  onViewChange: (viewType: string) => void;
}

const CalendarViewSelector: React.FC<CalendarViewSelectorProps> = ({ 
  currentView, 
  onViewChange 
}) => {
  return (
    <div className="mb-4 flex space-x-2">
      <button
        onClick={() => onViewChange("dayGridMonth")}
        className={`px-3 py-1.5 rounded ${
          currentView === "dayGridMonth" ? "bg-blue-600 text-white" : "bg-gray-200"
        }`}
      >
        Месяц
      </button>
      <button
        onClick={() => onViewChange("timeGridWeek")}
        className={`px-3 py-1.5 rounded ${
          currentView === "timeGridWeek" ? "bg-blue-600 text-white" : "bg-gray-200"
        }`}
      >
        Неделя
      </button>
      <button
        onClick={() => onViewChange("timeGridDay")}
        className={`px-3 py-1.5 rounded ${
          currentView === "timeGridDay" ? "bg-blue-600 text-white" : "bg-gray-200"
        }`}
      >
        День
      </button>
    </div>
  );
};

export default CalendarViewSelector;
