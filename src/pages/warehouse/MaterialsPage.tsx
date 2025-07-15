import { useState } from "react";
import PageHeader from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ModernCard } from "@/components/ui/modern-card";
import { MaterialsTable } from "@/components/warehouse/MaterialsTable";
import { MaterialFormModal } from "@/components/warehouse/MaterialFormModal";
import { MaterialFilters } from "@/components/warehouse/MaterialFilters";
import { useMaterials } from "@/hooks/warehouse/useMaterials";
import type { MaterialFilters as MaterialFiltersType } from "@/types/warehouse";

const MaterialsPage = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [filters, setFilters] = useState<MaterialFiltersType>({});
  
  const { data: materials, isLoading } = useMaterials(filters);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Материалы"
        subtitle="Управление материалами склада"
        action={
          <Button 
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Добавить материал
          </Button>
        }
      />

      <ModernCard>
        <div className="p-6 space-y-6">
          <MaterialFilters 
            filters={filters} 
            onFiltersChange={setFilters} 
          />
          
          <MaterialsTable 
            materials={materials || []}
            isLoading={isLoading}
          />
        </div>
      </ModernCard>

      <MaterialFormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        mode="create"
      />
    </div>
  );
};

export default MaterialsPage;