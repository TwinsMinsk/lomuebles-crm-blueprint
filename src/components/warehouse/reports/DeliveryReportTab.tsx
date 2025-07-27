import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Download, RefreshCw, Calendar } from "lucide-react";
import { DeliveryReportTable } from "@/components/warehouse/reports/DeliveryReportTable";
import { useDeliveryReport } from "@/hooks/warehouse/useDeliveryReport";
import { DELIVERY_STATUSES, type DeliveryStatus } from "@/types/warehouse";

export const DeliveryReportTab = () => {
  const [dateFrom, setDateFrom] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30); // Last 30 days by default
    return date.toISOString().split('T')[0];
  });
  const [dateTo, setDateTo] = useState(() => new Date().toISOString().split('T')[0]);
  const [deliveryStatus, setDeliveryStatus] = useState<DeliveryStatus | "all">("all");
  const [overdueOnly, setOverdueOnly] = useState(false);
  
  const { data: report, isLoading, refetch } = useDeliveryReport({
    date_from: dateFrom,
    date_to: dateTo,
    delivery_status: deliveryStatus === "all" ? undefined : deliveryStatus,
    overdue_only: overdueOnly,
  });

  const handleExportToCSV = () => {
    if (!report) return;
    
    const headers = [
      "ID",
      "Материал",
      "Поставщик",
      "Заказ",
      "Количество заказано",
      "Количество доставлено",
      "Количество остается",
      "Статус",
      "Дата заказа",
      "Ожидаемая дата",
      "Фактическая дата",
      "Трек-номер",
      "Стоимость за ед.",
      "Общая стоимость",
      "Примечания"
    ];
    
    const csvContent = [
      headers.join(","),
      ...report.map(item => [
        item.id,
        `"${item.material?.name || ''}"`,
        `"${item.supplier?.company_name || ''}"`,
        `"${item.order?.order_number || ''}"`,
        item.quantity_ordered,
        item.quantity_delivered,
        item.quantity_remaining,
        `"${item.delivery_status}"`,
        new Date(item.order_date).toLocaleDateString('ru-RU'),
        item.expected_delivery_date ? new Date(item.expected_delivery_date).toLocaleDateString('ru-RU') : "",
        item.actual_delivery_date ? new Date(item.actual_delivery_date).toLocaleDateString('ru-RU') : "",
        `"${item.tracking_number || ''}"`,
        item.unit_cost || "",
        item.total_cost || "",
        `"${item.notes || ''}"`
      ].join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `delivery_report_${dateFrom}_${dateTo}.csv`;
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
          <Label htmlFor="delivery-status">Статус:</Label>
          <Select value={deliveryStatus} onValueChange={(value) => setDeliveryStatus(value as DeliveryStatus | "all")}>
            <SelectTrigger id="delivery-status" className="w-[180px]">
              <SelectValue placeholder="Выберите статус" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все статусы</SelectItem>
              {DELIVERY_STATUSES.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox 
            id="overdue-only" 
            checked={overdueOnly}
            onCheckedChange={(checked) => setOverdueOnly(!!checked)}
          />
          <Label htmlFor="overdue-only">Только просроченные</Label>
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

      <DeliveryReportTable data={report || []} isLoading={isLoading} />

      {report && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 bg-muted/50 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{report.length}</div>
            <div className="text-sm text-muted-foreground">Всего поставок</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {report.filter(d => d.delivery_status === 'Заказано').length}
            </div>
            <div className="text-sm text-muted-foreground">Заказано</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {report.filter(d => d.delivery_status === 'В пути').length}
            </div>
            <div className="text-sm text-muted-foreground">В пути</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {report.filter(d => d.delivery_status === 'Доставлено').length}
            </div>
            <div className="text-sm text-muted-foreground">Доставлено</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {report.filter(d => {
                const expectedDate = new Date(d.expected_delivery_date || '');
                const today = new Date();
                return expectedDate < today && !['Доставлено', 'Отменено'].includes(d.delivery_status);
              }).length}
            </div>
            <div className="text-sm text-muted-foreground">Просрочено</div>
          </div>
        </div>
      )}
    </div>
  );
};