
import React from "react";
import { Company } from "@/hooks/useCompanies";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowUp, ArrowDown } from "lucide-react";
import CompanyTableRow from "./CompanyTableRow";

interface CompaniesTableProps {
  companies: Company[];
  sortColumn?: string;
  sortDirection?: "asc" | "desc";
  onSort: (column: string) => void;
  onEditCompany: (company: Company) => void;
}

const CompaniesTable: React.FC<CompaniesTableProps> = ({
  companies,
  sortColumn,
  sortDirection,
  onSort,
  onEditCompany,
}) => {
  const renderSortIcon = (column: string) => {
    if (sortColumn !== column) return null;

    return sortDirection === "asc" ? (
      <ArrowUp className="ml-2 h-4 w-4" />
    ) : (
      <ArrowDown className="ml-2 h-4 w-4" />
    );
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead
              className="cursor-pointer"
              onClick={() => onSort("company_id")}
            >
              <div className="flex items-center">
                ID {renderSortIcon("company_id")}
              </div>
            </TableHead>
            <TableHead
              className="cursor-pointer"
              onClick={() => onSort("company_name")}
            >
              <div className="flex items-center">
                Название компании {renderSortIcon("company_name")}
              </div>
            </TableHead>
            <TableHead
              className="cursor-pointer"
              onClick={() => onSort("nif_cif")}
            >
              <div className="flex items-center">
                NIF/CIF {renderSortIcon("nif_cif")}
              </div>
            </TableHead>
            <TableHead
              className="cursor-pointer"
              onClick={() => onSort("phone")}
            >
              <div className="flex items-center">
                Телефон {renderSortIcon("phone")}
              </div>
            </TableHead>
            <TableHead
              className="cursor-pointer"
              onClick={() => onSort("email")}
            >
              <div className="flex items-center">
                Email {renderSortIcon("email")}
              </div>
            </TableHead>
            <TableHead
              className="cursor-pointer"
              onClick={() => onSort("industry")}
            >
              <div className="flex items-center">
                Отрасль {renderSortIcon("industry")}
              </div>
            </TableHead>
            <TableHead
              className="cursor-pointer"
              onClick={() => onSort("owner_user_id")}
            >
              <div className="flex items-center">
                Ответственный менеджер {renderSortIcon("owner_user_id")}
              </div>
            </TableHead>
            <TableHead
              className="cursor-pointer"
              onClick={() => onSort("creation_date")}
            >
              <div className="flex items-center">
                Дата создания {renderSortIcon("creation_date")}
              </div>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {companies.length > 0 ? (
            companies.map((company) => (
              <CompanyTableRow 
                key={company.company_id} 
                company={company} 
                onEdit={onEditCompany}
              />
            ))
          ) : (
            <TableRow>
              <TableHead colSpan={8} className="text-center py-4">
                Компании не найдены
              </TableHead>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default CompaniesTable;
