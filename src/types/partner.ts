
export interface Partner {
  partner_manufacturer_id: number;
  company_name: string;
  contact_person: string | null;
  phone: string | null;
  email: string | null;
  specialization: string | null;
  terms: string | null;
  requisites: string | null;
  notes: string | null;
  creation_date: string;
  creator_user_id: string | null;
}

export interface PartnerFilters {
  search: string;
  specialization: string | null;
}
