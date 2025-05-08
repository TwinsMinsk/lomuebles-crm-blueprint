
import React from "react";
import { Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

type IndustryOption = {
  value: string;
  label: string;
};

type User = {
  id: string;
  full_name: string;
};

interface CompanyFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  industryFilter: string;
  setIndustryFilter: (value: string) => void;
  ownerFilter: string;
  setOwnerFilter: (value: string) => void;
  showFilters: boolean;
  toggleFilters: () => void;
  handleResetFilters: () => void;
  industryOptions: IndustryOption[];
  users: User[];
}

const CompanyFilters: React.FC<CompanyFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  industryFilter,
  setIndustryFilter,
  ownerFilter,
  setOwnerFilter,
  showFilters,
  toggleFilters,
  handleResetFilters,
  industryOptions,
  users,
}) => {
  return (
    <>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={toggleFilters}
        className="flex items-center gap-2"
      >
        <Filter className="h-4 w-4" />
        Фильтры
      </Button>

      {showFilters && (
        <div className="mb-6 p-4 border rounded-md bg-muted/20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Поиск</label>
              <Input
                placeholder="Название, NIF/CIF, телефон или email"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Отрасль</label>
              <Select
                value={industryFilter}
                onValueChange={setIndustryFilter}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите отрасль" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="all">Все отрасли</SelectItem>
                    {industryOptions.map((industry) => (
                      <SelectItem key={industry.value} value={industry.value || "unknown-industry"}>
                        {industry.label || "Неизвестная отрасль"}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Ответственный менеджер</label>
              <Select
                value={ownerFilter}
                onValueChange={setOwnerFilter}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите менеджера" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="all">Все менеджеры</SelectItem>
                    <SelectItem value="not_assigned">Не назначен</SelectItem>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id || "unknown-user"}>
                        {user.full_name || user.id || "Неизвестный пользователь"}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={handleResetFilters}
            >
              Сбросить фильтры
            </Button>
          </div>
        </div>
      )}
    </>
  );
};

export default CompanyFilters;
