
export interface Partner {
  partner_manufacturer_id: number;
  company_name: string;
  contact_person: string | null;
  email: string | null;
  phone: string | null;
  specialization: string | null;
  terms: string | null;
  notes: string | null;
  requisites: string | null;
  creation_date: string;
  creator_user_id: string | null;
  attached_files_partner_docs: any[] | null;
  website: string | null;
}

export interface PartnerFilters {
  search: string;
  specialization: string | null;
}
