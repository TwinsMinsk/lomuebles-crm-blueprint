// Warehouse module TypeScript types

export type MaterialCategory = 
  | 'Древесина'
  | 'Металлы'
  | 'Фурнитура'
  | 'Крепеж'
  | 'Клеи и герметики'
  | 'Лакокрасочные материалы'
  | 'Ткани и обивка'
  | 'Стекло и зеркала'
  | 'Инструменты'
  | 'Расходные материалы'
  | 'Прочие';

export type MaterialUnit = 
  | 'шт'
  | 'м'
  | 'м²'
  | 'м³'
  | 'кг'
  | 'л'
  | 'упак'
  | 'комплект'
  | 'рулон'
  | 'лист';

export type StockMovementType = 
  | 'Поступление'
  | 'Расход'
  | 'Перемещение'
  | 'Инвентаризация'
  | 'Списание'
  | 'Возврат';

export type StockStatus = 
  | 'В наличии'
  | 'Заканчивается'
  | 'Нет в наличии'
  | 'Заказано у поставщика';

export interface Material {
  id: number;
  name: string;
  description?: string;
  category: MaterialCategory;
  unit: MaterialUnit;
  sku?: string;
  barcode?: string;
  min_stock_level: number;
  max_stock_level?: number;
  current_cost?: number;
  average_cost?: number;
  supplier_id?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  creator_user_id: string;
}

export interface StockLevel {
  id: number;
  material_id: number;
  current_quantity: number;
  reserved_quantity: number;
  available_quantity: number; // computed field
  last_movement_date?: string;
  status: StockStatus;
  location?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface StockMovement {
  id: number;
  material_id: number;
  movement_type: StockMovementType;
  quantity: number;
  unit_cost?: number;
  total_cost: number; // computed field
  reference_document?: string;
  notes?: string;
  supplier_id?: number;
  order_id?: number;
  movement_date: string;
  created_by: string;
  created_at: string;
}

export interface SupplierMaterial {
  id: number;
  supplier_id: number;
  material_id: number;
  supplier_sku?: string;
  supplier_price?: number;
  minimum_order_quantity?: number;
  lead_time_days?: number;
  is_preferred: boolean;
  created_at: string;
  updated_at: string;
}

// Extended types with joined data
export interface MaterialWithStock extends Material {
  stock_level?: StockLevel;
  supplier_name?: string;
}

export interface StockMovementWithDetails extends StockMovement {
  material_name?: string;
  material_unit?: MaterialUnit;
  supplier_name?: string;
  order_number?: string;
  created_by_name?: string;
}

export interface StockLevelWithMaterial extends StockLevel {
  material?: Material;
}

// Form types
export interface MaterialFormData {
  name: string;
  description?: string;
  category: MaterialCategory;
  unit: MaterialUnit;
  sku?: string;
  barcode?: string;
  min_stock_level: number;
  max_stock_level?: number;
  current_cost?: number;
  supplier_id?: number;
  is_active?: boolean;
}

export interface StockMovementFormData {
  material_id: number;
  movement_type: StockMovementType;
  quantity: number;
  unit_cost?: number;
  reference_document?: string;
  notes?: string;
  supplier_id?: number;
  order_id?: number;
  movement_date?: string;
  from_location?: string;
  to_location?: string;
}

// Filter types
export interface MaterialFilters {
  search?: string;
  category?: MaterialCategory;
  supplier_id?: number;
  is_active?: boolean;
  low_stock_only?: boolean;
}

export interface StockMovementFilters {
  search?: string;
  movement_type?: StockMovementType;
  material_id?: number;
  supplier_id?: number;
  order_id?: number;
  date_from?: string;
  date_to?: string;
}

// Constants
export const MATERIAL_CATEGORIES: MaterialCategory[] = [
  'Древесина',
  'Металлы',
  'Фурнитура',
  'Крепеж',
  'Клеи и герметики',
  'Лакокрасочные материалы',
  'Ткани и обивка',
  'Стекло и зеркала',
  'Инструменты',
  'Расходные материалы',
  'Прочие'
];

export const MATERIAL_UNITS: MaterialUnit[] = [
  'шт',
  'м',
  'м²',
  'м³',
  'кг',
  'л',
  'упак',
  'комплект',
  'рулон',
  'лист'
];

export const STOCK_MOVEMENT_TYPES: StockMovementType[] = [
  'Поступление',
  'Расход',
  'Перемещение',
  'Инвентаризация',
  'Списание',
  'Возврат'
];

export const STOCK_STATUSES: StockStatus[] = [
  'В наличии',
  'Заканчивается',
  'Нет в наличии',
  'Заказано у поставщика'
];