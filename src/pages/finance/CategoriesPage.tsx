
import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  useTransactionCategories,
  useAddTransactionCategory,
  useUpdateTransactionCategory,
  useDeleteTransactionCategory,
  TransactionCategory,
  TransactionCategoryFormData,
} from "@/hooks/finance/useTransactionCategories";
import CategoryForm from "@/components/finance/CategoryForm";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Plus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

const CategoriesPage: React.FC = () => {
  const { userRole } = useAuth();
  const { data: categories, isLoading, error } = useTransactionCategories();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<TransactionCategory | undefined>(undefined);
  const [categoryToDelete, setCategoryToDelete] = useState<TransactionCategory | null>(null);

  const addCategory = useAddTransactionCategory();
  const updateCategory = useUpdateTransactionCategory();
  const deleteCategory = useDeleteTransactionCategory();

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
    toast.error("Не удалось загрузить категории. Пожалуйста, попробуйте позже.");
  }

  const handleOpenDialog = (category?: TransactionCategory) => {
    setCurrentCategory(category);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (data: TransactionCategoryFormData) => {
    try {
      if (currentCategory) {
        await updateCategory.mutateAsync({
          id: currentCategory.id,
          categoryData: data,
        });
      } else {
        await addCategory.mutateAsync(data);
      }
      setIsDialogOpen(false);
      setCurrentCategory(undefined);
    } catch (error) {
      console.error("Error submitting category:", error);
    }
  };

  const handleOpenDeleteDialog = (category: TransactionCategory) => {
    setCategoryToDelete(category);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;
    
    try {
      await deleteCategory.mutateAsync(categoryToDelete.id);
      setIsDeleteDialogOpen(false);
      setCategoryToDelete(null);
    } catch (error) {
      console.error("Error deleting category:", error);
    }
  };

  const getTypeLabel = (type: string) => {
    return type === "income" ? "Доход" : "Расход";
  };

  // Render loading state
  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Категории Доходов и Расходов</h1>
          <Skeleton className="h-10 w-40" />
        </div>
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
        <h1 className="text-2xl font-bold">Категории Доходов и Расходов</h1>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Добавить категорию
        </Button>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Название</TableHead>
              <TableHead>Тип</TableHead>
              <TableHead>Описание</TableHead>
              <TableHead className="text-right">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories && categories.length > 0 ? (
              categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell>{getTypeLabel(category.type)}</TableCell>
                  <TableCell>{category.description || "-"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenDialog(category)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenDeleteDialog(category)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-4">
                  Категории не найдены. Добавьте первую категорию.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {currentCategory ? "Редактировать категорию" : "Добавить категорию"}
            </DialogTitle>
          </DialogHeader>
          <CategoryForm
            onSubmit={handleSubmit}
            initialData={currentCategory}
            onCancel={() => setIsDialogOpen(false)}
            isSubmitting={addCategory.isPending || updateCategory.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Подтверждение удаления</AlertDialogTitle>
            <AlertDialogDescription>
              Вы действительно хотите удалить категорию "{categoryToDelete?.name}"?
              <br />
              Это действие нельзя отменить.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCategory}
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

export default CategoriesPage;
