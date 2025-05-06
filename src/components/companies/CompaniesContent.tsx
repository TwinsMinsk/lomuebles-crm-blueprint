
import React from "react";
import { Loader2 } from "lucide-react";
import { Company } from "@/hooks/useCompanies";
import CompaniesTable from "./CompaniesTable";
import CompaniesPagination from "./CompaniesPagination";
import CompanyFilters from "./CompanyFilters";

interface CompaniesContentProps {
  companies: Company[];
  loading: boolean;
  totalPages: number;
  currentPage: number;
  handlePageChange: (page: number) => void;
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
  handleSort: (column: string) => void;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  industryFilter: string;
  setIndustryFilter: (value: string) => void;
  ownerFilter: string;
  setOwnerFilter: (value: string) => void;
  showFilters: boolean;
  toggleFilters: () => void;
  handleResetFilters: () => void;
  users: Array<{ id: string; full_name: string }>;
  industries: Array<{ value: string; label: string }>;
}

const CompaniesContent: React.FC<CompaniesContentProps> = ({
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
}) => {
  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <div className="mb-4">
        <CompanyFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          industryFilter={industryFilter}
          setIndustryFilter={setIndustryFilter}
          ownerFilter={ownerFilter}
          setOwnerFilter={setOwnerFilter}
          showFilters={showFilters}
          toggleFilters={toggleFilters}
          handleResetFilters={handleResetFilters}
          industryOptions={industries}
          users={users}
        />
      </div>
    
      <CompaniesTable 
        companies={companies}
        sortColumn={sortColumn}
        sortDirection={sortDirection}
        onSort={handleSort}
      />
      
      {totalPages > 1 && (
        <div className="mt-4">
          <CompaniesPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </>
  );
};

export default CompaniesContent;
