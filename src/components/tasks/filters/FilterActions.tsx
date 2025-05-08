
import React from "react";
import { Button } from "@/components/ui/button";

interface FilterActionsProps {
  onApply: () => void;
  onReset: () => void;
}

const FilterActions: React.FC<FilterActionsProps> = ({ onApply, onReset }) => {
  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" onClick={onApply}>
        Применить фильтры
      </Button>
      <Button variant="outline" onClick={onReset}>
        Сбросить фильтры
      </Button>
    </div>
  );
};

export default FilterActions;
