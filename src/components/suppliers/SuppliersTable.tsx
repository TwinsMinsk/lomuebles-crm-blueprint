
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import SupplierTableRow from "./SupplierTableRow";
import TableSkeleton from "@/components/ui/skeletons/TableSkeleton";
import { Supplier } from "@/types/supplier";

interface SuppliersTableProps {
  suppliers: Supplier[];
  loading: boolean;
  onSupplierClick: (supplier: Supplier) => void;
  onDeleteClick: (supplier: Supplier) => void;
}

const SuppliersTable: React.FC<SuppliersTableProps> = ({
  suppliers,
  loading,
  onSupplierClick,
  onDeleteClick,
}) => {
  if (loading) {
    return <TableSkeleton columns={8} rows={6} />;
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Название</TableHead>
            <TableHead>Контактное лицо</TableHead>
            <TableHead>Телефон</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Категории товаров</TableHead>
            <TableHead>Дата создания</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {suppliers.length > 0 ? (
            suppliers.map((supplier) => (
              <SupplierTableRow
                key={supplier.supplier_id}
                supplier={supplier}
                onClick={onSupplierClick}
                onDelete={onDeleteClick}
              />
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-4">
                Поставщики не найдены
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default SuppliersTable;
