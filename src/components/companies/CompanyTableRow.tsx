
import React from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Company } from "@/hooks/useCompanies";
import { formatDate } from "@/lib/utils";

interface CompanyTableRowProps {
  company: Company;
}

const CompanyTableRow: React.FC<CompanyTableRowProps> = ({ company }) => {
  return (
    <TableRow className="cursor-pointer hover:bg-muted/50">
      <TableCell>{company.company_id}</TableCell>
      <TableCell>{company.company_name}</TableCell>
      <TableCell>{company.nif_cif || "-"}</TableCell>
      <TableCell>{company.phone || "-"}</TableCell>
      <TableCell>{company.email || "-"}</TableCell>
      <TableCell>{company.industry || "-"}</TableCell>
      <TableCell>{company.owner_name || "Не назначен"}</TableCell>
      <TableCell>{formatDate(company.creation_date)}</TableCell>
    </TableRow>
  );
};

export default CompanyTableRow;
