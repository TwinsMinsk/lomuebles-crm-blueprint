import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, TrendingDown, TrendingUp, Target } from "lucide-react";
import { useReservationSummaries } from "@/hooks/warehouse/useMaterialReservations";

export const PlanVsActualDashboard = () => {
  const { data: summaries, isLoading, error } = useReservationSummaries();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>План vs Факт</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">Загрузка данных...</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>План vs Факт</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Ошибка загрузки данных. Попробуйте обновить страницу.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!summaries || summaries.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>План vs Факт</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-muted-foreground">
            Нет данных о резервах материалов
          </div>
        </CardContent>
      </Card>
    );
  }

  const activeOrders = summaries.filter(s => s.order_status !== 'Завершен' && s.order_status !== 'Отменен');
  const totalDiscrepancies = summaries.reduce((sum, s) => sum + s.materials_with_discrepancies, 0);
  const avgEfficiency = Math.round(
    summaries.reduce((sum, s) => sum + s.efficiency_percentage, 0) / summaries.length
  );

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Активные заказы</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeOrders.length}</div>
            <p className="text-xs text-muted-foreground">
              с зарезервированными материалами
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Расхождения</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{totalDiscrepancies}</div>
            <p className="text-xs text-muted-foreground">
              материалов с отклонениями &gt;5%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Эффективность</CardTitle>
            {avgEfficiency >= 95 ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgEfficiency}%</div>
            <p className="text-xs text-muted-foreground">
              средняя точность планирования
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Orders Details */}
      <Card>
        <CardHeader>
          <CardTitle>Детализация по заказам</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {summaries.map((summary) => {
              const hasDiscrepancies = summary.materials_with_discrepancies > 0;
              const isOverBudget = summary.efficiency_percentage > 110;
              const isUnderBudget = summary.efficiency_percentage < 90;

              return (
                <div
                  key={summary.order_id}
                  className={`p-4 border rounded-lg ${
                    hasDiscrepancies ? 'border-orange-200 bg-orange-50' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-medium">
                        {summary.order_name || `Заказ ${summary.order_number}`}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {summary.total_materials} материалов • {summary.order_status}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={hasDiscrepancies ? "destructive" : "secondary"}>
                        {summary.efficiency_percentage}%
                      </Badge>
                      {hasDiscrepancies && (
                        <Badge variant="outline" className="text-orange-600">
                          {summary.materials_with_discrepancies} расхождений
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>План: {summary.total_reserved}</span>
                      <span>Факт: {summary.total_used}</span>
                    </div>
                    <Progress 
                      value={Math.min(summary.efficiency_percentage, 100)} 
                      className={`h-2 ${
                        isOverBudget ? 'bg-red-100' : isUnderBudget ? 'bg-yellow-100' : 'bg-green-100'
                      }`}
                    />
                  </div>

                  {(isOverBudget || isUnderBudget) && (
                    <Alert className="mt-2">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        {isOverBudget 
                          ? `Перерасход материалов на ${summary.efficiency_percentage - 100}%`
                          : `Недоиспользование материалов на ${100 - summary.efficiency_percentage}%`
                        }
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};