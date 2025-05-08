
export interface Product {
  product_id: number;
  internal_product_name: string;
  internal_sku: string | null;
  description: string | null;
  base_price: number | null;
  category: string | null;
  is_custom_template: boolean;
  template_image: string | null;
  notes: string | null;
  creation_date: string;
  creator_user_id: string | null;
}

export interface ProductFilters {
  search: string;
  category: string | null;
  isCustomTemplate: string | null;
}
