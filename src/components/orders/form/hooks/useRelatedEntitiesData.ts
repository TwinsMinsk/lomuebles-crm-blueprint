
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
        
        // Fetch contacts with better error handling
        try {
          const { data: contactsData, error: contactsError } = await supabase
            .from("contacts")
            .select("contact_id, full_name")
            .order("full_name");
          
          if (contactsError) {
            console.error("Error fetching contacts:", contactsError);
            throw new Error(`Ошибка загрузки контактов: ${contactsError.message}`);
          } else {
            console.log("Contacts fetched successfully:", contactsData?.length || 0);
            setContacts((contactsData || []).map(contact => ({
              id: contact.contact_id,
              name: contact.full_name || `Клиент #${contact.contact_id}`
            })));
          }
        } catch (contactErr) {
          console.error("Failed to fetch contacts:", contactErr);
          // We don't set global error here to allow other entities to load
        }
        
        // Fetch companies
        try {
          const { data: companiesData, error: companiesError } = await supabase
            .from("companies")
            .select("company_id, company_name")
            .order("company_name");
          
          if (companiesError) {
            console.error("Error fetching companies:", companiesError);
          } else {
            console.log("Companies fetched successfully:", companiesData?.length || 0);
            setCompanies((companiesData || []).map(company => ({
              id: company.company_id,
              name: company.company_name || `Компания #${company.company_id}`
            })));
          }
        } catch (companyErr) {
          console.error("Failed to fetch companies:", companyErr);
        }
        
        // Fetch leads
        try {
          const { data: leadsData, error: leadsError } = await supabase
            .from("leads")
            .select("lead_id, name")
            .order("name");
          
          if (leadsError) {
            console.error("Error fetching leads:", leadsError);
          } else {
            console.log("Leads fetched successfully:", leadsData?.length || 0);
            setLeads((leadsData || []).map(lead => ({
              id: lead.lead_id,
              name: lead.name || `Лид #${lead.lead_id}`
            })));
          }
        } catch (leadErr) {
          console.error("Failed to fetch leads:", leadErr);
        }
        
        // Fetch managers
        try {
          const { data: managersData, error: managersError } = await supabase
            .from("profiles")
            .select("id, full_name")
            .order("full_name");
          
          if (managersError) {
            console.error("Error fetching managers:", managersError);
          } else {
            console.log("Managers fetched successfully:", managersData?.length || 0);
            setManagers((managersData || []).map(manager => ({
              id: manager.id,
              name: manager.full_name || `Менеджер #${manager.id}`
            })));
          }
        } catch (managerErr) {
          console.error("Failed to fetch managers:", managerErr);
        }
        
        // Fetch partners/manufacturers
        try {
          const { data: partnersData, error: partnersError } = await supabase
            .from("partners_manufacturers")
            .select("partner_manufacturer_id, company_name")
            .order("company_name");
          
          if (partnersError) {
            console.error("Error fetching partners:", partnersError);
          } else {
            console.log("Partners fetched successfully:", partnersData?.length || 0);
            setPartners((partnersData || []).map(partner => ({
              id: partner.partner_manufacturer_id,
              name: partner.company_name || `Партнер #${partner.partner_manufacturer_id}`
            })));
          }
        } catch (partnerErr) {
          console.error("Failed to fetch partners:", partnerErr);
        }
        
      } catch (error: any) {
        console.error("Error fetching related data:", error);
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
