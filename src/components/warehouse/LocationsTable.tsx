import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { Edit, Trash2, MapPin } from "lucide-react";
import { LocationFormModal } from "./LocationFormModal";
import { DeleteLocationDialog } from "./DeleteLocationDialog";
import type { Location } from "@/hooks/warehouse/useLocations";

interface LocationsTableProps {
  locations: Location[];
  isLoading: boolean;
  onLocationSelect?: (location: Location) => void;
}

export const LocationsTable = ({ locations, isLoading, onLocationSelect }: LocationsTableProps) => {
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [deletingLocation, setDeletingLocation] = useState<Location | null>(null);

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Наименование</TableHead>
            <TableHead>Адрес</TableHead>
            <TableHead>Описание</TableHead>
            <TableHead>Статус</TableHead>
            <TableHead>Дата создания</TableHead>
            <TableHead>Действия</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {locations.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8">
                Локации не найдены
              </TableCell>
            </TableRow>
          ) : (
            locations.map((location) => (
              <TableRow key={location.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <MapPin className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium">{location.name}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {location.address || "—"}
                </TableCell>
                <TableCell>
                  {location.description || "—"}
                </TableCell>
                <TableCell>
                  <Badge variant={location.is_active ? "default" : "secondary"}>
                    {location.is_active ? "Активна" : "Неактивна"}
                  </Badge>
                </TableCell>
                <TableCell>
                  {new Date(location.created_at).toLocaleDateString('ru-RU')}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {onLocationSelect && (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => onLocationSelect(location)}
                      >
                        Материалы
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingLocation(location)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeletingLocation(location)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {editingLocation && (
        <LocationFormModal
          isOpen={true}
          onClose={() => setEditingLocation(null)}
          mode="edit"
          location={editingLocation}
        />
      )}

      {deletingLocation && (
        <DeleteLocationDialog
          location={deletingLocation}
          isOpen={true}
          onClose={() => setDeletingLocation(null)}
        />
      )}
    </>
  );
};