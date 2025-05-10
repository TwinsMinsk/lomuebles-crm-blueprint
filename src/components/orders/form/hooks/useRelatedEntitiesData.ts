
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
        
        // Function to safely fetch contacts and handle errors
        const fetchContacts = async (): Promise<EntityOption[]> => {
          try {
            console.log("Fetching contacts...");
            const { data, error } = await supabase
              .from("contacts")
              .select("contact_id, full_name")
              .order("full_name");
            
            if (error) {
              console.error("Error fetching contacts:", error);
              throw new Error(`Ошибка загрузки контактов: ${error.message}`);
            }
            
            console.log("Contacts fetched:", data);
            return (data || []).map(item => ({
              id: item.contact_id,
              name: item.full_name || `Contact #${item.contact_id}`
            }));
          } catch (err) {
            console.error("Failed to fetch contacts:", err);
            return [];
          }
        };

        // Function to safely fetch companies and handle errors
        const fetchCompanies = async (): Promise<EntityOption[]> => {
          try {
            console.log("Fetching companies...");
            const { data, error } = await supabase
              .from("companies")
              .select("company_id, company_name")
              .order("company_name");
            
            if (error) {
              console.error("Error fetching companies:", error);
              throw new Error(`Ошибка загрузки компаний: ${error.message}`);
            }
            
            console.log("Companies fetched:", data);
            return (data || []).map(item => ({
              id: item.company_id,
              name: item.company_name || `Company #${item.company_id}`
            }));
          } catch (err) {
            console.error("Failed to fetch companies:", err);
            return [];
          }
        };

        // Function to safely fetch leads and handle errors
        const fetchLeads = async (): Promise<EntityOption[]> => {
          try {
            console.log("Fetching leads...");
            const { data, error } = await supabase
              .from("leads")
              .select("lead_id, name")
              .order("name");
            
            if (error) {
              console.error("Error fetching leads:", error);
              throw new Error(`Ошибка загрузки лидов: ${error.message}`);
            }
            
            console.log("Leads fetched:", data);
            return (data || []).map(item => ({
              id: item.lead_id,
              name: item.name || `Lead #${item.lead_id}`
            }));
          } catch (err) {
            console.error("Failed to fetch leads:", err);
            return [];
          }
        };

        // Function to safely fetch managers and handle errors
        const fetchManagers = async (): Promise<EntityOption[]> => {
          try {
            console.log("Fetching managers...");
            const { data, error } = await supabase
              .from("profiles")
              .select("id, full_name")
              .order("full_name");
            
            if (error) {
              console.error("Error fetching managers:", error);
              throw new Error(`Ошибка загрузки менеджеров: ${error.message}`);
            }
            
            console.log("Managers fetched:", data);
            return (data || []).map(item => ({
              id: item.id,
              name: item.full_name || `Manager #${item.id}`
            }));
          } catch (err) {
            console.error("Failed to fetch managers:", err);
            return [];
          }
        };

        // Function to safely fetch partners and handle errors
        const fetchPartners = async (): Promise<EntityOption[]> => {
          try {
            console.log("Fetching partners...");
            const { data, error } = await supabase
              .from("partners_manufacturers")
              .select("partner_manufacturer_id, company_name")
              .order("company_name");
            
            if (error) {
              console.error("Error fetching partners:", error);
              throw new Error(`Ошибка загрузки партнеров: ${error.message}`);
            }
            
            console.log("Partners fetched:", data);
            return (data || []).map(item => ({
              id: item.partner_manufacturer_id,
              name: item.company_name || `Partner #${item.partner_manufacturer_id}`
            }));
          } catch (err) {
            console.error("Failed to fetch partners:", err);
            return [];
          }
        };
        
        // Fetch all data in parallel for better performance
        const [contactsData, companiesData, leadsData, managersData, partnersData] = await Promise.all([
          fetchContacts(),
          fetchCompanies(),
          fetchLeads(),
          fetchManagers(),
          fetchPartners()
        ]);
        
        // Update state with fetched data - ensuring they're always arrays
        setContacts(contactsData || []);
        setCompanies(companiesData || []);
        setLeads(leadsData || []);
        setManagers(managersData || []);
        setPartners(partnersData || []);
        
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
