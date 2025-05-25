
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
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle } from "@/components/ui/modern-card";
import { ResponsiveTable, ResponsiveRow, ResponsiveRowItem } from "@/components/ui/responsive-table";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { ModernEmptyState } from "@/components/ui/modern-empty-state";
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
import { Button } from "@/components/ui/button";
import { FloatingActionButton } from "@/components/ui/floating-action-button";
import { Pencil, Trash2, Plus, TrendingUp, TrendingDown, Folder } from "lucide-react";
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
        <ModernCard>
          <ModernCardContent className="text-center py-12">
            <h1 className="text-2xl font-bold mb-6">Доступ запрещен</h1>
            <p>У вас нет прав для просмотра этой страницы.</p>
          </ModernCardContent>
        </ModernCard>
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

  const getTypeIcon = (type: string) => {
    return type === "income" ? TrendingUp : TrendingDown;
  };

  const getTypeColor = (type: string) => {
    return type === "income" 
      ? "bg-green-100 text-green-800" 
      : "bg-red-100 text-red-800";
  };

  const getTypeLabel = (type: string) => {
    return type === "income" ? "Доход" : "Расход";
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <ModernCard>
          <ModernCardHeader>
            <div className="flex justify-between items-center">
              <div>
                <LoadingSkeleton className="h-8 w-64 mb-2" />
                <LoadingSkeleton className="h-4 w-32" />
              </div>
              <LoadingSkeleton className="h-10 w-40" />
            </div>
          </ModernCardHeader>
        </ModernCard>
        
        <ModernCard>
          <ModernCardContent>
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <LoadingSkeleton key={i} variant="table" />
              ))}
            </div>
          </ModernCardContent>
        </ModernCard>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <ModernCard variant="gradient">
        <ModernCardHeader>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <ModernCardTitle className="flex items-center gap-2">
                <Folder className="h-5 w-5" />
                Категории Доходов и Расходов
              </ModernCardTitle>
              <p className="text-gray-600 mt-1">
                Управление категориями для финансовых операций
              </p>
            </div>
            <div className="hidden lg:block">
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                Добавить категорию
              </Button>
            </div>
          </div>
        </ModernCardHeader>
      </ModernCard>

      <ModernCard>
        <ModernCardHeader>
          <ModernCardTitle>Список категорий</ModernCardTitle>
        </ModernCardHeader>
        <ModernCardContent className="p-0">
          {categories && categories.length > 0 ? (
            <ResponsiveTable>
              {/* Desktop Header */}
              <thead className="hidden lg:table-header-group">
                <tr className="border-b bg-gray-50/50">
                  <th className="text-left p-4 font-medium text-gray-700">Название</th>
                  <th className="text-left p-4 font-medium text-gray-700">Тип</th>
                  <th className="text-left p-4 font-medium text-gray-700">Описание</th>
                  <th className="w-[100px] p-4 text-right">Действия</th>
                </tr>
              </thead>

              <tbody>
                {categories.map((category) => {
                  const TypeIcon = getTypeIcon(category.type);
                  
                  return (
                    <ResponsiveRow key={category.id} className="group">
                      {/* Name */}
                      <ResponsiveRowItem
                        label="Название"
                        value={
                          <div className="font-medium text-gray-900">
                            {category.name}
                          </div>
                        }
                      />

                      {/* Type */}
                      <ResponsiveRowItem
                        label="Тип"
                        value={
                          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(category.type)}`}>
                            <TypeIcon className="h-3 w-3 mr-1" />
                            {getTypeLabel(category.type)}
                          </div>
                        }
                      />

                      {/* Description */}
                      <ResponsiveRowItem
                        label="Описание"
                        value={
                          <span className="text-sm text-gray-600">
                            {category.description || "—"}
                          </span>
                        }
                        fullWidth
                      />

                      {/* Actions */}
                      <ResponsiveRowItem
                        label="Действия"
                        value={
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenDialog(category)}
                              className="h-8 w-8 text-gray-400 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenDeleteDialog(category)}
                              className="h-8 w-8 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        }
                      />
                    </ResponsiveRow>
                  );
                })}
              </tbody>
            </ResponsiveTable>
          ) : (
            <ModernEmptyState
              icon={Folder}
              title="Категории не найдены"
              description="Добавьте первую категорию для организации финансовых операций"
              action={{
                label: "Добавить категорию",
                onClick: () => handleOpenDialog()
              }}
            />
          )}
        </ModernCardContent>
      </ModernCard>

      {/* Mobile FAB */}
      <FloatingActionButton
        onClick={() => handleOpenDialog()}
        icon={<Plus className="h-6 w-6" />}
        label="Добавить категорию"
      />

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
