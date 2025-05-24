
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import ProductTableRow from "./ProductTableRow";
import TableSkeleton from "@/components/ui/skeletons/TableSkeleton";
import { Product } from "@/types/product";

interface ProductsTableProps {
  products: Product[];
  loading: boolean;
  onProductClick: (product: Product) => void;
  onDeleteClick: (product: Product) => void;
}

const ProductsTable: React.FC<ProductsTableProps> = ({
  products,
  loading,
  onProductClick,
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
            <TableHead>Название товара</TableHead>
            <TableHead>Артикул (SKU)</TableHead>
            <TableHead>Категория</TableHead>
            <TableHead>Базовая цена</TableHead>
            <TableHead>Тип шаблона</TableHead>
            <TableHead>Дата создания</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.length > 0 ? (
            products.map((product) => (
              <ProductTableRow
                key={product.product_id}
                product={product}
                onClick={onProductClick}
                onDelete={onDeleteClick}
              />
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-4">
                Товары не найдены
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default ProductsTable;
