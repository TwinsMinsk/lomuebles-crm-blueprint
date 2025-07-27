import { useState } from "react";
import PageHeader from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ModernCard } from "@/components/ui/modern-card";
import { LocationsTable } from "@/components/warehouse/LocationsTable";
import { LocationFormModal } from "@/components/warehouse/LocationFormModal";
import { LocationFilters } from "@/components/warehouse/LocationFilters";
import { LocationMaterialsTable } from "@/components/warehouse/LocationMaterialsTable";
import { useLocations } from "@/hooks/warehouse/useLocations";
import type { LocationFilters as LocationFiltersType, Location } from "@/hooks/warehouse/useLocations";

const LocationsPage = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [filters, setFilters] = useState<LocationFiltersType>({});
  
  const { data: locations, isLoading } = useLocations(filters);

  const handleLocationSelect = (location: Location) => {
    setSelectedLocation(location);
  };

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

      <div className="space-y-6">
        <ModernCard>
          <div className="p-6 space-y-6">
            <LocationFilters 
              filters={filters} 
              onFiltersChange={setFilters} 
            />
            
            <LocationsTable 
              locations={locations || []}
              isLoading={isLoading}
              onLocationSelect={handleLocationSelect}
            />
          </div>
        </ModernCard>

        {selectedLocation && (
          <ModernCard>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Материалы в локации: {selectedLocation.name}</h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedLocation(null)}
                >
                  Закрыть
                </Button>
              </div>
              
              {selectedLocation.description && (
                <p className="text-sm text-muted-foreground">{selectedLocation.description}</p>
              )}
              
              <LocationMaterialsTable locationName={selectedLocation.name} />
            </div>
          </ModernCard>
        )}
      </div>

      <LocationFormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        mode="create"
      />
    </div>
  );
};

export default LocationsPage;