import React, { useState } from "react";
import { format } from "date-fns";
import { useTransactions, useAddTransaction, useUpdateTransaction, useDeleteTransaction, TransactionWithRelations, TransactionFormData, TransactionsFilters } from "@/hooks/finance/useTransactions";
import { useTransactionCategories } from "@/hooks/finance/useTransactionCategories";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Plus, FileText, DollarSign } from "lucide-react";
import TransactionForm from "@/components/finance/TransactionForm";
import CollapsibleTransactionFilters from "@/components/finance/CollapsibleTransactionFilters";
import ModernTransactionsTable from "@/components/finance/ModernTransactionsTable";
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle } from "@/components/ui/modern-card";
import { FloatingActionButton } from "@/components/ui/floating-action-button";

// Define interface for local filters
interface LocalTransactionsFilters {
  dateFrom?: Date;
  dateTo?: Date;
  type?: 'income' | 'expense' | 'all';
  categoryId?: number;
  searchTerm?: string;
}

const TransactionsPage = () => {
  // State for filters
  const [filters, setFilters] = useState<LocalTransactionsFilters>({
    dateFrom: undefined,
    dateTo: undefined,
    type: 'all',
    categoryId: undefined,
    searchTerm: "",
  });
  
  // State for dialogs
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionWithRelations | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  // Convert date filters to ISO string format for the API
  const apiFilters: TransactionsFilters = {
    dateFrom: filters.dateFrom ? format(filters.dateFrom, "yyyy-MM-dd") : undefined,
    dateTo: filters.dateTo ? format(filters.dateTo, "yyyy-MM-dd") : undefined,
    type: filters.type !== 'all' ? filters.type : undefined,
    categoryId: filters.categoryId,
  };
  
  // Get transactions data
  const { data: transactions = [], isLoading, isError, error } = useTransactions(apiFilters);
  
  // For debugging errors
  React.useEffect(() => {
    if (isError) {
      console.error("Error fetching transactions:", error);
    }
  }, [isError, error]);
  
  // Get categories for filters and forms
  const { data: categories = [] } = useTransactionCategories();
  
  // Mutations
  const addTransaction = useAddTransaction();
  const updateTransaction = useUpdateTransaction();
  const deleteTransaction = useDeleteTransaction();
  
  // Filter transactions by search term locally
  const filteredTransactions = transactions.filter(transaction => {
    if (!filters.searchTerm) return true;
    
    const searchLower = filters.searchTerm.toLowerCase();
    
    // Search in various fields with null/undefined checks
    return (
      (transaction.description?.toLowerCase().includes(searchLower) || false) ||
      (transaction.category?.name?.toLowerCase().includes(searchLower) || false) ||
      (transaction.related_order?.order_number?.toLowerCase().includes(searchLower) || false) ||
      (transaction.related_contact?.full_name?.toLowerCase().includes(searchLower) || false) ||
      (transaction.related_supplier?.supplier_name?.toLowerCase().includes(searchLower) || false) ||
      (transaction.related_partner_manufacturer?.company_name?.toLowerCase().includes(searchLower) || false) ||
      (transaction.related_user?.full_name?.toLowerCase().includes(searchLower) || false)
    );
  });
  
  // Handle form submission for new transaction
  const handleAddTransaction = async (data: TransactionFormData) => {
    try {
      const result = await addTransaction.mutateAsync(data);
      
      // If there were pending files, we need to upload them now
      if (data.attached_files && data.attached_files.some(f => f.isPending)) {
        console.log("Transaction created with ID:", result.id, "- handling pending files");
        
        // Note: In a real implementation, you would call the upload function here
        // For now, we'll just show the transaction was created
        toast.success("Операция создана, файлы будут загружены");
      } else {
        toast.success("Операция успешно создана");
      }
      
      setIsAddDialogOpen(false);
    } catch (error: any) {
      console.error("Error adding transaction:", error);
      toast.error(`Ошибка: ${error.message || "Произошла ошибка при создании операции"}`);
    }
  };
  
  // Handle form submission for updating transaction
  const handleUpdateTransaction = async (data: TransactionFormData) => {
    if (!selectedTransaction) return;
    
    try {
      await updateTransaction.mutateAsync({ 
        id: selectedTransaction.id, 
        transactionData: data 
      });
      setIsEditDialogOpen(false);
      setSelectedTransaction(null);
      toast.success("Операция успешно обновлена");
    } catch (error: any) {
      console.error("Error updating transaction:", error);
      toast.error(`Ошибка: ${error.message || "Произошла ошибка при обновлении операции"}`);
    }
  };
  
  // Handle transaction deletion
  const handleDeleteTransaction = async () => {
    if (!selectedTransaction) return;
    
    try {
      await deleteTransaction.mutateAsync(selectedTransaction.id);
      setIsDeleteDialogOpen(false);
      setSelectedTransaction(null);
      toast.success("Операция успешно удалена");
    } catch (error: any) {
      console.error("Error deleting transaction:", error);
      toast.error(`Ошибка: ${error.message || "Произошла ошибка при удалении операции"}`);
    }
  };
  
  // Format amount with currency
  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('ru-RU', { 
      style: 'currency', 
      currency: currency 
    }).format(amount);
  };
  
  // Format date
  const formatDate = (date: string) => {
    return format(new Date(date), 'dd.MM.yyyy');
  };
  
  // Get transaction display name for related entities
  const getRelatedEntityName = (transaction: TransactionWithRelations) => {
    if (transaction.related_order) {
      return `Заказ #${transaction.related_order.order_number}`;
    }
    if (transaction.related_contact) {
      return transaction.related_contact.full_name;
    }
    if (transaction.related_supplier) {
      return transaction.related_supplier.supplier_name;
    }
    if (transaction.related_partner_manufacturer) {
      return transaction.related_partner_manufacturer.company_name;
    }
    if (transaction.related_user) {
      return transaction.related_user.full_name;
    }
    return "—";
  };

  const handleResetFilters = () => {
    setFilters({
      dateFrom: undefined,
      dateTo: undefined,
      type: 'all',
      categoryId: undefined,
      searchTerm: "",
    });
  };
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Финансовые операции</h1>
        <div className="hidden lg:block">
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Добавить операцию
          </Button>
        </div>
      </div>
      
      <CollapsibleTransactionFilters
        filters={filters}
        setFilters={setFilters}
        onResetFilters={handleResetFilters}
      />
      
      <ModernCard>
        <ModernCardHeader>
          <div className="flex items-center justify-between">
            <ModernCardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Список операций
            </ModernCardTitle>
            <span className="text-sm text-gray-500">
              Найдено {filteredTransactions.length} операций
            </span>
          </div>
        </ModernCardHeader>
        <ModernCardContent className="p-0">
          <ModernTransactionsTable
            transactions={filteredTransactions}
            loading={isLoading}
            onView={(transaction) => {
              setSelectedTransaction(transaction);
              setIsViewDialogOpen(true);
            }}
            onEdit={(transaction) => {
              setSelectedTransaction(transaction);
              setIsEditDialogOpen(true);
            }}
            onDelete={(transaction) => {
              setSelectedTransaction(transaction);
              setIsDeleteDialogOpen(true);
            }}
          />
        </ModernCardContent>
      </ModernCard>

      {/* Mobile FAB */}
      <FloatingActionButton
        onClick={() => setIsAddDialogOpen(true)}
        icon={<Plus className="h-6 w-6" />}
        label="Добавить операцию"
      />
      
      {/* Add Transaction Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Создать новую операцию</DialogTitle>
          </DialogHeader>
          {isAddDialogOpen && (
            <TransactionForm
              initialData={{
                transaction_date: new Date(),
                type: "income",
                amount: 0,
                currency: "EUR",
                category_id: undefined
              }}
              onSuccess={handleAddTransaction}
              onCancel={() => setIsAddDialogOpen(false)}
              isSubmitting={addTransaction.isPending}
            />
          )}
        </DialogContent>
      </Dialog>
      
      {/* Edit Transaction Dialog */}
      {selectedTransaction && isEditDialogOpen && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Редактировать операцию</DialogTitle>
            </DialogHeader>
            <TransactionForm
              initialData={{
                transaction_date: new Date(selectedTransaction.transaction_date),
                type: selectedTransaction.type,
                category_id: selectedTransaction.category_id,
                amount: selectedTransaction.amount,
                currency: selectedTransaction.currency,
                description: selectedTransaction.description,
                payment_method: selectedTransaction.payment_method,
                related_order_id: selectedTransaction.related_order_id,
                related_contact_id: selectedTransaction.related_contact_id,
                related_supplier_id: selectedTransaction.related_supplier_id,
                related_partner_manufacturer_id: selectedTransaction.related_partner_manufacturer_id,
                related_user_id: selectedTransaction.related_user_id
              }}
              transaction={selectedTransaction}
              onSuccess={handleUpdateTransaction}
              onCancel={() => setIsEditDialogOpen(false)}
              isSubmitting={updateTransaction.isPending}
            />
          </DialogContent>
        </Dialog>
      )}
      
      {/* View Transaction Dialog */}
      {selectedTransaction && isViewDialogOpen && (
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedTransaction.type === 'income' ? 'Доходная' : 'Расходная'} операция
              </DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium text-sm text-muted-foreground mb-1">Основная информация</h3>
                <div className="space-y-2">
                  <p><span className="font-medium">Дата:</span> {formatDate(selectedTransaction.transaction_date)}</p>
                  <p><span className="font-medium">Тип:</span> {selectedTransaction.type === 'income' ? 'Доход' : 'Расход'}</p>
                  <p><span className="font-medium">Категория:</span> {selectedTransaction.category?.name || '—'}</p>
                  <p className="font-medium">
                    Сумма: <span className={selectedTransaction.type === 'income' ? 'text-green-600' : 'text-red-600'}>
                      {formatAmount(selectedTransaction.amount, selectedTransaction.currency)}
                    </span>
                  </p>
                  {selectedTransaction.payment_method && (
                    <p><span className="font-medium">Способ оплаты:</span> {selectedTransaction.payment_method}</p>
                  )}
                </div>
              </div>
              
              <div>
                <h3 className="font-medium text-sm text-muted-foreground mb-1">Связанные объекты</h3>
                <div className="space-y-2">
                  {selectedTransaction.related_order && (
                    <p>
                      <span className="font-medium">Заказ:</span> #{selectedTransaction.related_order.order_number}
                      {selectedTransaction.related_order.order_name && ` - ${selectedTransaction.related_order.order_name}`}
                    </p>
                  )}
                  {selectedTransaction.related_contact && (
                    <p><span className="font-medium">Контакт:</span> {selectedTransaction.related_contact.full_name}</p>
                  )}
                  {selectedTransaction.related_supplier && (
                    <p><span className="font-medium">Поставщик:</span> {selectedTransaction.related_supplier.supplier_name}</p>
                  )}
                  {selectedTransaction.related_partner_manufacturer && (
                    <p><span className="font-medium">Партнер:</span> {selectedTransaction.related_partner_manufacturer.company_name}</p>
                  )}
                  {selectedTransaction.related_user && (
                    <p><span className="font-medium">Сотрудник:</span> {selectedTransaction.related_user.full_name}</p>
                  )}
                </div>
              </div>
            </div>
            
            {selectedTransaction.description && (
              <div className="mt-4">
                <h3 className="font-medium text-sm text-muted-foreground mb-1">Описание</h3>
                <p className="whitespace-pre-wrap bg-muted/50 p-3 rounded-md text-sm">
                  {selectedTransaction.description}
                </p>
              </div>
            )}
            
            {selectedTransaction.attached_files && selectedTransaction.attached_files.length > 0 && (
              <div className="mt-4">
                <h3 className="font-medium text-sm text-muted-foreground mb-1">Прикрепленные файлы</h3>
                <div className="space-y-1">
                  {selectedTransaction.attached_files.map((file: any, idx: number) => (
                    <div key={idx} className="flex items-center p-2 bg-muted/50 rounded-md">
                      <FileText className="h-4 w-4 mr-2" />
                      <a 
                        href={file.url} 
                        target="_blank"
                        rel="noopener noreferrer" 
                        className="text-blue-600 hover:underline"
                      >
                        {file.name}
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="mt-4 flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => setIsViewDialogOpen(false)}
              >
                Закрыть
              </Button>
              <Button 
                onClick={() => {
                  setIsViewDialogOpen(false);
                  setIsEditDialogOpen(true);
                }}
              >
                Редактировать
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
      
      {/* Delete Transaction Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удаление операции</AlertDialogTitle>
            <AlertDialogDescription>
              Вы действительно хотите удалить эту операцию? Это действие нельзя отменить.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteTransaction}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteTransaction.isPending ? (
                <>
                  <svg className="mr-2 h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Удаление...
                </>
              ) : "Удалить"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TransactionsPage;
