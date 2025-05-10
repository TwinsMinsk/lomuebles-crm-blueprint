
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
        
        // Function to safely fetch data and always return an array
        const safeFetch = async (tableName: string, idField: string, nameField: string): Promise<EntityOption[]> => {
          try {
            console.log(`Fetching from ${tableName}...`);
            const { data, error } = await supabase
              .from(tableName)
              .select(`${idField}, ${nameField}`)
              .order(nameField);
            
            if (error) {
              console.error(`Error fetching ${tableName}:`, error);
              throw new Error(`Ошибка загрузки данных из ${tableName}: ${error.message}`);
            }
            
            // Always ensure we return an array
            if (!Array.isArray(data)) {
              console.warn(`Data from ${tableName} is not an array, returning empty array`);
              return [];
            }
            
            console.log(`${tableName} fetched:`, data);
            return data.map(item => ({
              id: item[idField],
              name: item[nameField] || `#${item[idField]}`
            }));
          } catch (err) {
            console.error(`Failed to fetch ${tableName}:`, err);
            return []; // Return empty array on error
          }
        };

        // Fetch all data in parallel with typed table names
        const [contactsData, companiesData, leadsData, managersData, partnersData] = await Promise.all([
          safeFetch('contacts', 'contact_id', 'full_name'),
          safeFetch('companies', 'company_id', 'company_name'),
          safeFetch('leads', 'lead_id', 'name'),
          safeFetch('profiles', 'id', 'full_name'),
          safeFetch('partners_manufacturers', 'partner_manufacturer_id', 'company_name')
        ]);
        
        // Update state with fetched data - ensuring they're always arrays
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
