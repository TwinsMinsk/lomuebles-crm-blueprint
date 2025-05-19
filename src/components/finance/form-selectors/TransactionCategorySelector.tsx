
import React, { useState, useEffect } from "react";
import { Search, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { TransactionCategory } from "@/hooks/finance/useTransactionCategories";

export interface TransactionCategorySelectorProps {
  value: number | undefined;
  onChange: (value: number | undefined) => void;
  categories: TransactionCategory[];
  type: 'income' | 'expense';
  isLoading: boolean;
}

const TransactionCategorySelector: React.FC<TransactionCategorySelectorProps> = ({
  value,
  onChange,
  categories,
  type,
  isLoading
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  
  // Filter categories by type and search term
  const filteredCategories = categories
    .filter(category => category && category.type === type)
    .filter(category => 
      category?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  
  // Find the selected category
  const selectedCategory = categories.find(category => category && category.id === value);

  return (
    <div className="space-y-2">
      {selectedCategory ? (
        <div className="flex items-center justify-between p-2 rounded border">
          <div className="font-medium">{selectedCategory.name}</div>
          <button
            type="button"
            onClick={() => onChange(undefined)}
            className="text-xs text-muted-foreground hover:text-destructive"
          >
            Очистить
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Поиск категории..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>

          <div className="border rounded-md max-h-48 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span className="text-sm">Загрузка...</span>
              </div>
            ) : filteredCategories.length === 0 ? (
              <div className="p-4 text-sm text-muted-foreground">
                Категории не найдены для типа "{type === 'income' ? 'Доход' : 'Расход'}"
              </div>
            ) : (
              <ul className="py-1">
                {filteredCategories.map((category) => (
                  <li
                    key={category.id}
                    className={cn(
                      "px-2 py-1.5 hover:bg-accent cursor-pointer flex items-center",
                      category.id === value && "bg-accent"
                    )}
                    onClick={() => {
                      console.log("Category selected:", category.id, typeof category.id);
                      onChange(Number(category.id));
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        category.id === value ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="font-medium">{category.name}</div>
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

export default TransactionCategorySelector;
