
import React from "react";
import { Loader2 } from "lucide-react";
import { Company } from "@/hooks/useCompanies";
import CompaniesTable from "./CompaniesTable";
import CompaniesPagination from "./CompaniesPagination";

interface CompaniesContentProps {
  companies: Company[];
  loading: boolean;
  totalPages: number;
  currentPage: number;
  handlePageChange: (page: number) => void;
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
  handleSort: (column: string) => void;
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
