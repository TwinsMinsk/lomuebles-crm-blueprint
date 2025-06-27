import React from "react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { Supplier } from "@/types/supplier";
import { ResponsiveTable, ResponsiveRow, ResponsiveRowItem } from "@/components/ui/responsive-table";
import { Button } from "@/components/ui/button";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { ModernEmptyState } from "@/components/ui/modern-empty-state";
import { Trash2, Phone, Mail, Globe, Package, Truck, FileText } from "lucide-react";
import AttachedFilesDisplay from "@/components/common/AttachedFilesDisplay";
interface ModernSuppliersTableProps {
  suppliers: Supplier[];
  loading: boolean;
  onSupplierClick: (supplier: Supplier) => void;
  onDeleteClick: (supplier: Supplier) => void;
}
const ModernSuppliersTable: React.FC<ModernSuppliersTableProps> = ({
  suppliers,
  loading,
  onSupplierClick,
  onDeleteClick
}) => {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "—";
    return format(new Date(dateString), "dd MMM yyyy", {
      locale: ru
    });
  };
  if (loading) {
    return <div className="space-y-4">
        <div className="hidden lg:block space-y-2">
          {Array.from({
          length: 5
        }).map((_, i) => <LoadingSkeleton key={i} variant="table" />)}
        </div>
        <div className="lg:hidden space-y-3">
          {Array.from({
          length: 3
        }).map((_, i) => <LoadingSkeleton key={i} variant="card" />)}
        </div>
      </div>;
  }
  if (suppliers.length === 0) {
    return <ModernEmptyState icon={Truck} title="Поставщики не найдены" description="Добавьте первого поставщика, чтобы начать работу" />;
  }
  return <ResponsiveTable>
      {/* Desktop Header */}
      <thead className="hidden lg:table-header-group">
        <tr className="border-b bg-gray-50/50">
          <th className="text-left p-4 font-medium text-gray-700">Поставщик</th>
          <th className="text-left p-4 font-medium text-gray-700 w-48 bg-transparent">Контактная информация</th>
          <th className="text-left p-4 font-medium text-gray-700">Категории товаров</th>
          <th className="text-left p-4 font-medium text-gray-700">Файлы</th>
          <th className="text-left p-4 font-medium text-gray-700">Дата создания</th>
          <th className="w-[50px] p-4"></th>
        </tr>
      </thead>

      <tbody>
        {suppliers.map(supplier => <ResponsiveRow key={supplier.supplier_id} onClick={() => onSupplierClick(supplier)} className="group">
            {/* Supplier Info */}
            <ResponsiveRowItem label="Поставщик" value={<div className="space-y-1">
                  <div className="font-medium text-gray-900">
                    {supplier.supplier_name}
                  </div>
                  {supplier.contact_person && <div className="text-sm text-gray-500">
                      Контактное лицо: {supplier.contact_person}
                    </div>}
                </div>} fullWidth />

            {/* Contact Info */}
            <ResponsiveRowItem label="Контактная информация" value={<div className="space-y-1 max-w-[200px]">
                  {supplier.phone && <div className="flex items-center gap-1 text-sm">
                      <Phone className="h-3 w-3 text-gray-400 flex-shrink-0" />
                      <span className="truncate">{supplier.phone}</span>
                    </div>}
                  {supplier.email && <div className="flex items-center gap-1 text-sm">
                      <Mail className="h-3 w-3 text-gray-400 flex-shrink-0" />
                      <span className="truncate">{supplier.email}</span>
                    </div>}
                  {supplier.website && <div className="flex items-center gap-1 text-sm">
                      <Globe className="h-3 w-3 text-gray-400 flex-shrink-0" />
                      <span className="truncate">{supplier.website}</span>
                    </div>}
                  {!supplier.phone && !supplier.email && !supplier.website && <span className="text-gray-400 text-sm">—</span>}
                </div>} className="w-48" fullWidth />

            {/* Product Categories */}
            <ResponsiveRowItem label="Категории товаров" value={<div className="flex items-center gap-1">
                  <Package className="h-3 w-3 text-gray-400" />
                  <span className="text-sm">
                    {supplier.product_categories || "—"}
                  </span>
                </div>} />

            {/* Attached Files */}
            <ResponsiveRowItem label="Файлы" value={<div className="max-w-[200px]">
                  <AttachedFilesDisplay files={supplier.attached_files} maxDisplayCount={2} compact={true} />
                </div>} fullWidth />

            {/* Creation Date */}
            <ResponsiveRowItem label="Дата создания" value={<span className="text-sm text-gray-600">
                  {formatDate(supplier.creation_date)}
                </span>} />

            {/* Actions */}
            <ResponsiveRowItem label="Действия" value={<Button variant="ghost" size="icon" onClick={e => {
          e.stopPropagation();
          onDeleteClick(supplier);
        }} className="h-8 w-8 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity" title="Удалить поставщика">
                  <Trash2 className="h-4 w-4" />
                </Button>} />
          </ResponsiveRow>)}
      </tbody>
    </ResponsiveTable>;
};
export default ModernSuppliersTable;