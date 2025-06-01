
import React, { useState } from 'react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useOrdersFinancialSummary, OrdersFinancialFilters } from '@/hooks/finance/useOrdersFinancialSummary';
import { useIsMobile } from '@/hooks/use-mobile';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ResponsiveTable, ResponsiveRow, ResponsiveRowItem } from '@/components/ui/responsive-table';
import { Loader2, RefreshCw, ChevronDown, ChevronUp, Filter, Info } from 'lucide-react';

interface OrdersFinancialReportProps {
  dateFrom: Date;
  dateTo: Date;
}

export const OrdersFinancialReport = ({ dateFrom, dateTo }: OrdersFinancialReportProps) => {
  const isMobile = useIsMobile();
  const [filtersOpen, setFiltersOpen] = useState(!isMobile); // Open by default on desktop, closed on mobile
  
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

  // Update filters state when mobile state changes
  React.useEffect(() => {
    setFiltersOpen(!isMobile);
  }, [isMobile]);

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
      {/* Info Banner */}
      <Card className="border-l-4 border-l-blue-500 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Фильтрация по финансовым операциям</p>
              <p>
                В отчете отображаются заказы, которые имеют финансовые операции (доходы или расходы) в выбранном периоде.
                Суммы рассчитываются только для операций в указанном диапазоне дат.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Общий доход</div>
            <div className="text-xl md:text-2xl font-bold text-green-600">
              {formatCurrency(totals.totalIncome)}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Общие расходы</div>
            <div className="text-xl md:text-2xl font-bold text-red-600">
              {formatCurrency(totals.totalExpenses)}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Общая прибыль</div>
            <div className={`text-xl md:text-2xl font-bold ${totals.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(totals.totalProfit)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Single Collapsible Filters Section */}
      <Card>
        <CardContent className="p-4">
          <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen}>
            {/* Show trigger button on mobile, hide on desktop but show filters */}
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between md:hidden mb-4">
                <span className="flex items-center">
                  <Filter className="mr-2 h-4 w-4" />
                  Фильтры
                </span>
                {filtersOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
            
            <CollapsibleContent className="space-y-4 md:space-y-0">
              <div className="flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1 w-full">
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
                
                <div className="flex-1 w-full">
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
                
                <Button variant="outline" onClick={() => refetch()} disabled={isLoading} className="w-full md:w-auto">
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                  Обновить
                </Button>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>

      {/* Responsive Orders Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : ordersData.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-lg font-medium mb-2">Нет данных о заказах за выбранный период</p>
              <p className="text-sm">
                Попробуйте изменить период или проверьте, есть ли финансовые операции в выбранном диапазоне дат
              </p>
            </div>
          ) : (
            <ResponsiveTable>
              {/* Desktop Table Header */}
              <thead className="hidden lg:table-header-group">
                <tr className="border-b bg-gradient-to-r from-green-600 to-green-500">
                  <th className="h-12 px-4 text-left align-middle font-semibold text-white">Номер заказа</th>
                  <th className="h-12 px-4 text-left align-middle font-semibold text-white">Название заказа</th>
                  <th className="h-12 px-4 text-left align-middle font-semibold text-white">Клиент</th>
                  <th className="h-12 px-4 text-left align-middle font-semibold text-white">Тип</th>
                  <th className="h-12 px-4 text-left align-middle font-semibold text-white">Статус</th>
                  <th className="h-12 px-4 text-left align-middle font-semibold text-white">Дата создания</th>
                  <th className="h-12 px-4 text-left align-middle font-semibold text-white">Дата закрытия</th>
                  <th className="h-12 px-4 text-right align-middle font-semibold text-white">Доходы*</th>
                  <th className="h-12 px-4 text-right align-middle font-semibold text-white">Расходы*</th>
                  <th className="h-12 px-4 text-right align-middle font-semibold text-white">Прибыль*</th>
                </tr>
              </thead>
              
              <tbody className="hidden lg:table-row-group">
                {ordersData.map((order) => (
                  <tr key={order.order_id} className="border-b transition-colors hover:bg-muted/50">
                    <td className="p-4 align-middle font-medium">{order.order_number}</td>
                    <td className="p-4 align-middle">{order.order_name || '—'}</td>
                    <td className="p-4 align-middle">{order.client_name || '—'}</td>
                    <td className="p-4 align-middle">
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {order.order_type}
                      </span>
                    </td>
                    <td className="p-4 align-middle">
                      <span className={`text-xs px-2 py-1 rounded ${
                        order.status === 'Завершен' ? 'bg-green-100 text-green-800' :
                        order.status === 'В работе' ? 'bg-yellow-100 text-yellow-800' :
                        order.status === 'Отменен' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="p-4 align-middle">{formatDate(order.created_at)}</td>
                    <td className="p-4 align-middle">{order.closing_date ? formatDate(order.closing_date) : '—'}</td>
                    <td className="p-4 align-middle text-right font-medium text-green-600">
                      {formatCurrency(order.total_income)}
                    </td>
                    <td className="p-4 align-middle text-right font-medium text-red-600">
                      {formatCurrency(order.total_expenses)}
                    </td>
                    <td className={`p-4 align-middle text-right font-medium ${
                      order.profit >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatCurrency(order.profit)}
                    </td>
                  </tr>
                ))}
              </tbody>

              {/* Mobile Cards - Only show on mobile screens */}
              <div className="lg:hidden">
                {ordersData.map((order) => (
                  <ResponsiveRow key={`mobile-${order.order_id}`}>
                    <ResponsiveRowItem 
                      label="Номер заказа" 
                      value={<span className="font-medium">{order.order_number}</span>} 
                    />
                    <ResponsiveRowItem 
                      label="Название заказа" 
                      value={order.order_name || '—'} 
                    />
                    <ResponsiveRowItem 
                      label="Клиент" 
                      value={order.client_name || '—'} 
                    />
                    <ResponsiveRowItem 
                      label="Тип" 
                      value={
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {order.order_type}
                        </span>
                      } 
                    />
                    <ResponsiveRowItem 
                      label="Статус" 
                      value={
                        <span className={`text-xs px-2 py-1 rounded ${
                          order.status === 'Завершен' ? 'bg-green-100 text-green-800' :
                          order.status === 'В работе' ? 'bg-yellow-100 text-yellow-800' :
                          order.status === 'Отменен' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {order.status}
                        </span>
                      } 
                    />
                    <ResponsiveRowItem 
                      label="Дата создания" 
                      value={formatDate(order.created_at)} 
                    />
                    <ResponsiveRowItem 
                      label="Дата закрытия" 
                      value={order.closing_date ? formatDate(order.closing_date) : '—'} 
                    />
                    <ResponsiveRowItem 
                      label="Доходы*" 
                      value={<span className="font-medium text-green-600">{formatCurrency(order.total_income)}</span>} 
                    />
                    <ResponsiveRowItem 
                      label="Расходы*" 
                      value={<span className="font-medium text-red-600">{formatCurrency(order.total_expenses)}</span>} 
                    />
                    <ResponsiveRowItem 
                      label="Прибыль*" 
                      value={
                        <span className={`font-medium ${order.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(order.profit)}
                        </span>
                      } 
                    />
                  </ResponsiveRow>
                ))}
              </div>
            </ResponsiveTable>
          )}
          
          {/* Footer note about filtering */}
          {ordersData.length > 0 && (
            <div className="px-4 py-3 border-t bg-gray-50">
              <p className="text-xs text-gray-600">
                * Суммы рассчитаны только для финансовых операций в выбранном периоде
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OrdersFinancialReport;
