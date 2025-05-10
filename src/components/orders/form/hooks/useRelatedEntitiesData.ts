
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface EntityOption {
  id: number | string;
  name: string;
}

export interface RelatedEntitiesData {
  contacts: EntityOption[];
  companies: EntityOption[];
  leads: EntityOption[];
  managers: EntityOption[];
  partners: EntityOption[];
  isLoading: boolean;
  error: string | null;
}

export const useRelatedEntitiesData = (): RelatedEntitiesData => {
  // Initialize all data states with empty arrays to avoid undefined
  const [contacts, setContacts] = useState<EntityOption[]>([]);
  const [companies, setCompanies] = useState<EntityOption[]>([]);
  const [leads, setLeads] = useState<EntityOption[]>([]);
  const [managers, setManagers] = useState<EntityOption[]>([]);
  const [partners, setPartners] = useState<EntityOption[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRelatedData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        console.log("Fetching related entities data...");
        
        // Fetch all data in parallel with strongly-typed functions
        const [contactsData, companiesData, leadsData, managersData, partnersData] = await Promise.all([
          fetchContacts(),
          fetchCompanies(),
          fetchLeads(),
          fetchManagers(),
          fetchPartners()
        ]);
        
        // Update state with fetched data
        setContacts(contactsData);
        setCompanies(companiesData);
        setLeads(leadsData);
        setManagers(managersData);
        setPartners(partnersData);
        
      } catch (error: any) {
        console.error("Error in fetchRelatedData:", error);
        setError(error.message || "Ошибка при загрузке связанных данных");
        toast.error("Ошибка загрузки данных", {
          description: "Не удалось загрузить связанные сущности"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchRelatedData();
  }, []);

  // Typed function to fetch contacts
  const fetchContacts = async (): Promise<EntityOption[]> => {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('contact_id, full_name')
        .order('full_name');
      
      if (error) throw error;
      
      return Array.isArray(data) ? data.map(item => ({
        id: item.contact_id,
        name: item.full_name || `#${item.contact_id}`
      })) : [];
    } catch (err) {
      console.error("Error fetching contacts:", err);
      return [];
    }
  };

  // Typed function to fetch companies
  const fetchCompanies = async (): Promise<EntityOption[]> => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('company_id, company_name')
        .order('company_name');
      
      if (error) throw error;
      
      return Array.isArray(data) ? data.map(item => ({
        id: item.company_id,
        name: item.company_name || `#${item.company_id}`
      })) : [];
    } catch (err) {
      console.error("Error fetching companies:", err);
      return [];
    }
  };

  // Typed function to fetch leads
  const fetchLeads = async (): Promise<EntityOption[]> => {
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('lead_id, name')
        .order('name');
      
      if (error) throw error;
      
      return Array.isArray(data) ? data.map(item => ({
        id: item.lead_id,
        name: item.name || `#${item.lead_id}`
      })) : [];
    } catch (err) {
      console.error("Error fetching leads:", err);
      return [];
    }
  };

  // Typed function to fetch managers
  const fetchManagers = async (): Promise<EntityOption[]> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name')
        .order('full_name');
      
      if (error) throw error;
      
      return Array.isArray(data) ? data.map(item => ({
        id: item.id,
        name: item.full_name || `#${item.id}`
      })) : [];
    } catch (err) {
      console.error("Error fetching managers:", err);
      return [];
    }
  };

  // Typed function to fetch partners
  const fetchPartners = async (): Promise<EntityOption[]> => {
    try {
      const { data, error } = await supabase
        .from('partners_manufacturers')
        .select('partner_manufacturer_id, company_name')
        .order('company_name');
      
      if (error) throw error;
      
      return Array.isArray(data) ? data.map(item => ({
        id: item.partner_manufacturer_id,
        name: item.company_name || `#${item.partner_manufacturer_id}`
      })) : [];
    } catch (err) {
      console.error("Error fetching partners:", err);
      return [];
    }
  };

  // Always return arrays for all entity types, even if there was an error
  return {
    contacts,
    companies,
    leads,
    managers,
    partners,
    isLoading,
    error
  };
};
