
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface OrderStatusBadgeProps {
  orderType: 'Готовая мебель (Tilda)' | 'Мебель на заказ';
  status: string | null | undefined;
}

const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({ orderType, status }) => {
  if (!status) return null;
  
  let variant: "default" | "outline" | "destructive" | "secondary" | null = null;
  
  // For ready-made furniture
  if (orderType === 'Готовая мебель (Tilda)') {
    switch (status) {
      case 'Новый':
        variant = 'default';
        break;
      case 'В обработке':
        variant = 'secondary';
        break;
      case 'Готов к отправке':
        variant = 'outline';
        break;
      case 'Доставляется':
        variant = 'secondary';
        break;
      case 'Доставлен':
        variant = 'default';
        break;
      case 'Отменен':
        variant = 'destructive';
        break;
      default:
        variant = 'outline';
    }
  } 
  // For custom-made furniture
  else {
    switch (status) {
      case 'Новый':
        variant = 'default';
        break;
      case 'Замер назначен':
        variant = 'secondary';
        break;
      case 'Замер выполнен':
        variant = 'outline';
        break;
      case 'Заказ согласован':
        variant = 'secondary';
        break;
      case 'В производстве':
        variant = 'outline';
        break;
      case 'Готов к установке':
        variant = 'secondary';
        break;
      case 'Установлен':
        variant = 'default';
        break;
      case 'Отменен':
        variant = 'destructive';
        break;
      default:
        variant = 'outline';
    }
  }

  return <Badge variant={variant}>{status}</Badge>;
};

export default OrderStatusBadge;
