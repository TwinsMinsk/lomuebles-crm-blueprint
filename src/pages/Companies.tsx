
import React from "react";
import PageHeader from "@/components/common/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useCompaniesState } from "@/hooks/useCompaniesState";
import CompaniesContent from "@/components/companies/CompaniesContent";

const Companies = () => {
  const {
    companies,
    loading,
    totalPages,
    currentPage,
    handlePageChange,
    sortColumn,
    sortDirection,
    handleSort,
    searchTerm,
    setSearchTerm,
    industryFilter,
    setIndustryFilter,
    ownerFilter,
    setOwnerFilter,
    showFilters,
    toggleFilters,
    handleResetFilters,
    users,
    industries
  } = useCompaniesState();

  return (
    <div className="space-y-4">
      <PageHeader
        title="Компании"
        description="Управление информацией о компаниях"
        action={
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" /> Добавить компанию
          </Button>
        }
      />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Список компаний</CardTitle>
            <CardDescription>
              Информация о компаниях клиентов
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <CompaniesContent
            companies={companies}
            loading={loading}
            totalPages={totalPages}
            currentPage={currentPage}
            handlePageChange={handlePageChange}
            sortColumn={sortColumn}
            sortDirection={sortDirection}
            handleSort={handleSort}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            industryFilter={industryFilter}
            setIndustryFilter={setIndustryFilter}
            ownerFilter={ownerFilter}
            setOwnerFilter={setOwnerFilter}
            showFilters={showFilters}
            toggleFilters={toggleFilters}
            handleResetFilters={handleResetFilters}
            users={users}
            industries={industries}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default Companies;
