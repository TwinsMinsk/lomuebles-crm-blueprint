
import React from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Product } from "@/types/product";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

interface ProductTableRowProps {
  product: Product;
  onClick: (product: Product) => void;
  onDelete: (product: Product) => void;
}

const ProductTableRow: React.FC<ProductTableRowProps> = ({
  product,
  onClick,
  onDelete,
}) => {
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(product);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "";
    return format(new Date(dateString), "dd.MM.yyyy");
  };

  const formatPrice = (price: number | null) => {
    if (price === null) return "-";
    return `${price.toLocaleString('es-ES')} €`;
  };

  const templateType = product.is_custom_template ? "На заказ" : "Готовый";

  return (
    <TableRow
      className="cursor-pointer hover:bg-muted/50"
      onClick={() => onClick(product)}
    >
      <TableCell>{product.product_id}</TableCell>
      <TableCell>{product.internal_product_name}</TableCell>
      <TableCell>{product.internal_sku || "-"}</TableCell>
      <TableCell>{product.category || "-"}</TableCell>
      <TableCell>{formatPrice(product.base_price)}</TableCell>
      <TableCell>{templateType}</TableCell>
      <TableCell>{formatDate(product.creation_date)}</TableCell>
      <TableCell>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleDelete}
          className="h-8 w-8 text-destructive hover:text-destructive/90"
          title="Удалить товар"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </TableCell>
    </TableRow>
  );
};

export default ProductTableRow;
