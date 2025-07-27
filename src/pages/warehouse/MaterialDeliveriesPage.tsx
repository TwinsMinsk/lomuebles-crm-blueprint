import { useState } from "react";
import PageHeader from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ModernCard } from "@/components/ui/modern-card";
import { MaterialDeliveriesTable } from "@/components/warehouse/MaterialDeliveriesTable";
import { MaterialDeliveryFormModal } from "@/components/warehouse/MaterialDeliveryFormModal";
import { MaterialDeliveryFilters } from "@/components/warehouse/MaterialDeliveryFilters";
import { useMaterialDeliveries } from "@/hooks/warehouse/useMaterialDeliveries";
import type { MaterialDeliveryFilters as MaterialDeliveryFiltersType } from "@/types/warehouse";

const MaterialDeliveriesPage = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [filters, setFilters] = useState<MaterialDeliveryFiltersType>({});
  
  const { data: deliveries, isLoading } = useMaterialDeliveries(filters);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Поставки материалов"
        subtitle="Отслеживание заказов и поставок материалов от поставщиков"
        action={
          <Button 
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Добавить поставку
          </Button>
        }
      />

      <ModernCard>
        <div className="p-6 space-y-6">
          <MaterialDeliveryFilters 
            filters={filters} 
            onFiltersChange={setFilters} 
          />
          
          <MaterialDeliveriesTable 
            deliveries={deliveries || []}
            isLoading={isLoading}
          />
        </div>
      </ModernCard>

      <MaterialDeliveryFormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        mode="create"
      />
    </div>
  );
};

export default MaterialDeliveriesPage;