
import React from "react";
import { Button } from "@/components/ui/button";

interface FilterActionsProps {
  onResetFilters: () => void;
}

export const FilterActions: React.FC<FilterActionsProps> = ({ onResetFilters }) => {
  return (
    <div className="flex gap-2 justify-end">
      <Button 
        type="button" 
        variant="outline" 
        onClick={onResetFilters}
      >
        Сбросить фильтры
      </Button>
      <Button type="submit">
        Применить фильтры
      </Button>
    </div>
  );
};
