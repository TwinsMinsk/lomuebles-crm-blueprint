import { useState } from "react";
import PageHeader from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ModernCard } from "@/components/ui/modern-card";
import { StockMovementsTable } from "@/components/warehouse/StockMovementsTable";
import { StockMovementFormModal } from "@/components/warehouse/StockMovementFormModal";
import { StockMovementFilters } from "@/components/warehouse/StockMovementFilters";
import { useStockMovements } from "@/hooks/warehouse/useStockMovements";
import type { StockMovementFilters as StockMovementFiltersType } from "@/types/warehouse";

const StockMovementsPage = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [filters, setFilters] = useState<StockMovementFiltersType>({});
  
  const { data: movements, isLoading } = useStockMovements(filters);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Движения материалов"
        subtitle="Учет поступлений и расходов материалов"
        action={
          <Button 
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Добавить движение
          </Button>
        }
      />

      <ModernCard>
        <div className="p-6 space-y-6">
          <StockMovementFilters 
            filters={filters} 
            onFiltersChange={setFilters} 
          />
          
          <StockMovementsTable 
            movements={movements || []}
            isLoading={isLoading}
          />
        </div>
      </ModernCard>

      <StockMovementFormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        mode="create"
      />
    </div>
  );
};

export default StockMovementsPage;