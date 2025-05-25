
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { DateRangePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter, ChevronDown, ChevronUp, Search } from "lucide-react";
import { useTransactionCategories } from "@/hooks/finance/useTransactionCategories";

interface LocalTransactionsFilters {
  dateFrom?: Date;
  dateTo?: Date;
  type?: 'income' | 'expense' | 'all';
  categoryId?: number;
  searchTerm?: string;
}

interface CollapsibleTransactionFiltersProps {
  filters: LocalTransactionsFilters;
  setFilters: (filters: LocalTransactionsFilters) => void;
  onResetFilters: () => void;
}

const CollapsibleTransactionFilters: React.FC<CollapsibleTransactionFiltersProps> = ({
  filters,
  setFilters,
  onResetFilters,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { data: categories = [] } = useTransactionCategories();

  const handleFilterChange = (key: keyof LocalTransactionsFilters, value: any) => {
    setFilters({ ...filters, [key]: value });
  };

  return (
    <Card>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button 
            variant="ghost" 
            className="w-full justify-between p-4 h-auto"
          >
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <span>Фильтры операций</span>
            </div>
            {isOpen ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="pt-0 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Date Range */}
              <div>
                <label className="text-sm font-medium mb-2 block">Период</label>
                <DateRangePicker
                  dateFrom={filters.dateFrom}
                  dateTo={filters.dateTo}
                  onDateFromChange={(date) => handleFilterChange('dateFrom', date)}
                  onDateToChange={(date) => handleFilterChange('dateTo', date)}
                />
              </div>
              
              {/* Transaction Type */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Тип операции</label>
                <Select
                  value={filters.type || 'all'}
                  onValueChange={(value: 'income' | 'expense' | 'all') => 
                    handleFilterChange('type', value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Все типы" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все типы</SelectItem>
                    <SelectItem value="income">Доходы</SelectItem>
                    <SelectItem value="expense">Расходы</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Category */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Категория</label>
                <Select
                  value={filters.categoryId?.toString() || ""}
                  onValueChange={(value) => 
                    handleFilterChange('categoryId', value && value !== "all-categories" ? parseInt(value) : undefined)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Все категории" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-categories">Все категории</SelectItem>
                    {categories && categories.length > 0 && categories
                      .filter(cat => !filters.type || filters.type === 'all' || cat.type === filters.type)
                      .map(category => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.name}
                        </SelectItem>
                      ))
                    }
                  </SelectContent>
                </Select>
              </div>
              
              {/* Search */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Поиск</label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Поиск по описанию..."
                    className="pl-8"
                    value={filters.searchTerm || ''}
                    onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Filter Actions */}
            <div className="flex gap-2 pt-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onResetFilters}
              >
                Сбросить фильтры
              </Button>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default CollapsibleTransactionFilters;
