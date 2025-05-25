
import React from "react";
import { format } from "date-fns";
import { ResponsiveTable, ResponsiveRow, ResponsiveRowItem } from "@/components/ui/responsive-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Edit, Trash2 } from "lucide-react";
import { TransactionWithRelations } from "@/hooks/finance/useTransactions";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { ModernEmptyState } from "@/components/ui/modern-empty-state";
import { TableHeader, TableHead, TableBody } from "@/components/ui/table";

interface ModernTransactionsTableProps {
  transactions: TransactionWithRelations[];
  loading: boolean;
  onView?: (transaction: TransactionWithRelations) => void;
  onEdit?: (transaction: TransactionWithRelations) => void;
  onDelete?: (transaction: TransactionWithRelations) => void;
}

const ModernTransactionsTable: React.FC<ModernTransactionsTableProps> = ({
  transactions,
  loading,
  onView,
  onEdit,
  onDelete
}) => {
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

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <LoadingSkeleton key={i} className="h-20" />
        ))}
      </div>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <ModernEmptyState
        title="Операции не найдены"
        description="Нет операций, соответствующих выбранным фильтрам"
        action={{
          label: "Добавить операцию",
          onClick: () => {}
        }}
      />
    );
  }

  return (
    <ResponsiveTable>
      {/* Desktop Table Header */}
      <TableHeader className="hidden lg:table-header-group">
        <tr className="bg-gradient-to-r from-green-600 to-green-500 text-white">
          <TableHead className="text-white font-semibold">Дата</TableHead>
          <TableHead className="text-white font-semibold">Тип</TableHead>
          <TableHead className="text-white font-semibold">Категория</TableHead>
          <TableHead className="text-white font-semibold">Описание</TableHead>
          <TableHead className="text-white font-semibold">Связанный объект</TableHead>
          <TableHead className="text-white font-semibold text-right">Сумма</TableHead>
          <TableHead className="text-white font-semibold">Действия</TableHead>
        </tr>
      </TableHeader>

      <TableBody className="hidden lg:table-row-group">
        {transactions.map((transaction) => (
          <ResponsiveRow key={transaction.id} onClick={() => onView?.(transaction)}>
            <ResponsiveRowItem label="Дата" value={formatDate(transaction.transaction_date)} />
            <ResponsiveRowItem 
              label="Тип" 
              value={
                <Badge 
                  variant={transaction.type === 'income' ? 'default' : 'destructive'}
                  className={transaction.type === 'income' ? 'bg-green-100 text-green-800 hover:bg-green-200' : ''}
                >
                  {transaction.type === 'income' ? 'Доход' : 'Расход'}
                </Badge>
              } 
            />
            <ResponsiveRowItem label="Категория" value={transaction.category?.name || '—'} />
            <ResponsiveRowItem 
              label="Описание" 
              value={
                <div className="max-w-xs truncate" title={transaction.description || ''}>
                  {transaction.description || '—'}
                </div>
              } 
            />
            <ResponsiveRowItem label="Связанный объект" value={getRelatedEntityName(transaction)} />
            <ResponsiveRowItem 
              label="Сумма" 
              value={
                <span className={`font-medium ${
                  transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatAmount(transaction.amount, transaction.currency)}
                </span>
              } 
            />
            <ResponsiveRowItem 
              label="Действия" 
              value={
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      onView?.(transaction);
                    }}
                    className="h-8 w-8"
                  >
                    <FileText className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit?.(transaction);
                    }}
                    className="h-8 w-8"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete?.(transaction);
                    }}
                    className="h-8 w-8"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              } 
            />
          </ResponsiveRow>
        ))}
      </TableBody>

      {/* Mobile Cards */}
      <div className="lg:hidden space-y-3">
        {transactions.map((transaction) => (
          <ResponsiveRow key={transaction.id} onClick={() => onView?.(transaction)}>
            <ResponsiveRowItem label="Дата" value={formatDate(transaction.transaction_date)} />
            <ResponsiveRowItem 
              label="Тип" 
              value={
                <Badge 
                  variant={transaction.type === 'income' ? 'default' : 'destructive'}
                  className={transaction.type === 'income' ? 'bg-green-100 text-green-800 hover:bg-green-200' : ''}
                >
                  {transaction.type === 'income' ? 'Доход' : 'Расход'}
                </Badge>
              } 
            />
            <ResponsiveRowItem label="Категория" value={transaction.category?.name || '—'} />
            <ResponsiveRowItem 
              label="Описание" 
              value={transaction.description || '—'}
              fullWidth
            />
            <ResponsiveRowItem label="Связанный объект" value={getRelatedEntityName(transaction)} />
            <ResponsiveRowItem 
              label="Сумма" 
              value={
                <span className={`font-medium ${
                  transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatAmount(transaction.amount, transaction.currency)}
                </span>
              } 
            />
            <ResponsiveRowItem 
              label="Действия" 
              value={
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      onView?.(transaction);
                    }}
                    className="h-8 w-8"
                  >
                    <FileText className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit?.(transaction);
                    }}
                    className="h-8 w-8"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete?.(transaction);
                    }}
                    className="h-8 w-8"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              } 
            />
          </ResponsiveRow>
        ))}
      </div>
    </ResponsiveTable>
  );
};

export default ModernTransactionsTable;
