
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useFilterOptions() {
  // Options for dropdowns
  const [companies, setCompanies] = useState<{company_id: number; company_name: string}[]>([]);
  const [users, setUsers] = useState<{id: string; full_name: string}[]>([]);

  // Fetch filter options
  useEffect(() => {
    // Fetch companies for filter
    const fetchCompanies = async () => {
      try {
        const { data, error } = await supabase
          .from('companies')
          .select('company_id, company_name')
          .order('company_name');
        
        if (error) throw error;
        setCompanies(data || []);
      } catch (err) {
        console.error("Error fetching companies:", err);
      }
    };
    
    // Fetch users for filter
    const fetchUsers = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name')
          .order('full_name');
        
        if (error) throw error;
        setUsers(data || []);
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    };
    
    fetchCompanies();
    fetchUsers();
  }, []);

  return {
    companies,
    users
  };
}
