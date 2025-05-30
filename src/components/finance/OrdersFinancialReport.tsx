
import React, { useState } from 'react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useOrdersFinancialSummary, OrdersFinancialFilters } from '@/hooks/finance/useOrdersFinancialSummary';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, RefreshCw } from 'lucide-react';

interface OrdersFinancialReportProps {
  dateFrom: Date;
  dateTo: Date;
}

export const OrdersFinancialReport = ({ dateFrom, dateTo }: OrdersFinancialReportProps) => {
  const [filters, setFilters] = useState<OrdersFinancialFilters>({
    dateFrom: format(dateFrom, 'yyyy-MM-dd'),
    dateTo: format(dateTo, 'yyyy-MM-dd'),
    orderType: 'all',
    orderStatus: 'all'
  });

  // Update filters when date props change
  React.useEffect(() => {
    setFilters(prev => ({
      ...prev,
      dateFrom: format(dateFrom, 'yyyy-MM-dd'),
      dateTo: format(dateTo, 'yyyy-MM-dd')
    }));
  }, [dateFrom, dateTo]);

  const {
    data: ordersData = [],
    isLoading,
    refetch
  } = useOrdersFinancialSummary(filters);

  // Calculate totals
  const totals = ordersData.reduce(
    (acc, order) => ({
      totalIncome: acc.totalIncome + order.total_income,
      totalExpenses: acc.totalExpenses + order.total_expenses,
      totalProfit: acc.totalProfit + order.profit
    }),
    { totalIncome: 0, totalExpenses: 0, totalProfit: 0 }
  );

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'EUR'
    }).format(value);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd.MM.yyyy', { locale: ru });
  };

  const handleFilterChange = (key: keyof OrdersFinancialFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === 'all' ? undefined : value
    }));
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Общий доход</div>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totals.totalIncome)}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Общие расходы</div>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(totals.totalExpenses)}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Общая прибыль</div>
            <div className={`text-2xl font-bold ${totals.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(totals.totalProfit)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Тип заказа</label>
              <Select 
                value={filters.orderType || 'all'} 
                onValueChange={(value) => handleFilterChange('orderType', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все типы</SelectItem>
                  <SelectItem value="Готовая мебель (Tilda)">Готовая мебель (Tilda)</SelectItem>
                  <SelectItem value="Мебель на заказ">Мебель на заказ</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Статус заказа</label>
              <Select 
                value={filters.orderStatus || 'all'} 
                onValueChange={(value) => handleFilterChange('orderStatus', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все статусы</SelectItem>
                  <SelectItem value="Новый">Новый</SelectItem>
                  <SelectItem value="В работе">В работе</SelectItem>
                  <SelectItem value="Завершен">Завершен</SelectItem>
                  <SelectItem value="Отменен">Отменен</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button variant="outline" onClick={() => refetch()} disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
              Обновить
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : ordersData.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              Нет данных о заказах за выбранный период
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Номер заказа</TableHead>
                    <TableHead>Название заказа</TableHead>
                    <TableHead>Клиент</TableHead>
                    <TableHead>Тип</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead>Дата создания</TableHead>
                    <TableHead>Дата закрытия</TableHead>
                    <TableHead className="text-right">Доходы</TableHead>
                    <TableHead className="text-right">Расходы</TableHead>
                    <TableHead className="text-right">Прибыль</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ordersData.map((order) => (
                    <TableRow key={order.order_id}>
                      <TableCell className="font-medium">{order.order_number}</TableCell>
                      <TableCell>{order.order_name || '—'}</TableCell>
                      <TableCell>{order.client_name || '—'}</TableCell>
                      <TableCell>
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {order.order_type}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={`text-xs px-2 py-1 rounded ${
                          order.status === 'Завершен' ? 'bg-green-100 text-green-800' :
                          order.status === 'В работе' ? 'bg-yellow-100 text-yellow-800' :
                          order.status === 'Отменен' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {order.status}
                        </span>
                      </TableCell>
                      <TableCell>{formatDate(order.created_at)}</TableCell>
                      <TableCell>{order.closing_date ? formatDate(order.closing_date) : '—'}</TableCell>
                      <TableCell className="text-right font-medium text-green-600">
                        {formatCurrency(order.total_income)}
                      </TableCell>
                      <TableCell className="text-right font-medium text-red-600">
                        {formatCurrency(order.total_expenses)}
                      </TableCell>
                      <TableCell className={`text-right font-medium ${
                        order.profit >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatCurrency(order.profit)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OrdersFinancialReport;
