
import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Navigate } from "react-router-dom";
import { format, subDays } from "date-fns";
import { ru } from "date-fns/locale";
import { useFinancialSummary, useCategorySummary } from "@/hooks/finance/useFinanceReports";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarIcon, DollarSign, TrendingUp, TrendingDown } from "lucide-react";

const FinanceReportsPage: React.FC = () => {
  const { userRole } = useAuth();
  const [dateFrom, setDateFrom] = useState<Date | undefined>(subDays(new Date(), 30));
  const [dateTo, setDateTo] = useState<Date | undefined>(new Date());
  const [activeTab, setActiveTab] = useState<string>("summary");

  // Check if user has admin access
  if (userRole !== "Главный Администратор" && userRole !== "Администратор") {
    return <Navigate to="/access-denied" replace />;
  }

  // Format dates for API calls
  const dateFromStr = dateFrom ? format(dateFrom, "yyyy-MM-dd") : null;
  const dateToStr = dateTo ? format(dateTo, "yyyy-MM-dd") : null;

  // Fetch data
  const { data: financialSummary, isLoading: isSummaryLoading } = useFinancialSummary(
    dateFromStr, 
    dateToStr
  );

  const { data: expenseCategories, isLoading: isExpenseCategoriesLoading } = useCategorySummary(
    dateFromStr,
    dateToStr,
    "expense"
  );

  const { data: incomeCategories, isLoading: isIncomeCategoriesLoading } = useCategorySummary(
    dateFromStr,
    dateToStr,
    "income"
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDateRange = () => {
    if (dateFrom && dateTo) {
      return `${format(dateFrom, "d MMMM yyyy", { locale: ru })} - ${format(
        dateTo,
        "d MMMM yyyy",
        { locale: ru }
      )}`;
    }
    return "Выберите период";
  };

  // Summary card loading state
  const SummaryCardSkeleton = () => (
    <div className="space-y-3">
      <Skeleton className="h-6 w-1/2" />
      <Skeleton className="h-10 w-full" />
    </div>
  );

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">Финансовые отчеты</h1>

        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="flex items-center space-x-2">
            <DatePicker date={dateFrom} setDate={setDateFrom} />
            <span>—</span>
            <DatePicker date={dateTo} setDate={setDateTo} />
          </div>
        </div>
      </div>

      <div className="flex items-center mb-6">
        <CalendarIcon className="mr-2 h-5 w-5 text-gray-500" />
        <span className="text-gray-500">{formatDateRange()}</span>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="summary">Общая сводка</TabsTrigger>
          <TabsTrigger value="income">Доходы по категориям</TabsTrigger>
          <TabsTrigger value="expense">Расходы по категориям</TabsTrigger>
        </TabsList>

        <TabsContent value="summary">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Income Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Доходы
                </CardTitle>
                <DollarSign className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                {isSummaryLoading ? (
                  <SummaryCardSkeleton />
                ) : (
                  <div className="text-2xl font-bold">
                    {financialSummary ? formatCurrency(financialSummary.total_income) : "—"}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Expenses Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Расходы
                </CardTitle>
                <DollarSign className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                {isSummaryLoading ? (
                  <SummaryCardSkeleton />
                ) : (
                  <div className="text-2xl font-bold">
                    {financialSummary ? formatCurrency(financialSummary.total_expense) : "—"}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Profit Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Прибыль
                </CardTitle>
                {financialSummary?.profit && financialSummary.profit >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                )}
              </CardHeader>
              <CardContent>
                {isSummaryLoading ? (
                  <SummaryCardSkeleton />
                ) : (
                  <div className="text-2xl font-bold">
                    {financialSummary ? (
                      <span className={financialSummary.profit >= 0 ? "text-green-500" : "text-red-500"}>
                        {formatCurrency(financialSummary.profit)}
                      </span>
                    ) : (
                      "—"
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="income">
          <Card>
            <CardHeader>
              <CardTitle>Доходы по категориям</CardTitle>
            </CardHeader>
            <CardContent>
              {isIncomeCategoriesLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                </div>
              ) : incomeCategories && incomeCategories.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Категория</TableHead>
                      <TableHead className="text-right">Сумма</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {incomeCategories.map((category) => (
                      <TableRow key={category.category_id}>
                        <TableCell>{category.category_name}</TableCell>
                        <TableCell className="text-right">{formatCurrency(category.total_amount)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center py-4 text-gray-500">Нет данных за выбранный период</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expense">
          <Card>
            <CardHeader>
              <CardTitle>Расходы по категориям</CardTitle>
            </CardHeader>
            <CardContent>
              {isExpenseCategoriesLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                </div>
              ) : expenseCategories && expenseCategories.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Категория</TableHead>
                      <TableHead className="text-right">Сумма</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {expenseCategories.map((category) => (
                      <TableRow key={category.category_id}>
                        <TableCell>{category.category_name}</TableCell>
                        <TableCell className="text-right">{formatCurrency(category.total_amount)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center py-4 text-gray-500">Нет данных за выбранный период</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FinanceReportsPage;
