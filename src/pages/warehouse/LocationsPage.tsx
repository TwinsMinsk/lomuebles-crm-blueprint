import { useState } from "react";
import PageHeader from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ModernCard } from "@/components/ui/modern-card";
import { LocationsTable } from "@/components/warehouse/LocationsTable";
import { LocationFormModal } from "@/components/warehouse/LocationFormModal";
import { LocationFilters } from "@/components/warehouse/LocationFilters";
import { useLocations } from "@/hooks/warehouse/useLocations";
import type { LocationFilters as LocationFiltersType } from "@/hooks/warehouse/useLocations";

const LocationsPage = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [filters, setFilters] = useState<LocationFiltersType>({});
  
  const { data: locations, isLoading } = useLocations(filters);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Локации"
        subtitle="Управление складскими локациями"
        action={
          <Button 
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Добавить локацию
          </Button>
        }
      />

      <ModernCard>
        <div className="p-6 space-y-6">
          <LocationFilters 
            filters={filters} 
            onFiltersChange={setFilters} 
          />
          
          <LocationsTable 
            locations={locations || []}
            isLoading={isLoading}
          />
        </div>
      </ModernCard>

      <LocationFormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        mode="create"
      />
    </div>
  );
};

export default LocationsPage;