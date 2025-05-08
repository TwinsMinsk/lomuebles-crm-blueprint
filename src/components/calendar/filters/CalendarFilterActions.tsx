
import React from "react";
import { Button } from "@/components/ui/button";

interface CalendarFilterActionsProps {
  onApply: () => void;
  onReset: () => void;
}

const CalendarFilterActions: React.FC<CalendarFilterActionsProps> = ({
  onApply,
  onReset
}) => {
  return (
    <div className="flex space-x-2">
      <Button
        onClick={onApply}
        variant="default"
      >
        Применить
      </Button>
      <Button
        onClick={onReset}
        variant="outline"
      >
        Сбросить
      </Button>
    </div>
  );
};

export default CalendarFilterActions;
