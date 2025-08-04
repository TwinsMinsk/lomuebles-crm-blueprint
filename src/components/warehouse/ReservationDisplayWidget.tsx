import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, CheckCircle, Info } from "lucide-react";

interface MaterialReservation {
  id: number;
  material_id: number;
  order_id: number;
  quantity_reserved: number;
  used_quantity: number;
  location?: string;
  materials?: {
    name: string;
    unit: string;
  };
}

interface ReservationDisplayWidgetProps {
  orderId?: number;
  materialId?: number;
  plannedQuantity?: number;
  movementType?: string;
}

export const ReservationDisplayWidget = ({ 
  orderId, 
  materialId, 
  plannedQuantity = 0,
  movementType 
}: ReservationDisplayWidgetProps) => {
  console.log('🎯 ReservationDisplayWidget rendered with props:', {
    orderId,
    materialId,
    plannedQuantity,
    movementType
  });
  const { data: reservations, isLoading } = useQuery({
    queryKey: ['material-reservations', orderId, materialId],
    queryFn: async () => {
      if (!orderId || !materialId) return [];
      
      const { data, error } = await supabase
        .from('material_reservations')
        .select(`
          *,
          materials (name, unit)
        `)
        .eq('order_id', orderId)
        .eq('material_id', materialId);

      if (error) throw error;
      return data as MaterialReservation[];
    },
    enabled: !!(orderId && materialId),
  });

  console.log('🎯 ReservationDisplayWidget query status:', {
    isLoading,
    orderId,
    materialId,
    enabled: !!(orderId && materialId),
    reservations,
    reservationsLength: reservations?.length
  });

  if (isLoading || !orderId || !materialId) {
    console.log('🎯 ReservationDisplayWidget returning null - loading or missing IDs');
    return null;
  }

  if (!reservations || reservations.length === 0) {
    console.log('🎯 ReservationDisplayWidget returning null - no reservations found');
    // Показываем виджет даже если нет резервов, для отладки
    return (
      <Card className="bg-gray-50 border border-gray-200">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Info className="h-4 w-4 text-blue-600" />
            Информация о резерве
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Для данной комбинации материала и заказа резервы не найдены.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const totalReserved = reservations.reduce((sum, res) => sum + res.quantity_reserved, 0);
  const totalUsed = reservations.reduce((sum, res) => sum + res.used_quantity, 0);
  const availableToUse = totalReserved - totalUsed;

  // Calculate warning status for consumption movements
  const isConsumptionMovement = movementType === 'Расход' || movementType === 'Списание';
  const exceedsPlanned = isConsumptionMovement && plannedQuantity > availableToUse;
  const warningType = exceedsPlanned ? 'warning' : availableToUse > 0 ? 'info' : 'success';

  const getIconAndColor = () => {
    switch (warningType) {
      case 'warning':
        return { icon: AlertTriangle, color: 'text-orange-600', bgColor: 'bg-orange-50 border-orange-200' };
      case 'info':
        return { icon: Info, color: 'text-blue-600', bgColor: 'bg-blue-50 border-blue-200' };
      default:
        return { icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-50 border-green-200' };
    }
  };

  const { icon: Icon, color, bgColor } = getIconAndColor();

  return (
    <Card className={`${bgColor} border`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Icon className={`h-4 w-4 ${color}`} />
          Информация о резерве
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Зарезервировано:</span>
            <Badge variant="secondary">
              {totalReserved} {reservations[0]?.materials?.unit}
            </Badge>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Уже использовано:</span>
            <Badge variant="outline">
              {totalUsed} {reservations[0]?.materials?.unit}
            </Badge>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Доступно к использованию:</span>
            <Badge variant={availableToUse > 0 ? "default" : "secondary"}>
              {availableToUse} {reservations[0]?.materials?.unit}
            </Badge>
          </div>
          
          {exceedsPlanned && (
            <Alert className="mt-3">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Указанное количество ({plannedQuantity}) превышает доступный резерв ({availableToUse}). 
                Это может указывать на перерасход материалов.
              </AlertDescription>
            </Alert>
          )}
          
          {isConsumptionMovement && availableToUse > 0 && !exceedsPlanned && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Движение будет учтено в использовании резерва для данного заказа.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  );
};