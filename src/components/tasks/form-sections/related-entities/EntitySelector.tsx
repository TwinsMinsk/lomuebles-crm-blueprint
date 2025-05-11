
import React from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

export interface EntityOption {
  id: number | string;
  name: string;
  description?: string;
  imageUrl?: string | null;
  subtitle?: string;
}

export interface EntitySelectorProps {
  value: number | string | undefined;
  onChange: (value: number | undefined) => void;
  options: EntityOption[];
  isLoading: boolean;
  error: string | null;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  placeholder: string;
  emptyMessage: string;
  entityLabel: string;
}

const EntitySelector: React.FC<EntitySelectorProps> = ({
  value,
  onChange,
  options,
  isLoading,
  error,
  searchTerm,
  onSearchChange,
  placeholder,
  emptyMessage,
  entityLabel
}) => {
  const selectedOption = options.find(option => option.id === value);

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{entityLabel}</label>
      {selectedOption ? (
        <div className="flex flex-col space-y-2">
          <div className="flex items-center p-2 rounded border">
            <div className="flex-1">
              <div className="font-medium">{selectedOption.name}</div>
              {selectedOption.subtitle && (
                <div className="text-sm text-muted-foreground">{selectedOption.subtitle}</div>
              )}
            </div>
            <button
              type="button"
              onClick={() => onChange(undefined)}
              className="text-xs text-muted-foreground hover:text-destructive"
            >
              Очистить
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={placeholder}
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-8"
            />
          </div>

          <div className="border rounded-md max-h-48 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span className="text-sm">Загрузка...</span>
              </div>
            ) : error ? (
              <div className="p-4 text-sm text-destructive">
                Ошибка: {error}
              </div>
            ) : options.length === 0 ? (
              <div className="p-4 text-sm text-muted-foreground">
                {emptyMessage}
              </div>
            ) : (
              <ul className="py-1">
                {options.map((option) => (
                  <li
                    key={option.id}
                    className="px-2 py-1.5 hover:bg-accent cursor-pointer"
                    onClick={() => onChange(Number(option.id))}
                  >
                    <div className="font-medium">{option.name}</div>
                    {option.description && (
                      <div className="text-xs text-muted-foreground">
                        {option.description}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EntitySelector;
