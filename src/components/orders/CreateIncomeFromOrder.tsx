
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useTransactionCategories } from "@/hooks/finance/useTransactionCategories";
import { useAddTransaction, TransactionFormData } from "@/hooks/finance/useTransactions";
import TransactionForm from "@/components/finance/TransactionForm";
import { format } from "date-fns";
import { toast } from "sonner";

interface CreateIncomeFromOrderProps {
  order: {
    id: number;
    order_number: string;
    client_contact_id: number;
    order_type: string;
    final_amount?: number | null;
    closing_date?: string | null;
  };
}

const CreateIncomeFromOrder: React.FC<CreateIncomeFromOrderProps> = ({ order }) => {
  const { userRole } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [defaultCategoryId, setDefaultCategoryId] = useState<number | null>(null);
  
  const { data: categories, isLoading: categoriesLoading } = useTransactionCategories();
  const addTransaction = useAddTransaction();
  
  // Check if user has admin rights
  const isAdmin = userRole === 'Главный Администратор' || userRole === 'Администратор';
  
  // Find appropriate income category based on order type
  useEffect(() => {
    if (categories && categories.length > 0) {
      // Filter for income categories
      const incomeCategories = categories.filter(cat => cat.type === 'income');
      
      if (incomeCategories.length > 0) {
        // Try to find a matching category by name for the order type
        const orderTypeKeywords = order.order_type.toLowerCase().split(' ');
        
        let matchedCategory = null;
        for (const category of incomeCategories) {
          const categoryName = category.name.toLowerCase();
          if (orderTypeKeywords.some(keyword => categoryName.includes(keyword))) {
            matchedCategory = category;
            break;
          }
        }
        
        // Use matched category or just the first income category
        if (matchedCategory) {
          setDefaultCategoryId(matchedCategory.id);
        } else if (incomeCategories.length > 0) {
          setDefaultCategoryId(incomeCategories[0].id);
        }
      }
    }
  }, [categories, order.order_type]);
  
  // Check if button should be enabled
  const isButtonEnabled = isAdmin && order.final_amount && order.final_amount > 0;
  
  // Handle dialog open
  const handleOpenDialog = () => {
    setIsDialogOpen(true);
  };
  
  // Handle form submit
  const handleSubmit = async (data: TransactionFormData) => {
    try {
      await addTransaction.mutateAsync(data);
      toast.success("Доходная операция успешно создана");
      setIsDialogOpen(false);
    } catch (error) {
      toast.error("Ошибка при создании доходной операции");
      console.error("Error creating income transaction:", error);
    }
  };
  
  // Initial transaction data
  const initialTransactionData: Partial<TransactionFormValues> = {
    transaction_date: order.closing_date ? new Date(order.closing_date) : new Date(),
    type: "income" as const,
    category_id: defaultCategoryId,
    amount: order.final_amount || 0,
    currency: "EUR",
    related_order_id: order.id,
    related_contact_id: order.client_contact_id,
    description: `Доход по заказу № ${order.order_number}`
  };
  
  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={handleOpenDialog}
        disabled={!isButtonEnabled}
        title={!isButtonEnabled ? "Необходимы права администратора и указанная сумма заказа" : ""}
      >
        <Plus className="h-4 w-4 mr-2" />
        Создать доходную операцию
      </Button>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Создание доходной операции по заказу #{order.order_number}
            </DialogTitle>
          </DialogHeader>
          <TransactionForm
            initialData={initialTransactionData}
            onSuccess={handleSubmit}
            onCancel={() => setIsDialogOpen(false)}
            isSubmitting={addTransaction.isPending}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CreateIncomeFromOrder;
