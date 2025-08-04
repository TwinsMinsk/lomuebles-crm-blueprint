import { useState } from "react";
import PageHeader from "@/components/common/PageHeader";
import { ModernCard } from "@/components/ui/modern-card";
import { StockLevelsTable } from "@/components/warehouse/StockLevelsTable";
import { StockLevelFilters } from "@/components/warehouse/StockLevelFilters";
import { useStockLevels } from "@/hooks/warehouse/useStockLevels";
import type { MaterialFilters } from "@/types/warehouse";

const StockLevelsPage = () => {
  const [filters, setFilters] = useState<MaterialFilters>({});
  
  const { data: stockLevels, isLoading } = useStockLevels(filters);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Остатки на складе"
        subtitle="Текущие остатки материалов на складе"
      />

      <ModernCard>
        <div className="p-6 space-y-6">
          <StockLevelFilters 
            filters={filters} 
            onFiltersChange={setFilters} 
          />
          
          <StockLevelsTable 
            stockLevels={stockLevels || []}
            isLoading={isLoading}
          />
        </div>
      </ModernCard>
    </div>
  );
};

export default StockLevelsPage;