
import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { format, subMonths } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { 
  Bar, 
  BarChart, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

interface FinancialSummary {
  total_income: number;
  total_expense: number;
  profit: number;
}

interface CategorySummary {
  category_id: number;
  category_name: string;
  total_amount: number;
}

const FinanceReportsPage: React.FC = () => {
  const { userRole } = useAuth();
  const today = new Date();
  const [dateFrom, setDateFrom] = useState<Date | undefined>(subMonths(today, 1));
  const [dateTo, setDateTo] = useState<Date | undefined>(today);

  // Check if user has permission to access this page
  const isAdmin = userRole === 'Главный Администратор' || userRole === 'Администратор';

  if (!isAdmin) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Доступ запрещен</h1>
        <p>У вас нет прав для просмотра этой страницы.</p>
      </div>
    );
  }

  // Format dates for queries
  const fromDateStr = dateFrom ? format(dateFrom, "yyyy-MM-dd") : null;
  const toDateStr = dateTo ? format(dateTo, "yyyy-MM-dd") : null;

  // Query for financial summary
  const {
    data: financialSummary,
    isLoading: summaryLoading,
    error: summaryError,
  } = useQuery({
    queryKey: ["financial_summary", fromDateStr, toDateStr],
    queryFn: async () => {
      if (!fromDateStr || !toDateStr) return null;

      const { data, error } = await supabase.rpc("get_financial_summary", {
        date_from: fromDateStr,
        date_to: toDateStr,
      });

      if (error) {
        toast.error(`Ошибка при загрузке финансовой сводки: ${error.message}`);
        throw error;
      }

      return data as FinancialSummary || { total_income: 0, total_expense: 0, profit: 0 };
    },
    enabled: !!fromDateStr && !!toDateStr,
  });

  // Query for expense categories summary
  const {
    data: expenseCategories,
    isLoading: expenseCategoriesLoading,
    error: expenseCategoriesError,
  } = useQuery({
    queryKey: ["expense_categories_summary", fromDateStr, toDateStr],
    queryFn: async () => {
      if (!fromDateStr || !toDateStr) return [];

      const { data, error } = await supabase
        .from("transactions")
        .select(`
          category_id,
          amount,
          category:category_id(name)
        `)
        .eq("type", "expense")
        .gte("transaction_date", fromDateStr)
        .lte("transaction_date", toDateStr);

      if (error) {
        toast.error(`Ошибка при загрузке категорий расходов: ${error.message}`);
        throw error;
      }

      // Process data to group by category and sum amounts
      const categorySummary: Record<number, CategorySummary> = {};
      
      data.forEach((item: any) => {
        const categoryId = item.category_id;
        if (!categorySummary[categoryId]) {
          categorySummary[categoryId] = {
            category_id: categoryId,
            category_name: item.category?.name || 'Неизвестная категория',
            total_amount: 0
          };
        }
        categorySummary[categoryId].total_amount += Number(item.amount);
      });

      return Object.values(categorySummary).sort((a, b) => b.total_amount - a.total_amount);
    },
    enabled: !!fromDateStr && !!toDateStr,
  });

  // Query for income categories summary
  const {
    data: incomeCategories,
    isLoading: incomeCategoriesLoading,
    error: incomeCategoriesError,
  } = useQuery({
    queryKey: ["income_categories_summary", fromDateStr, toDateStr],
    queryFn: async () => {
      if (!fromDateStr || !toDateStr) return [];

      const { data, error } = await supabase
        .from("transactions")
        .select(`
          category_id,
          amount,
          category:category_id(name)
        `)
        .eq("type", "income")
        .gte("transaction_date", fromDateStr)
        .lte("transaction_date", toDateStr);

      if (error) {
        toast.error(`Ошибка при загрузке категорий доходов: ${error.message}`);
        throw error;
      }

      // Process data to group by category and sum amounts
      const categorySummary: Record<number, CategorySummary> = {};
      
      data.forEach((item: any) => {
        const categoryId = item.category_id;
        if (!categorySummary[categoryId]) {
          categorySummary[categoryId] = {
            category_id: categoryId,
            category_name: item.category?.name || 'Неизвестная категория',
            total_amount: 0
          };
        }
        categorySummary[categoryId].total_amount += Number(item.amount);
      });

      return Object.values(categorySummary).sort((a, b) => b.total_amount - a.total_amount);
    },
    enabled: !!fromDateStr && !!toDateStr,
  });

  // Prepare data for the chart
  const chartData = [
    {
      name: "Финансы",
      Доходы: financialSummary?.total_income || 0,
      Расходы: financialSummary?.total_expense || 0,
      Прибыль: financialSummary?.profit || 0
    }
  ];

  // Handle errors
  if (summaryError || expenseCategoriesError || incomeCategoriesError) {
    toast.error("Произошла ошибка при загрузке данных отчетов.");
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Финансовые Отчеты</h1>

      {/* Date Range Selector */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Период отчета</CardTitle>
          <CardDescription>Выберите период для формирования финансовых отчетов</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
            <div className="flex-1">
              <p className="text-sm font-medium mb-1.5">Дата начала:</p>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn("w-full justify-start text-left font-normal")}
                  >
                    {dateFrom ? (
                      format(dateFrom, "dd.MM.yyyy")
                    ) : (
                      <span>Выберите дату</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateFrom}
                    onSelect={setDateFrom}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium mb-1.5">Дата окончания:</p>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn("w-full justify-start text-left font-normal")}
                  >
                    {dateTo ? (
                      format(dateTo, "dd.MM.yyyy")
                    ) : (
                      <span>Выберите дату</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateTo}
                    onSelect={setDateTo}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Financial Summary */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Финансовая сводка за период</CardTitle>
          <CardDescription>
            {fromDateStr && toDateStr 
              ? `${format(dateFrom as Date, "dd.MM.yyyy")} - ${format(dateTo as Date, "dd.MM.yyyy")}`
              : "Выберите период для отображения сводки"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {summaryLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-6 w-1/2" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </div>
          ) : financialSummary ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">Доходы:</p>
                  <p className="text-2xl font-bold text-green-600">
                    {financialSummary.total_income.toFixed(2)} €
                  </p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">Расходы:</p>
                  <p className="text-2xl font-bold text-red-600">
                    {financialSummary.total_expense.toFixed(2)} €
                  </p>
                </div>
                <div className={cn(
                  "p-4 rounded-lg",
                  financialSummary.profit >= 0 ? "bg-blue-50" : "bg-amber-50"
                )}>
                  <p className="text-sm text-gray-500 mb-1">Прибыль/Убыток:</p>
                  <p className={cn(
                    "text-2xl font-bold",
                    financialSummary.profit >= 0 ? "text-blue-600" : "text-amber-600"
                  )}>
                    {financialSummary.profit.toFixed(2)} €
                  </p>
                </div>
              </div>
              
              {/* Chart */}
              <div className="h-64 mt-6">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value} €`, undefined]} />
                    <Legend />
                    <Bar dataKey="Доходы" fill="#10b981" />
                    <Bar dataKey="Расходы" fill="#ef4444" />
                    <Bar dataKey="Прибыль" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </>
          ) : (
            <p className="text-center py-4 text-gray-500">
              Выберите период для отображения финансовой сводки
            </p>
          )}
        </CardContent>
      </Card>

      {/* Expenses by Category */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Расходы по категориям</CardTitle>
            <CardDescription>
              Распределение расходов по категориям за выбранный период
            </CardDescription>
          </CardHeader>
          <CardContent>
            {expenseCategoriesLoading ? (
              <div className="space-y-2">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-6 w-full" />
                ))}
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
                      <TableCell className="text-right font-medium">
                        {category.total_amount.toFixed(2)} €
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-center py-4 text-gray-500">
                {fromDateStr && toDateStr
                  ? "Нет данных о расходах за выбранный период"
                  : "Выберите период для отображения данных"}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Income by Category */}
        <Card>
          <CardHeader>
            <CardTitle>Доходы по категориям</CardTitle>
            <CardDescription>
              Распределение доходов по категориям за выбранный период
            </CardDescription>
          </CardHeader>
          <CardContent>
            {incomeCategoriesLoading ? (
              <div className="space-y-2">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-6 w-full" />
                ))}
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
                      <TableCell className="text-right font-medium">
                        {category.total_amount.toFixed(2)} €
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-center py-4 text-gray-500">
                {fromDateStr && toDateStr
                  ? "Нет данных о доходах за выбранный период"
                  : "Выберите период для отображения данных"}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FinanceReportsPage;
