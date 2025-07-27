import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, RefreshCw, Calendar } from "lucide-react";
import { MovementReportTable } from "@/components/warehouse/reports/MovementReportTable";
import { useMovementReport } from "@/hooks/warehouse/useMovementReport";
import { STOCK_MOVEMENT_TYPES, type StockMovementType } from "@/types/warehouse";

export const MovementReportTab = () => {
  const [dateFrom, setDateFrom] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30); // Last 30 days by default
    return date.toISOString().split('T')[0];
  });
  const [dateTo, setDateTo] = useState(() => new Date().toISOString().split('T')[0]);
  const [movementType, setMovementType] = useState<StockMovementType | "all">("all");
  
  const { data: report, isLoading, refetch } = useMovementReport({
    date_from: dateFrom,
    date_to: dateTo,
    movement_type: movementType === "all" ? undefined : movementType,
  });

  const handleExportToCSV = () => {
    if (!report?.movements) return;
    
    const headers = [
      "Дата",
      "Материал",
      "Тип движения",
      "Количество",
      "Ед. изм.",
      "Стоимость за ед.",
      "Общая стоимость",
      "Поставщик",
      "Заказ",
      "Документ",
      "Примечания",
      "Создал"
    ];
    
    const csvContent = [
      headers.join(","),
      ...report.movements.map(item => [
        new Date(item.movement_date).toLocaleDateString('ru-RU'),
        `"${item.material_name || ''}"`,
        `"${item.movement_type}"`,
        item.quantity,
        item.material_unit || "",
        item.unit_cost || "",
        item.total_cost,
        `"${item.supplier_name || ''}"`,
        `"${item.order_number || ''}"`,
        `"${item.reference_document || ''}"`,
        `"${item.notes || ''}"`,
        `"${item.created_by_name || ''}"`
      ].join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `movement_report_${dateFrom}_${dateTo}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4 p-4 bg-muted/50 rounded-lg">
        <div className="flex items-center gap-2">
          <Label htmlFor="date-from">С:</Label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="date-from"
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="pl-10 w-[150px]"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Label htmlFor="date-to">По:</Label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="date-to"
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="pl-10 w-[150px]"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Label htmlFor="movement-type">Тип движения:</Label>
          <Select value={movementType} onValueChange={(value) => setMovementType(value as StockMovementType | "all")}>
            <SelectTrigger id="movement-type" className="w-[180px]">
              <SelectValue placeholder="Выберите тип" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все типы</SelectItem>
              {STOCK_MOVEMENT_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2 ml-auto">
          <Button variant="outline" onClick={() => refetch()} disabled={isLoading}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Обновить
          </Button>
          <Button onClick={handleExportToCSV} disabled={!report?.movements?.length}>
            <Download className="h-4 w-4 mr-2" />
            Экспорт CSV
          </Button>
        </div>
      </div>

      <MovementReportTable data={report?.movements || []} isLoading={isLoading} />

      {report?.summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {report.summary.total_incoming.toLocaleString('ru-RU')}
            </div>
            <div className="text-sm text-muted-foreground">Поступления</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {report.summary.total_outgoing.toLocaleString('ru-RU')}
            </div>
            <div className="text-sm text-muted-foreground">Расходы</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {report.summary.net_movement.toLocaleString('ru-RU')}
            </div>
            <div className="text-sm text-muted-foreground">Чистое движение</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-muted-foreground">
              {report.summary.movements_count}
            </div>
            <div className="text-sm text-muted-foreground">Всего операций</div>
          </div>
        </div>
      )}
    </div>
  );
};