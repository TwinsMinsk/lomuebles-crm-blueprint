
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useFinancialSummary } from "@/hooks/finance/useFinanceReports";
import { TrendingUp, TrendingDown, DollarSign, PieChart } from "lucide-react";

const FinancialSummaryPanel: React.FC = () => {
  // Получаем данные за текущий месяц
  const currentDate = new Date();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  
  const dateFrom = firstDayOfMonth.toISOString().split('T')[0];
  const dateTo = lastDayOfMonth.toISOString().split('T')[0];

  const { data: financialData, isLoading } = useFinancialSummary(dateFrom, dateTo);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getProfitColor = (profit: number) => {
    if (profit > 0) return "text-green-600";
    if (profit < 0) return "text-red-600";
    return "text-gray-600";
  };

  const getProfitIcon = (profit: number) => {
    if (profit > 0) return TrendingUp;
    if (profit < 0) return TrendingDown;
    return DollarSign;
  };

  const currentMonth = currentDate.toLocaleDateString('ru-RU', { 
    month: 'long', 
    year: 'numeric' 
  });

  if (isLoading) {
    return (
      <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-50 to-indigo-100">
        <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Финансовый Отчет
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
            <Skeleton className="h-12 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!financialData) {
    return (
      <Card className="shadow-lg border-0 bg-gradient-to-br from-gray-50 to-gray-100">
        <CardHeader className="bg-gradient-to-r from-gray-500 to-gray-600 text-white">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Финансовый Отчет
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-center text-gray-500 py-8">
            <DollarSign className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>Нет финансовых данных за {currentMonth}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const ProfitIcon = getProfitIcon(financialData.profit);

  return (
    <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-50 to-indigo-100 overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-b-0">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <PieChart className="h-5 w-5" />
          Финансовый Отчет
        </CardTitle>
        <p className="text-blue-100 text-sm">
          {currentMonth}
        </p>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Основные показатели */}
        <div className="grid grid-cols-2 gap-4">
          {/* Доходы */}
          <div className="bg-green-50 rounded-xl p-4 border border-green-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-green-700">Доходы</span>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-green-800">
              {formatCurrency(financialData.total_income)}
            </div>
          </div>

          {/* Расходы */}
          <div className="bg-red-50 rounded-xl p-4 border border-red-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-red-700">Расходы</span>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </div>
            <div className="text-2xl font-bold text-red-800">
              {formatCurrency(financialData.total_expense)}
            </div>
          </div>
        </div>

        {/* Прибыль */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium text-gray-600 block mb-1">
                Чистая прибыль
              </span>
              <div className={`text-3xl font-bold ${getProfitColor(financialData.profit)}`}>
                {formatCurrency(financialData.profit)}
              </div>
            </div>
            <div className={`p-3 rounded-full ${
              financialData.profit > 0 
                ? 'bg-green-100' 
                : financialData.profit < 0 
                ? 'bg-red-100' 
                : 'bg-gray-100'
            }`}>
              <ProfitIcon className={`h-6 w-6 ${getProfitColor(financialData.profit)}`} />
            </div>
          </div>
        </div>

        {/* Дополнительная информация */}
        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-4 border border-indigo-200">
          <div className="flex items-center justify-between text-sm">
            <span className="text-indigo-700 font-medium">Маржинальность:</span>
            <span className="text-indigo-800 font-semibold">
              {financialData.total_income > 0 
                ? `${((financialData.profit / financialData.total_income) * 100).toFixed(1)}%`
                : '0%'
              }
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FinancialSummaryPanel;
