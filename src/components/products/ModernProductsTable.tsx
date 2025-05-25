
import React from "react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { Product } from "@/types/product";
import { ResponsiveTable, ResponsiveRow, ResponsiveRowItem } from "@/components/ui/responsive-table";
import { Button } from "@/components/ui/button";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { ModernEmptyState } from "@/components/ui/modern-empty-state";
import { Trash2, Package, Euro, Tag, Image } from "lucide-react";

interface ModernProductsTableProps {
  products: Product[];
  loading: boolean;
  onProductClick: (product: Product) => void;
  onDeleteClick: (product: Product) => void;
}

const ModernProductsTable: React.FC<ModernProductsTableProps> = ({
  products,
  loading,
  onProductClick,
  onDeleteClick,
}) => {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "—";
    return format(new Date(dateString), "dd MMM yyyy", { locale: ru });
  };

  const formatPrice = (price: number | null) => {
    if (!price) return "—";
    return `€${price.toFixed(2)}`;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="hidden lg:block space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <LoadingSkeleton key={i} variant="table" />
          ))}
        </div>
        <div className="lg:hidden space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <LoadingSkeleton key={i} variant="card" />
          ))}
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <ModernEmptyState
        icon={Package}
        title="Товары не найдены"
        description="Добавьте первый товар в каталог, чтобы начать работу"
      />
    );
  }

  return (
    <ResponsiveTable>
      {/* Desktop Header */}
      <thead className="hidden lg:table-header-group">
        <tr className="border-b bg-gray-50/50">
          <th className="text-left p-4 font-medium text-gray-700">Товар</th>
          <th className="text-left p-4 font-medium text-gray-700">SKU</th>
          <th className="text-left p-4 font-medium text-gray-700">Категория</th>
          <th className="text-left p-4 font-medium text-gray-700">Цена</th>
          <th className="text-left p-4 font-medium text-gray-700">Дата создания</th>
          <th className="w-[50px] p-4"></th>
        </tr>
      </thead>

      <tbody>
        {products.map((product) => (
          <ResponsiveRow
            key={product.product_id}
            onClick={() => onProductClick(product)}
            className="group"
          >
            {/* Product Info */}
            <ResponsiveRowItem
              label="Товар"
              value={
                <div className="space-y-2">
                  <div className="font-medium text-gray-900">
                    {product.internal_product_name}
                  </div>
                  {product.description && (
                    <div className="text-sm text-gray-500 line-clamp-2">
                      {product.description}
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    {product.is_custom_template && (
                      <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded flex items-center gap-1">
                        <Image className="h-3 w-3" />
                        Шаблон
                      </div>
                    )}
                  </div>
                </div>
              }
              fullWidth
            />

            {/* SKU */}
            <ResponsiveRowItem
              label="SKU"
              value={
                <div className="flex items-center gap-1">
                  <Tag className="h-3 w-3 text-gray-400" />
                  <span className="text-sm font-mono">
                    {product.internal_sku || "—"}
                  </span>
                </div>
              }
            />

            {/* Category */}
            <ResponsiveRowItem
              label="Категория"
              value={
                <div className="flex items-center gap-1">
                  <Package className="h-3 w-3 text-gray-400" />
                  <span className="text-sm">
                    {product.category || "—"}
                  </span>
                </div>
              }
            />

            {/* Price */}
            <ResponsiveRowItem
              label="Цена"
              value={
                <div className="flex items-center gap-1">
                  <Euro className="h-3 w-3 text-gray-400" />
                  <span className="text-sm font-medium">
                    {formatPrice(product.base_price)}
                  </span>
                </div>
              }
            />

            {/* Creation Date */}
            <ResponsiveRowItem
              label="Дата создания"
              value={
                <span className="text-sm text-gray-600">
                  {formatDate(product.creation_date)}
                </span>
              }
            />

            {/* Actions */}
            <ResponsiveRowItem
              label="Действия"
              value={
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteClick(product);
                  }}
                  className="h-8 w-8 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Удалить товар"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              }
            />
          </ResponsiveRow>
        ))}
      </tbody>
    </ResponsiveTable>
  );
};

export default ModernProductsTable;
