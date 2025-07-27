import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Download, RefreshCw } from "lucide-react";
import { StockReportTable } from "@/components/warehouse/reports/StockReportTable";
import { useStockReport } from "@/hooks/warehouse/useStockReport";
import { MATERIAL_CATEGORIES, type MaterialCategory } from "@/types/warehouse";

export const StockReportTab = () => {
  const [category, setCategory] = useState<MaterialCategory | "all">("all");
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [includeInactive, setIncludeInactive] = useState(false);
  
  const { data: report, isLoading, refetch } = useStockReport({
    category: category === "all" ? undefined : category,
    low_stock_only: lowStockOnly,
    include_inactive: includeInactive,
  });

  const handleExportToCSV = () => {
    if (!report?.data) return;
    
    const headers = [
      "Материал",
      "Категория", 
      "Ед. изм.",
      "Остаток",
      "Зарезервировано",
      "Доступно",
      "Мин. уровень",
      "Макс. уровень",
      "Стоимость за ед.",
      "Общая стоимость",
      "Статус",
      "Локация",
      "Последнее движение"
    ];
    
    const csvContent = [
      headers.join(","),
      ...report.data.map(item => [
        `"${item.material_name}"`,
        `"${item.category}"`,
        item.unit,
        item.current_quantity,
        item.reserved_quantity,
        item.available_quantity,
        item.min_stock_level,
        item.max_stock_level || "",
        item.current_cost || "",
        item.total_value,
        `"${item.status}"`,
        `"${item.location || ""}"`,
        item.last_movement_date || ""
      ].join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `stock_report_${new Date().toISOString().split('T')[0]}.csv`;
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
            id="low-stock" 
            checked={lowStockOnly}
            onCheckedChange={(checked) => setLowStockOnly(!!checked)}
          />
          <Label htmlFor="low-stock">Только товары с низким остатком</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox 
            id="include-inactive" 
            checked={includeInactive}
            onCheckedChange={(checked) => setIncludeInactive(!!checked)}
          />
          <Label htmlFor="include-inactive">Включить неактивные</Label>
        </div>

        <div className="flex gap-2 ml-auto">
          <Button variant="outline" onClick={() => refetch()} disabled={isLoading}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Обновить
          </Button>
          <Button onClick={handleExportToCSV} disabled={!report?.data?.length}>
            <Download className="h-4 w-4 mr-2" />
            Экспорт CSV
          </Button>
        </div>
      </div>

      <StockReportTable data={report?.data || []} isLoading={isLoading} />

      {report?.summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{report.summary.total_materials}</div>
            <div className="text-sm text-muted-foreground">Всего материалов</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{report.summary.in_stock}</div>
            <div className="text-sm text-muted-foreground">В наличии</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{report.summary.low_stock}</div>
            <div className="text-sm text-muted-foreground">Заканчивается</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{report.summary.out_of_stock}</div>
            <div className="text-sm text-muted-foreground">Нет в наличии</div>
          </div>
        </div>
      )}
    </div>
  );
};