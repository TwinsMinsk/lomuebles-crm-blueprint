import { StockStatus, MaterialCategory, MaterialUnit, StockMovementType } from '@/types/warehouse';

// Utility functions for warehouse management

export const getStockStatusColor = (status: StockStatus): string => {
  switch (status) {
    case 'В наличии':
      return 'text-success bg-success/10';
    case 'Заканчивается':
      return 'text-warning bg-warning/10';
    case 'Нет в наличии':
      return 'text-destructive bg-destructive/10';
    case 'Заказано у поставщика':
      return 'text-info bg-info/10';
    default:
      return 'text-muted-foreground bg-muted/10';
  }
};

export const getStockStatusIcon = (status: StockStatus): string => {
  switch (status) {
    case 'В наличии':
      return '✓';
    case 'Заканчивается':
      return '⚠';
    case 'Нет в наличии':
      return '✗';
    case 'Заказано у поставщика':
      return '📦';
    default:
      return '?';
  }
};

export const getMovementTypeColor = (type: StockMovementType): string => {
  switch (type) {
    case 'Поступление':
    case 'Возврат':
      return 'text-success bg-success/10';
    case 'Расход':
    case 'Списание':
      return 'text-destructive bg-destructive/10';
    case 'Перемещение':
      return 'text-info bg-info/10';
    case 'Инвентаризация':
      return 'text-warning bg-warning/10';
    default:
      return 'text-muted-foreground bg-muted/10';
  }
};

export const getMovementTypeIcon = (type: StockMovementType): string => {
  switch (type) {
    case 'Поступление':
      return '📥';
    case 'Расход':
      return '📤';
    case 'Перемещение':
      return '↔️';
    case 'Инвентаризация':
      return '📋';
    case 'Списание':
      return '🗑️';
    case 'Возврат':
      return '↩️';
    default:
      return '📦';
  }
};

export const getCategoryIcon = (category: MaterialCategory): string => {
  switch (category) {
    case 'Древесина':
      return '🌳';
    case 'Металлы':
      return '⚙️';
    case 'Фурнитура':
      return '🔧';
    case 'Крепеж':
      return '🔩';
    case 'Клеи и герметики':
      return '🧴';
    case 'Лакокрасочные материалы':
      return '🎨';
    case 'Ткани и обивка':
      return '🧵';
    case 'Стекло и зеркала':
      return '🪟';
    case 'Инструменты':
      return '🔨';
    case 'Расходные материалы':
      return '📦';
    case 'Прочие':
      return '📋';
    default:
      return '📦';
  }
};

export const formatQuantity = (quantity: number, unit: MaterialUnit): string => {
  const formattedNumber = quantity % 1 === 0 ? quantity.toString() : quantity.toFixed(2);
  return `${formattedNumber} ${unit}`;
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2
  }).format(amount);
};

export const calculateStockValue = (quantity: number, unitCost: number): number => {
  return quantity * unitCost;
};

export const isLowStock = (currentQuantity: number, minStockLevel: number): boolean => {
  return currentQuantity <= minStockLevel;
};

export const isOutOfStock = (currentQuantity: number): boolean => {
  return currentQuantity <= 0;
};

export const getStockStatusFromQuantity = (
  currentQuantity: number, 
  minStockLevel: number
): StockStatus => {
  if (currentQuantity <= 0) {
    return 'Нет в наличии';
  } else if (currentQuantity <= minStockLevel) {
    return 'Заканчивается';
  } else {
    return 'В наличии';
  }
};

export const generateSKU = (category: MaterialCategory, name: string): string => {
  const categoryCode = category.substring(0, 3).toUpperCase();
  const nameCode = name.substring(0, 3).toUpperCase().replace(/[^A-Z0-9]/g, '');
  const timestamp = Date.now().toString().slice(-4);
  
  return `${categoryCode}-${nameCode}-${timestamp}`;
};

export const validateMinMaxStock = (minStock: number, maxStock?: number): boolean => {
  if (!maxStock) return true;
  return minStock <= maxStock;
};

export const sortMaterialsByStockStatus = (materials: any[]): any[] => {
  const statusPriority: Record<StockStatus, number> = {
    'Нет в наличии': 1,
    'Заканчивается': 2,
    'Заказано у поставщика': 3,
    'В наличии': 4
  };

  return materials.sort((a, b) => {
    const aStatus = a.stock_level?.status || 'В наличии';
    const bStatus = b.stock_level?.status || 'В наличии';
    
    return statusPriority[aStatus] - statusPriority[bStatus];
  });
};