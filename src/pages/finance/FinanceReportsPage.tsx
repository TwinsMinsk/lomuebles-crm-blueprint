import React, { useState } from 'react';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useAuth } from '@/context/AuthContext';
import { DateRangePicker } from '@/components/ui/date-picker';
import { useFinancialSummary, useCategorySummary, CategorySummary } from '@/hooks/finance/useFinanceReports';

// UI Components
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Loader2, RefreshCw, ArrowUp, ArrowDown, TrendingUp } from 'lucide-react';

// Colors for the pie charts
const EXPENSE_COLORS = ['#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9'];
const INCOME_COLORS = ['#22c55e', '#059669', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7'];
const FinanceReportsPage = () => {
  const {
    userRole
  } = useAuth();
  const isAdmin = userRole === 'Главный Администратор' || userRole === 'Администратор';

  // Date range state
  const [dateFrom, setDateFrom] = useState<Date>(startOfMonth(subMonths(new Date(), 5)));
  const [dateTo, setDateTo] = useState<Date>(endOfMonth(new Date()));
  const [activeTab, setActiveTab] = useState<string>('summary');

  // Format dates for API
  const dateFromString = format(dateFrom, 'yyyy-MM-dd');
  const dateToString = format(dateTo, 'yyyy-MM-dd');

  // Get financial data
  const {
    data: financialSummary,
    isLoading: summaryLoading,
    refetch: refetchSummary
  } = useFinancialSummary(dateFromString, dateToString);
  const {
    data: expenseCategories = [],
    isLoading: expenseCategoriesLoading,
    refetch: refetchExpenses
  } = useCategorySummary(dateFromString, dateToString, 'expense');
  const {
    data: incomeCategories = [],
    isLoading: incomeCategoriesLoading,
    refetch: refetchIncomes
  } = useCategorySummary(dateFromString, dateToString, 'income');

  // Check loading states
  const isLoading = summaryLoading || expenseCategoriesLoading || incomeCategoriesLoading;

  // Refresh all data
  const refreshData = () => {
    refetchSummary();
    refetchExpenses();
    refetchIncomes();
  };

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'EUR'
    }).format(value);
  };

  // Custom tooltip for pie charts
  const CustomTooltip = ({
    active,
    payload
  }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return <div className="bg-white p-3 shadow-md rounded-md border">
          <p className="font-medium">{data.category_name}</p>
          <p className="text-gray-500">{formatCurrency(data.total_amount)}</p>
        </div>;
    }
    return null;
  };

  // Calculate percentages
  const getPercentage = (value: number, total: number) => {
    if (total === 0) return 0;
    return (value / total * 100).toFixed(2);
  };

  // Format for chart display
  const formatCategories = (categories: CategorySummary[]) => {
    return categories.map(category => ({
      name: category.category_name,
      value: category.total_amount
    }));
  };

  // Skip rendering if user doesn't have admin permissions
  if (!isAdmin) {
    return <div className="container mx-auto p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Доступ запрещен</h1>
        <p>У вас нет прав для просмотра финансовой информации.</p>
      </div>;
  }
  return <div className="container mx-auto p-4 md:p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
        <h1 className="text-2xl font-bold mb-4 sm:mb-0">Финансовые отчеты</h1>
        <Button variant="outline" onClick={refreshData} disabled={isLoading}>
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
          Обновить данные
        </Button>
      </div>
      
      {/* Date range selector */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="col-span-3 md:col-span-2">
              <p className="text-sm font-medium mb-2">Выберите период для отчета:</p>
              <DateRangePicker dateFrom={dateFrom} dateTo={dateTo} onDateFromChange={setDateFrom} onDateToChange={setDateTo} disabled={isLoading} />
            </div>
            <div className="col-span-3 md:col-span-1 text-right text-sm text-muted-foreground">
              Период: {format(dateFrom, 'dd.MM.yyyy', {
              locale: ru
            })} — {format(dateTo, 'dd.MM.yyyy', {
              locale: ru
            })}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Tabs for different reports */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="summary">Общая сводка</TabsTrigger>
          <TabsTrigger value="expenses">Расходы по категориям</TabsTrigger>
          <TabsTrigger value="income">Доходы по категориям</TabsTrigger>
        </TabsList>
        
        {/* Summary Tab */}
        <TabsContent value="summary">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Summary Cards */}
            <Card>
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Доходы за период</p>
                  {isLoading ? <div className="h-8 flex items-center">
                      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    </div> : <p className="text-2xl font-bold text-green-600">
                      {financialSummary ? formatCurrency(financialSummary.total_income) : '—'}
                    </p>}
                </div>
                <div className="p-3 rounded-full bg-green-100">
                  <ArrowUp className="h-6 w-6 text-green-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Расходы за период</p>
                  {isLoading ? <div className="h-8 flex items-center">
                      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    </div> : <p className="text-2xl font-bold text-red-600">
                      {financialSummary ? formatCurrency(financialSummary.total_expense) : '—'}
                    </p>}
                </div>
                <div className="p-3 rounded-full bg-red-100">
                  <ArrowDown className="h-6 w-6 text-red-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Выручка за период</p>
                  {isLoading ? <div className="h-8 flex items-center">
                      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    </div> : <p className={`text-2xl font-bold ${financialSummary && financialSummary.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {financialSummary ? formatCurrency(financialSummary.profit) : '—'}
                    </p>}
                </div>
                <div className={`p-3 rounded-full ${financialSummary && financialSummary.profit >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                  <TrendingUp className={`h-6 w-6 ${financialSummary && financialSummary.profit >= 0 ? 'text-green-600' : 'text-red-600'}`} />
                </div>
              </CardContent>
            </Card>
            
            {/* Summary charts */}
            <Card className="md:col-span-3">
              <CardContent className="p-6">
                <h2 className="text-lg font-medium mb-4">Сводка доходов и расходов</h2>
                {isLoading ? <div className="flex items-center justify-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div> : <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-sm font-medium mb-2 text-center">Доходы по категориям</h3>
                      {incomeCategories.length > 0 ? <ResponsiveContainer width="100%" height={300}>
                          <PieChart>
                            <Pie data={incomeCategories} dataKey="total_amount" nameKey="category_name" cx="50%" cy="50%" outerRadius={80} label={({
                        category_name
                      }) => category_name}>
                              {incomeCategories.map((_, index) => <Cell key={`cell-${index}`} fill={INCOME_COLORS[index % INCOME_COLORS.length]} />)}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                          </PieChart>
                        </ResponsiveContainer> : <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                          Нет данных о доходах за выбранный период
                        </div>}
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium mb-2 text-center">Расходы по категориям</h3>
                      {expenseCategories.length > 0 ? <ResponsiveContainer width="100%" height={300}>
                          <PieChart>
                            <Pie data={expenseCategories} dataKey="total_amount" nameKey="category_name" cx="50%" cy="50%" outerRadius={80} label={({
                        category_name
                      }) => category_name}>
                              {expenseCategories.map((_, index) => <Cell key={`cell-${index}`} fill={EXPENSE_COLORS[index % EXPENSE_COLORS.length]} />)}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                          </PieChart>
                        </ResponsiveContainer> : <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                          Нет данных о расходах за выбранный период
                        </div>}
                    </div>
                  </div>}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Expenses Tab */}
        <TabsContent value="expenses">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-medium mb-4">Расходы по категориям</h2>
              
              {isLoading ? <div className="flex items-center justify-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div> : expenseCategories.length === 0 ? <div className="text-center py-12 text-muted-foreground">
                  Нет данных о расходах за выбранный период
                </div> : <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <div className="space-y-4">
                      {expenseCategories.map((category, index) => <div key={category.category_id} className="flex justify-between items-center">
                          <div className="flex items-center">
                            <div className="w-3 h-3 rounded-full mr-2" style={{
                        backgroundColor: EXPENSE_COLORS[index % EXPENSE_COLORS.length]
                      }}></div>
                            <span>{category.category_name}</span>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className="font-medium">{formatCurrency(category.total_amount)}</span>
                            <span className="text-xs text-muted-foreground">
                              {getPercentage(category.total_amount, financialSummary?.total_expense || 0)}%
                            </span>
                          </div>
                        </div>)}
                    </div>
                  </div>
                  
                  <div>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie data={expenseCategories} dataKey="total_amount" nameKey="category_name" cx="50%" cy="50%" outerRadius={100} label={({
                      category_name,
                      total_amount,
                      percent
                    }) => `${category_name}: ${(percent * 100).toFixed(0)}%`}>
                          {expenseCategories.map((_, index) => <Cell key={`cell-${index}`} fill={EXPENSE_COLORS[index % EXPENSE_COLORS.length]} />)}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Income Tab */}
        <TabsContent value="income">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-medium mb-4">Доходы по категориям</h2>
              
              {isLoading ? <div className="flex items-center justify-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div> : incomeCategories.length === 0 ? <div className="text-center py-12 text-muted-foreground">
                  Нет данных о доходах за выбранный период
                </div> : <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <div className="space-y-4">
                      {incomeCategories.map((category, index) => <div key={category.category_id} className="flex justify-between items-center">
                          <div className="flex items-center">
                            <div className="w-3 h-3 rounded-full mr-2" style={{
                        backgroundColor: INCOME_COLORS[index % INCOME_COLORS.length]
                      }}></div>
                            <span>{category.category_name}</span>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className="font-medium">{formatCurrency(category.total_amount)}</span>
                            <span className="text-xs text-muted-foreground">
                              {getPercentage(category.total_amount, financialSummary?.total_income || 0)}%
                            </span>
                          </div>
                        </div>)}
                    </div>
                  </div>
                  
                  <div>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie data={incomeCategories} dataKey="total_amount" nameKey="category_name" cx="50%" cy="50%" outerRadius={100} label={({
                      category_name,
                      total_amount,
                      percent
                    }) => `${category_name}: ${(percent * 100).toFixed(0)}%`}>
                          {incomeCategories.map((_, index) => <Cell key={`cell-${index}`} fill={INCOME_COLORS[index % INCOME_COLORS.length]} />)}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>;
};
export default FinanceReportsPage;