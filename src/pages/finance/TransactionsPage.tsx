
import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { format } from "date-fns";
import {
  useTransactions,
  useAddTransaction,
  useUpdateTransaction,
  useDeleteTransaction,
  TransactionWithRelations,
  TransactionFormData,
  TransactionFilters
} from "@/hooks/finance/useTransactions";
import { useTransactionCategories } from "@/hooks/finance/useTransactionCategories";
import TransactionForm from "@/components/finance/TransactionForm";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Pencil, Trash2, Plus, CalendarIcon, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

const TransactionsPage: React.FC = () => {
  const { userRole } = useAuth();
  const [filters, setFilters] = useState<TransactionFilters>({
    dateFrom: null,
    dateTo: null,
    type: null,
    categoryId: null,
  });
  const [isFiltersApplied, setIsFiltersApplied] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentTransaction, setCurrentTransaction] = useState<TransactionWithRelations | undefined>(undefined);
  const [transactionToDelete, setTransactionToDelete] = useState<TransactionWithRelations | null>(null);
  
  const { data: categories } = useTransactionCategories();
  const { data: transactions, isLoading, error } = useTransactions(isFiltersApplied ? filters : undefined);

  const addTransaction = useAddTransaction();
  const updateTransaction = useUpdateTransaction();
  const deleteTransaction = useDeleteTransaction();

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

  if (error) {
    toast.error("Не удалось загрузить операции. Пожалуйста, попробуйте позже.");
  }

  const handleOpenDialog = (transaction?: TransactionWithRelations) => {
    setCurrentTransaction(transaction);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (data: TransactionFormData) => {
    try {
      if (currentTransaction) {
        await updateTransaction.mutateAsync({
          id: currentTransaction.id,
          transactionData: data,
        });
      } else {
        await addTransaction.mutateAsync(data);
      }
      setIsDialogOpen(false);
      setCurrentTransaction(undefined);
    } catch (error) {
      console.error("Error submitting transaction:", error);
    }
  };

  const handleOpenDeleteDialog = (transaction: TransactionWithRelations) => {
    setTransactionToDelete(transaction);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteTransaction = async () => {
    if (!transactionToDelete) return;
    
    try {
      await deleteTransaction.mutateAsync(transactionToDelete.id);
      setIsDeleteDialogOpen(false);
      setTransactionToDelete(null);
    } catch (error) {
      console.error("Error deleting transaction:", error);
    }
  };

  const applyFilters = () => {
    setIsFiltersApplied(true);
  };

  const resetFilters = () => {
    setFilters({
      dateFrom: null,
      dateTo: null,
      type: null,
      categoryId: null,
    });
    setIsFiltersApplied(false);
  };

  const formatCurrency = (amount: number, currency: string) => {
    return `${amount.toFixed(2)} ${currency}`;
  };

  const getTypeLabel = (type: string) => {
    return type === "income" ? "Доход" : "Расход";
  };

  const getTypeStyle = (type: string) => {
    return type === "income" 
      ? "bg-green-100 text-green-800" 
      : "bg-red-100 text-red-800";
  };

  // Render loading state
  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Финансовые Операции</h1>
          <Skeleton className="h-10 w-40" />
        </div>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Фильтры</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </CardContent>
        </Card>
        <div className="border rounded-lg">
          <div className="p-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="py-3">
                <Skeleton className="h-6 w-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Финансовые Операции</h1>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Добавить операцию
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Фильтры</CardTitle>
          <CardDescription>Используйте фильтры для поиска нужных операций</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            {/* Date From Filter */}
            <div className="flex flex-col space-y-1.5">
              <label className="text-sm font-medium">Дата с</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "justify-start text-left font-normal",
                      !filters.dateFrom && "text-muted-foreground"
                    )}
                  >
                    {filters.dateFrom ? (
                      format(new Date(filters.dateFrom), "dd.MM.yyyy")
                    ) : (
                      <span>Выберите дату</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={filters.dateFrom ? new Date(filters.dateFrom) : undefined}
                    onSelect={(date) =>
                      setFilters({
                        ...filters,
                        dateFrom: date ? format(date, "yyyy-MM-dd") : null,
                      })
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Date To Filter */}
            <div className="flex flex-col space-y-1.5">
              <label className="text-sm font-medium">Дата по</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "justify-start text-left font-normal",
                      !filters.dateTo && "text-muted-foreground"
                    )}
                  >
                    {filters.dateTo ? (
                      format(new Date(filters.dateTo), "dd.MM.yyyy")
                    ) : (
                      <span>Выберите дату</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={filters.dateTo ? new Date(filters.dateTo) : undefined}
                    onSelect={(date) =>
                      setFilters({
                        ...filters,
                        dateTo: date ? format(date, "yyyy-MM-dd") : null,
                      })
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Type Filter */}
            <div className="flex flex-col space-y-1.5">
              <label className="text-sm font-medium">Тип операции</label>
              <Select
                value={filters.type || ""}
                onValueChange={(value) =>
                  setFilters({
                    ...filters,
                    type: value === "" ? null : (value as "income" | "expense"),
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Все типы" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Все типы</SelectItem>
                  <SelectItem value="income">Доход</SelectItem>
                  <SelectItem value="expense">Расход</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Category Filter */}
            <div className="flex flex-col space-y-1.5">
              <label className="text-sm font-medium">Категория</label>
              <Select
                value={filters.categoryId?.toString() || ""}
                onValueChange={(value) =>
                  setFilters({
                    ...filters,
                    categoryId: value === "" ? null : parseInt(value),
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Все категории" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Все категории</SelectItem>
                  {categories?.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={resetFilters}>
              Сбросить
            </Button>
            <Button onClick={applyFilters}>
              Применить фильтры
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Дата</TableHead>
              <TableHead>Тип</TableHead>
              <TableHead>Категория</TableHead>
              <TableHead>Сумма</TableHead>
              <TableHead>Описание</TableHead>
              <TableHead>Связанные сущности</TableHead>
              <TableHead className="text-right">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions && transactions.length > 0 ? (
              transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>
                    {format(new Date(transaction.transaction_date), "dd.MM.yyyy")}
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getTypeStyle(transaction.type)}`}>
                      {getTypeLabel(transaction.type)}
                    </span>
                  </TableCell>
                  <TableCell>{transaction.category?.name || "-"}</TableCell>
                  <TableCell className="font-medium">
                    {formatCurrency(transaction.amount, transaction.currency)}
                  </TableCell>
                  <TableCell>{transaction.description || "-"}</TableCell>
                  <TableCell>
                    {transaction.related_order?.order_number || 
                     transaction.related_contact?.full_name ||
                     transaction.related_supplier?.supplier_name ||
                     transaction.related_partner_manufacturer?.company_name ||
                     transaction.related_user?.full_name || "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenDialog(transaction)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenDeleteDialog(transaction)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-4">
                  Операции не найдены. Добавьте первую операцию или измените фильтры поиска.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {currentTransaction ? "Редактировать операцию" : "Добавить операцию"}
            </DialogTitle>
          </DialogHeader>
          <TransactionForm
            onSubmit={handleSubmit}
            initialData={currentTransaction}
            onCancel={() => setIsDialogOpen(false)}
            isSubmitting={addTransaction.isPending || updateTransaction.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Подтверждение удаления</AlertDialogTitle>
            <AlertDialogDescription>
              Вы действительно хотите удалить операцию 
              {transactionToDelete ? ` от ${format(new Date(transactionToDelete.transaction_date), "dd.MM.yyyy")} на сумму ${formatCurrency(transactionToDelete.amount, transactionToDelete.currency)}` : ""}?
              <br />
              Это действие нельзя отменить.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTransaction}
              className="bg-red-500 hover:bg-red-600"
            >
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TransactionsPage;
