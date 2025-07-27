import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Download, RefreshCw } from "lucide-react";
import { ReservationReportTable } from "@/components/warehouse/reports/ReservationReportTable";
import { useReservationReport } from "@/hooks/warehouse/useReservationReport";
import { MATERIAL_CATEGORIES, type MaterialCategory } from "@/types/warehouse";

export const ReservationReportTab = () => {
  const [category, setCategory] = useState<MaterialCategory | "all">("all");
  const [onlyWithReservations, setOnlyWithReservations] = useState(true);
  
  const { data: report, isLoading, refetch } = useReservationReport({
    category: category === "all" ? undefined : category,
    only_with_reservations: onlyWithReservations,
  });

  const handleExportToCSV = () => {
    if (!report) return;
    
    const headers = [
      "Материал",
      "Категория",
      "Ед. изм.",
      "Зарезервировано",
      "Доступно",
      "Заказ",
      "Номер заказа",
      "Количество",
      "Локация",
      "Дата резерва"
    ];
    
    const csvContent = [
      headers.join(","),
      ...report.flatMap(item => 
        item.reservations.map(reservation => [
          `"${item.material_name}"`,
          `"${item.category}"`,
          item.unit,
          item.total_reserved,
          item.available_quantity,
          reservation.order_id,
          `"${reservation.order_number}"`,
          reservation.reserved_quantity,
          `"${reservation.location}"`,
          new Date(reservation.created_at).toLocaleDateString('ru-RU')
        ].join(","))
      )
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `reservation_report_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4 p-4 bg-muted/50 rounded-lg">
        <div className="flex items-center gap-2">
          <Label htmlFor="category">Категория:</Label>
          <Select value={category} onValueChange={(value) => setCategory(value as MaterialCategory | "all")}>
            <SelectTrigger id="category" className="w-[200px]">
              <SelectValue placeholder="Выберите категорию" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все категории</SelectItem>
              {MATERIAL_CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox 
            id="with-reservations" 
            checked={onlyWithReservations}
            onCheckedChange={(checked) => setOnlyWithReservations(!!checked)}
          />
          <Label htmlFor="with-reservations">Только с резервами</Label>
        </div>

        <div className="flex gap-2 ml-auto">
          <Button variant="outline" onClick={() => refetch()} disabled={isLoading}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Обновить
          </Button>
          <Button onClick={handleExportToCSV} disabled={!report?.length}>
            <Download className="h-4 w-4 mr-2" />
            Экспорт CSV
          </Button>
        </div>
      </div>

      <ReservationReportTable data={report || []} isLoading={isLoading} />

      {report && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{report.length}</div>
            <div className="text-sm text-muted-foreground">Материалов с резервами</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {report.reduce((sum, item) => sum + item.reservations.length, 0)}
            </div>
            <div className="text-sm text-muted-foreground">Всего резервов</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {report.reduce((sum, item) => sum + item.total_reserved, 0).toLocaleString('ru-RU')}
            </div>
            <div className="text-sm text-muted-foreground">Общее количество</div>
          </div>
        </div>
      )}
    </div>
  );
};