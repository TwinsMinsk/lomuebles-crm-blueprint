
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface EntityOption {
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
}

export const useRelatedEntitiesData = (): RelatedEntitiesData => {
  const [contacts, setContacts] = useState<EntityOption[]>([]);
  const [companies, setCompanies] = useState<EntityOption[]>([]);
  const [leads, setLeads] = useState<EntityOption[]>([]);
  const [managers, setManagers] = useState<EntityOption[]>([]);
  const [partners, setPartners] = useState<EntityOption[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchRelatedData = async () => {
      setIsLoading(true);
      try {
        // Fetch contacts
        const { data: contactsData, error: contactsError } = await supabase
          .from("contacts")
          .select("contact_id, full_name")
          .order("full_name");
        
        if (contactsError) throw contactsError;
        setContacts(contactsData?.map(contact => ({
          id: contact.contact_id,
          name: contact.full_name || `Клиент #${contact.contact_id}`
        })) || []);
        
        // Fetch companies
        const { data: companiesData, error: companiesError } = await supabase
          .from("companies")
          .select("company_id, company_name")
          .order("company_name");
        
        if (companiesError) throw companiesError;
        setCompanies(companiesData?.map(company => ({
          id: company.company_id,
          name: company.company_name || `Компания #${company.company_id}`
        })) || []);
        
        // Fetch leads
        const { data: leadsData, error: leadsError } = await supabase
          .from("leads")
          .select("lead_id, name")
          .order("name");
        
        if (leadsError) throw leadsError;
        setLeads(leadsData?.map(lead => ({
          id: lead.lead_id,
          name: lead.name || `Лид #${lead.lead_id}`
        })) || []);
        
        // Fetch managers
        const { data: managersData, error: managersError } = await supabase
          .from("profiles")
          .select("id, full_name")
          .order("full_name");
        
        if (managersError) throw managersError;
        setManagers(managersData?.map(manager => ({
          id: manager.id,
          name: manager.full_name || manager.id || `Менеджер #${manager.id}`
        })) || []);
        
        // Fetch partners/manufacturers
        const { data: partnersData, error: partnersError } = await supabase
          .from("partners_manufacturers")
          .select("partner_manufacturer_id, company_name")
          .order("company_name");
        
        if (partnersError) throw partnersError;
        setPartners(partnersData?.map(partner => ({
          id: partner.partner_manufacturer_id,
          name: partner.company_name || `Партнер #${partner.partner_manufacturer_id}`
        })) || []);
        
      } catch (error) {
        console.error("Error fetching related data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchRelatedData();
  }, []);

  return {
    contacts,
    companies,
    leads,
    managers,
    partners,
    isLoading
  };
};
