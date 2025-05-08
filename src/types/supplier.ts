
export interface Supplier {
  supplier_id: number;
  supplier_name: string;
  contact_person: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  product_categories: string | null;
  terms: string | null;
  creation_date: string;
  creator_user_id: string | null;
}

export interface SupplierFilters {
  search: string;
  category: string | null;
}
