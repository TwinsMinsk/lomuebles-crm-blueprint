
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
        
        // Function to safely fetch data and handle errors
        const safelyFetchData = async (
          tableName: string, 
          idField: string, 
          nameField: string,
          orderBy: string
        ): Promise<EntityOption[]> => {
          try {
            console.log(`Fetching ${tableName}...`);
            const { data, error } = await supabase
              .from(tableName)
              .select(`${idField}, ${nameField}`)
              .order(orderBy);
            
            if (error) {
              console.error(`Error fetching ${tableName}:`, error);
              throw new Error(`Ошибка загрузки ${tableName}: ${error.message}`);
            }
            
            console.log(`${tableName} fetched:`, data);
            return (data || []).map(item => ({
              id: item[idField],
              name: item[nameField] || `${tableName} #${item[idField]}`
            }));
          } catch (err) {
            console.error(`Failed to fetch ${tableName}:`, err);
            // Return empty array to maintain app stability
            return [];
          }
        };
        
        // Fetch all data in parallel for better performance
        const [contactsData, companiesData, leadsData, managersData, partnersData] = await Promise.all([
          safelyFetchData("contacts", "contact_id", "full_name", "full_name"),
          safelyFetchData("companies", "company_id", "company_name", "company_name"),
          safelyFetchData("leads", "lead_id", "name", "name"),
          safelyFetchData("profiles", "id", "full_name", "full_name"),
          safelyFetchData("partners_manufacturers", "partner_manufacturer_id", "company_name", "company_name")
        ]);
        
        // Update state with fetched data (always as arrays)
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
