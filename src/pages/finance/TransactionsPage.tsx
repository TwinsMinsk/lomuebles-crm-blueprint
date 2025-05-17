
import React, { useState } from 'react';
import { useTransactions, useAddTransaction, useUpdateTransaction, useDeleteTransaction, TransactionWithRelations, TransactionsFilters, TransactionFormData } from '@/hooks/finance/useTransactions';
import { useTransactionCategories } from '@/hooks/finance/useTransactionCategories';
import { useAuth } from '@/context/AuthContext';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { ru } from 'date-fns/locale';

// Import components 
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DateRangePicker } from '@/components/ui/date-picker';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import TransactionForm from '@/components/finance/TransactionForm';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';

// Import icons
import { Plus, Filter, MoreHorizontal, Search, FileText, Euro, ArrowUp, ArrowDown, Trash2, Edit, ExternalLink, CalendarIcon, RefreshCw, Download } from 'lucide-react';

const TransactionsPage = () => {
  const { userRole } = useAuth();
  const isAdmin = userRole === 'Главный Администратор' || userRole === 'Администратор';
  
  // State for filters
  const [dateFrom, setDateFrom] = useState<Date>(startOfMonth(subMonths(new Date(), 1)));
  const [dateTo, setDateTo] = useState<Date>(endOfMonth(new Date()));
  const [transactionType, setTransactionType] = useState<'all' | 'income' | 'expense'>('all');
  const [categoryId, setCategoryId] = useState<number | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState('');
  
  // State for transaction operations
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentTransaction, setCurrentTransaction] = useState<TransactionWithRelations | null>(null);
  
  // Get transactions with filters
  const filters: TransactionsFilters = {
    dateFrom: dateFrom ? format(dateFrom, 'yyyy-MM-dd') : undefined,
    dateTo: dateTo ? format(dateTo, 'yyyy-MM-dd') : undefined,
    type: transactionType,
    categoryId: categoryId,
  };
  
  const { data: transactions = [], isLoading, refetch } = useTransactions(filters);
  const { data: categories = [] } = useTransactionCategories();
  const addTransaction = useAddTransaction();
  const updateTransaction = useUpdateTransaction();
  const deleteTransaction = useDeleteTransaction();
  
  // Filter transactions by search term
  const filteredTransactions = transactions.filter(tx => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    
    // Search in various fields
    return (
      (tx.description && tx.description.toLowerCase().includes(searchLower)) ||
      tx.category.name.toLowerCase().includes(searchLower) ||
      (tx.related_order && tx.related_order.order_number.toLowerCase().includes(searchLower)) ||
      (tx.related_contact && tx.related_contact.full_name.toLowerCase().includes(searchLower)) ||
      (tx.related_supplier && tx.related_supplier.company_name.toLowerCase().includes(searchLower)) ||
      (tx.related_partner_manufacturer && tx.related_partner_manufacturer.company_name.toLowerCase().includes(searchLower)) ||
      (tx.payment_method && tx.payment_method.toLowerCase().includes(searchLower))
    );
  });
  
  // Calculate totals
  const totalIncome = filteredTransactions
    .filter(tx => tx.type === 'income')
    .reduce((sum, tx) => sum + Number(tx.amount), 0);
  
  const totalExpense = filteredTransactions
    .filter(tx => tx.type === 'expense')
    .reduce((sum, tx) => sum + Number(tx.amount), 0);
  
  const balance = totalIncome - totalExpense;
  
  // Transactions handling functions
  const handleAdd = async (data: TransactionFormData) => {
    try {
      await addTransaction.mutateAsync(data);
      toast.success("Операция успешно создана");
      setIsAddDialogOpen(false);
      refetch();
    } catch (error) {
      toast.error("Ошибка при создании операции");
      console.error(error);
    }
  };

  const handleUpdate = async (data: TransactionFormData) => {
    if (!currentTransaction) return;
    
    try {
      await updateTransaction.mutateAsync({
        id: currentTransaction.id,
        transactionData: data
      });
      toast.success("Операция успешно обновлена");
      setIsEditDialogOpen(false);
      setCurrentTransaction(null);
      refetch();
    } catch (error) {
      toast.error("Ошибка при обновлении операции");
      console.error(error);
    }
  };
  
  const handleDelete = async () => {
    if (!currentTransaction) return;
    
    try {
      await deleteTransaction.mutateAsync(currentTransaction.id);
      toast.success("Операция успешно удалена");
      setIsDeleteDialogOpen(false);
      setCurrentTransaction(null);
      refetch();
    } catch (error) {
      toast.error("Ошибка при удалении операции");
      console.error(error);
    }
  };
  
  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'EUR' }).format(value);
  };

  // Skip rendering if user doesn't have admin permissions
  if (!isAdmin) {
    return (
      <div className="container mx-auto p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Доступ запрещен</h1>
        <p>У вас нет прав для просмотра финансовой информации.</p>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
        <h1 className="text-2xl font-bold mb-4 sm:mb-0">Финансовые операции</h1>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Добавить операцию
        </Button>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Доходы</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(totalIncome)}</p>
            </div>
            <div className="p-3 rounded-full bg-green-100">
              <ArrowUp className="h-6 w-6 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Расходы</p>
              <p className="text-2xl font-bold text-red-600">{formatCurrency(totalExpense)}</p>
            </div>
            <div className="p-3 rounded-full bg-red-100">
              <ArrowDown className="h-6 w-6 text-red-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Баланс</p>
              <p className={`text-2xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(balance)}
              </p>
            </div>
            <div className={`p-3 rounded-full ${balance >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
              <Euro className={`h-6 w-6 ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`} />
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="w-full md:w-auto flex-grow">
            <label className="block text-sm font-medium text-gray-700 mb-1">Период</label>
            <DateRangePicker 
              dateFrom={dateFrom} 
              dateTo={dateTo} 
              onDateFromChange={setDateFrom} 
              onDateToChange={setDateTo} 
            />
          </div>
          
          <div className="w-full md:w-48">
            <label className="block text-sm font-medium text-gray-700 mb-1">Тип операции</label>
            <Select value={transactionType} onValueChange={(value: any) => setTransactionType(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Выберите тип" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все операции</SelectItem>
                <SelectItem value="income">Доходы</SelectItem>
                <SelectItem value="expense">Расходы</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="w-full md:w-64">
            <label className="block text-sm font-medium text-gray-700 mb-1">Категория</label>
            <Select value={categoryId?.toString() || ""} onValueChange={(value) => setCategoryId(value ? parseInt(value) : undefined)}>
              <SelectTrigger>
                <SelectValue placeholder="Выберите категорию" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Все категории</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="w-full md:w-64">
            <label className="block text-sm font-medium text-gray-700 mb-1">Поиск</label>
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Поиск по операциям"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
          
          <Button variant="outline" size="icon" onClick={() => refetch()} title="Обновить">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Transactions Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Дата</TableHead>
              <TableHead>Тип</TableHead>
              <TableHead>Категория</TableHead>
              <TableHead>Описание</TableHead>
              <TableHead>Связанный объект</TableHead>
              <TableHead className="text-right">Сумма</TableHead>
              <TableHead className="text-right">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTransactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  {isLoading ? "Загрузка операций..." : "Операции не найдены"}
                </TableCell>
              </TableRow>
            ) : (
              filteredTransactions.map((transaction) => {
                // Determine related entity
                let relatedEntity = null;
                if (transaction.related_order) {
                  relatedEntity = (
                    <span className="text-sm">
                      Заказ: <span className="font-medium">{transaction.related_order.order_number}</span>
                    </span>
                  );
                } else if (transaction.related_contact) {
                  relatedEntity = (
                    <span className="text-sm">
                      Контакт: <span className="font-medium">{transaction.related_contact.full_name}</span>
                    </span>
                  );
                } else if (transaction.related_supplier) {
                  relatedEntity = (
                    <span className="text-sm">
                      Поставщик: <span className="font-medium">{transaction.related_supplier.company_name}</span>
                    </span>
                  );
                } else if (transaction.related_partner_manufacturer) {
                  relatedEntity = (
                    <span className="text-sm">
                      Партнер: <span className="font-medium">{transaction.related_partner_manufacturer.company_name}</span>
                    </span>
                  );
                }
                
                return (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      {format(new Date(transaction.transaction_date), "dd.MM.yyyy", {locale: ru})}
                    </TableCell>
                    <TableCell>
                      {transaction.type === 'income' ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <ArrowUp className="mr-1 h-3 w-3" /> Доход
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <ArrowDown className="mr-1 h-3 w-3" /> Расход
                        </span>
                      )}
                    </TableCell>
                    <TableCell>{transaction.category.name}</TableCell>
                    <TableCell className="max-w-xs truncate" title={transaction.description || ''}>
                      {transaction.description || '—'}
                    </TableCell>
                    <TableCell>{relatedEntity || '—'}</TableCell>
                    <TableCell className={`text-right font-medium ${
                      transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatCurrency(transaction.amount)}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => {
                            setCurrentTransaction(transaction);
                            setIsEditDialogOpen(true);
                          }}>
                            <Edit className="mr-2 h-4 w-4" /> Редактировать
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {
                            setCurrentTransaction(transaction);
                            setIsDeleteDialogOpen(true);
                          }}>
                            <Trash2 className="mr-2 h-4 w-4" /> Удалить
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Add Transaction Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Создание финансовой операции</DialogTitle>
          </DialogHeader>
          <TransactionForm 
            onSuccess={handleAdd}
            onCancel={() => setIsAddDialogOpen(false)}
            isSubmitting={addTransaction.isPending}
          />
        </DialogContent>
      </Dialog>
      
      {/* Edit Transaction Dialog */}
      {currentTransaction && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Редактирование операции</DialogTitle>
            </DialogHeader>
            <TransactionForm 
              onSuccess={handleUpdate}
              initialData={{
                transaction_date: currentTransaction.transaction_date,
                type: currentTransaction.type,
                category_id: currentTransaction.category_id,
                amount: currentTransaction.amount,
                currency: currentTransaction.currency,
                description: currentTransaction.description,
                payment_method: currentTransaction.payment_method,
                related_order_id: currentTransaction.related_order_id,
                related_contact_id: currentTransaction.related_contact_id,
                related_supplier_id: currentTransaction.related_supplier_id,
                related_partner_manufacturer_id: currentTransaction.related_partner_manufacturer_id,
                related_user_id: currentTransaction.related_user_id,
              }}
              onCancel={() => setIsEditDialogOpen(false)}
              isSubmitting={updateTransaction.isPending}
            />
          </DialogContent>
        </Dialog>
      )}
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Вы уверены?</AlertDialogTitle>
            <AlertDialogDescription>
              Это действие нельзя отменить. Финансовая операция будет безвозвратно удалена.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TransactionsPage;
