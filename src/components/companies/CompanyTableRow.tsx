
import React from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Company } from "@/hooks/useCompanies";
import { formatDate } from "@/lib/utils";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CompanyTableRowProps {
  company: Company;
  onEdit: (company: Company) => void;
  onDelete: (company: Company) => void;
}

const CompanyTableRow: React.FC<CompanyTableRowProps> = ({ company, onEdit, onDelete }) => {
  const handleRowClick = (e: React.MouseEvent) => {
    // Don't trigger row click if clicking on the delete button
    if ((e.target as HTMLElement).closest('button')) return;
    onEdit(company);
  };

  return (
    <TableRow 
      className="cursor-pointer hover:bg-muted/50"
      onClick={handleRowClick}
    >
      <TableCell>{company.company_id}</TableCell>
      <TableCell>{company.company_name}</TableCell>
      <TableCell>{company.nif_cif || "-"}</TableCell>
      <TableCell>{company.phone || "-"}</TableCell>
      <TableCell>{company.email || "-"}</TableCell>
      <TableCell>{company.industry || "-"}</TableCell>
      <TableCell>{company.owner_name || "Не назначен"}</TableCell>
      <TableCell>{formatDate(company.creation_date)}</TableCell>
      <TableCell>
        <Button 
          variant="ghost" 
          size="icon"
          className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(company);
          }}
          title="Удалить компанию"
        >
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">Удалить</span>
        </Button>
      </TableCell>
    </TableRow>
  );
};

export default CompanyTableRow;
