import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { Edit, Trash2, Package } from "lucide-react";
import { MaterialFormModal } from "./MaterialFormModal";
import { DeleteMaterialDialog } from "./DeleteMaterialDialog";
import { formatCurrency, getStockStatusInfo } from "@/utils/warehouse";
import type { MaterialWithStock } from "@/types/warehouse";

interface MaterialsTableProps {
  materials: MaterialWithStock[];
  isLoading: boolean;
}

export const MaterialsTable = ({ materials, isLoading }: MaterialsTableProps) => {
  const [editingMaterial, setEditingMaterial] = useState<MaterialWithStock | null>(null);
  const [deletingMaterial, setDeletingMaterial] = useState<MaterialWithStock | null>(null);

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Наименование</TableHead>
            <TableHead>Категория</TableHead>
            <TableHead>Единица</TableHead>
            <TableHead>Остаток</TableHead>
            <TableHead>Мин. остаток</TableHead>
            <TableHead>Стоимость</TableHead>
            <TableHead>Статус</TableHead>
            <TableHead>Действия</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {materials.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8">
                Материалы не найдены
              </TableCell>
            </TableRow>
          ) : (
            materials.map((material) => (
              <TableRow key={material.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Package className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium">{material.name}</div>
                      {material.sku && (
                        <div className="text-sm text-muted-foreground">SKU: {material.sku}</div>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{material.category}</Badge>
                </TableCell>
                <TableCell>{material.unit}</TableCell>
                <TableCell>
                  {material.stock_level ? (
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {material.stock_level.current_quantity} {material.unit}
                      </span>
                      <Badge variant="outline" className={getStockStatusInfo(material.stock_level.status).className}>
                        {getStockStatusInfo(material.stock_level.status).label}
                      </Badge>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">Нет данных</span>
                  )}
                </TableCell>
                <TableCell>{material.min_stock_level} {material.unit}</TableCell>
                <TableCell>
                  {material.current_cost ? formatCurrency(material.current_cost) : "—"}
                </TableCell>
                <TableCell>
                  <Badge variant={material.is_active ? "default" : "secondary"}>
                    {material.is_active ? "Активен" : "Неактивен"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingMaterial(material)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeletingMaterial(material)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {editingMaterial && (
        <MaterialFormModal
          isOpen={true}
          onClose={() => setEditingMaterial(null)}
          mode="edit"
          material={editingMaterial}
        />
      )}

      {deletingMaterial && (
        <DeleteMaterialDialog
          material={deletingMaterial}
          isOpen={true}
          onClose={() => setDeletingMaterial(null)}
        />
      )}
    </>
  );
};