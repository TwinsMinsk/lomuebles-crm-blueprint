
import React from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Supplier } from "@/types/supplier";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

interface SupplierTableRowProps {
  supplier: Supplier;
  onClick: (supplier: Supplier) => void;
  onDelete: (supplier: Supplier) => void;
}

const SupplierTableRow: React.FC<SupplierTableRowProps> = ({
  supplier,
  onClick,
  onDelete,
}) => {
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(supplier);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "";
    return format(new Date(dateString), "dd.MM.yyyy");
  };

  return (
    <TableRow
      className="cursor-pointer hover:bg-muted/50"
      onClick={() => onClick(supplier)}
    >
      <TableCell>{supplier.supplier_id}</TableCell>
      <TableCell>{supplier.supplier_name}</TableCell>
      <TableCell>{supplier.contact_person || "-"}</TableCell>
      <TableCell>{supplier.phone || "-"}</TableCell>
      <TableCell>{supplier.email || "-"}</TableCell>
      <TableCell>{supplier.product_categories || "-"}</TableCell>
      <TableCell>{formatDate(supplier.creation_date)}</TableCell>
      <TableCell>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleDelete}
          className="h-8 w-8 text-destructive hover:text-destructive/90"
          title="Удалить поставщика"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </TableCell>
    </TableRow>
  );
};

export default SupplierTableRow;
