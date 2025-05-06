
import React, { useState, useEffect } from "react";
import { useContacts } from "@/hooks/useContacts";
import PageHeader from "@/components/common/PageHeader";
import ContactsTable from "@/components/contacts/ContactsTable";
import ContactsPagination from "@/components/contacts/ContactsPagination";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Filter } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
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

// Types for companies and users dropdown
type Company = {
  company_id: number;
  company_name: string;
};

type User = {
  id: string;
  full_name: string;
};

const Contacts = () => {
  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 10;

  // Sorting state
  const [sortColumn, setSortColumn] = useState<string | undefined>(undefined);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Filter state
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [companyFilter, setCompanyFilter] = useState<string>('all');
  const [ownerFilter, setOwnerFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState<boolean>(false);

  // Options for dropdowns
  const [companies, setCompanies] = useState<Company[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  
  // Fetch filter options
  useEffect(() => {
    // Fetch companies for filter
    const fetchCompanies = async () => {
      try {
        const { data, error } = await supabase
          .from('companies')
          .select('company_id, company_name')
          .order('company_name');
        
        if (error) throw error;
        setCompanies(data || []);
      } catch (err) {
        console.error("Error fetching companies:", err);
      }
    };
    
    // Fetch users for filter
    const fetchUsers = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name')
          .order('full_name');
        
        if (error) throw error;
        setUsers(data || []);
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    };
    
    fetchCompanies();
    fetchUsers();
  }, []);
  
  // Get contacts with filters and sorting
  const { contacts, loading, totalPages, error } = useContacts({ 
    page: currentPage, 
    pageSize,
    sortColumn,
    sortDirection,
    search: searchTerm,
    companyFilter,
    ownerFilter
  });

  // Handle pagination change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle sorting
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      // Toggle direction if clicking the same column
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new column and default to ascending
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  // Reset filters
  const handleResetFilters = () => {
    setSearchTerm('');
    setCompanyFilter('all');
    setOwnerFilter('all');
    setSortColumn(undefined);
    setSortDirection('asc');
    setCurrentPage(1);
  };

  // Toggle filters visibility
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  // Show error toast if data fetching fails
  if (error) {
    toast.error("Ошибка при загрузке контактов", {
      description: error.message
    });
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="Контакты"
        description="Управление контактами клиентов"
      />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Список контактов</CardTitle>
            <CardDescription>
              Управление информацией о клиентах и их контактных данных
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={toggleFilters}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Фильтры
          </Button>
        </CardHeader>
        <CardContent>
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

          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              <ContactsTable 
                contacts={contacts} 
                loading={loading} 
                onSort={handleSort}
                sortColumn={sortColumn}
                sortDirection={sortDirection}
              />
              {totalPages > 1 && (
                <div className="mt-4">
                  <ContactsPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Contacts;
