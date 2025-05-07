
import React from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import ruLocale from '@fullcalendar/core/locales/ru';
import { Task } from "@/types/task";
import { useAuth } from "@/context/AuthContext";

interface CalendarComponentProps {
  calendarRef: React.RefObject<FullCalendar>;
  events: any[];
  onEventClick: (info: any) => void;
  onDateClick: (info: any) => void;
  onEventDrop: (info: any) => void;
}

const CalendarComponent: React.FC<CalendarComponentProps> = ({
  calendarRef,
  events,
  onEventClick,
  onDateClick,
  onEventDrop
}) => {
  return (
    <div className="calendar-container" style={{ height: "700px" }}>
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: ''
        }}
        locale={ruLocale}
        events={events}
        eventClick={onEventClick}
        dateClick={onDateClick}
        eventTimeFormat={{
          hour: '2-digit',
          minute: '2-digit',
          meridiem: false,
          hour12: false
        }}
        eventContent={(eventInfo) => (
          <div className="fc-event-content p-1">
            <div className="text-sm font-medium truncate">{eventInfo.event.title}</div>
            <div className="text-xs truncate">
              {eventInfo.timeText} - {eventInfo.event.extendedProps.assignee}
            </div>
            {eventInfo.event.extendedProps.type && (
              <div className="text-xs truncate">{eventInfo.event.extendedProps.type}</div>
            )}
          </div>
        )}
        editable={true}
        droppable={true}
        eventDrop={onEventDrop}
        // Fixed properties according to the FullCalendar TimeGrid options
        dayMaxEvents={true}
        slotMinTime="08:00:00"
        slotMaxTime="20:00:00"
        // The problematic property has been renamed to allDayContent
        allDayContent=""
      />
    </div>
  );
};

export default CalendarComponent;
