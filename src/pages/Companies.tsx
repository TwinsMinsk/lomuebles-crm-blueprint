
import React from "react";
import PageHeader from "@/components/common/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
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
    refetch,
    users,
    industries
  } = useCompaniesState();

  return (
    <div className="space-y-4">
      <PageHeader
        title="Компании"
        description="Управление информацией о компаниях"
      />

      <Card>
        <CardContent className="pt-6">
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
            refetch={refetch}
            users={users}
            industries={industries}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default Companies;
