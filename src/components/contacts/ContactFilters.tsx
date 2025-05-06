
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

type Company = {
  company_id: number;
  company_name: string;
};

type User = {
  id: string;
  full_name: string;
};

interface ContactFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  companyFilter: string;
  setCompanyFilter: (value: string) => void;
  ownerFilter: string;
  setOwnerFilter: (value: string) => void;
  showFilters: boolean;
  toggleFilters: () => void;
  handleResetFilters: () => void;
  companies: Company[];
  users: User[];
}

const ContactFilters: React.FC<ContactFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  companyFilter,
  setCompanyFilter,
  ownerFilter,
  setOwnerFilter,
  showFilters,
  toggleFilters,
  handleResetFilters,
  companies,
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
                placeholder="Имя, телефон или email"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Компания</label>
              <Select
                value={companyFilter}
                onValueChange={setCompanyFilter}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите компанию" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="all">Все компании</SelectItem>
                    <SelectItem value="null">Частные лица</SelectItem>
                    {companies.map((company) => (
                      <SelectItem key={company.company_id} value={String(company.company_id)}>
                        {company.company_name}
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
                    <SelectItem value="null">Не назначен</SelectItem>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.full_name || user.id}
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

export default ContactFilters;
