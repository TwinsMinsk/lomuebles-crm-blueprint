
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
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

export const useOrderRelatedEntities = (): RelatedEntitiesData => {
  // Use React Query for better caching and retry logic
  const fetchContacts = async (): Promise<EntityOption[]> => {
    const { data, error } = await supabase
      .from('contacts')
      .select('contact_id, full_name')
      .order('full_name');
    
    if (error) throw error;
    return Array.isArray(data) ? data.map(item => ({
      id: item.contact_id,
      name: item.full_name || `Контакт #${item.contact_id}`
    })) : [];
  };

  const fetchCompanies = async (): Promise<EntityOption[]> => {
    const { data, error } = await supabase
      .from('companies')
      .select('company_id, company_name')
      .order('company_name');
    
    if (error) throw error;
    return Array.isArray(data) ? data.map(item => ({
      id: item.company_id,
      name: item.company_name || `Компания #${item.company_id}`
    })) : [];
  };

  const fetchLeads = async (): Promise<EntityOption[]> => {
    const { data, error } = await supabase
      .from('leads')
      .select('lead_id, name')
      .order('name');
    
    if (error) throw error;
    return Array.isArray(data) ? data.map(item => ({
      id: item.lead_id,
      name: item.name || `Лид #${item.lead_id}`
    })) : [];
  };

  const fetchManagers = async (): Promise<EntityOption[]> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name')
      .order('full_name');
    
    if (error) throw error;
    return Array.isArray(data) ? data.map(item => ({
      id: item.id,
      name: item.full_name || `Менеджер #${item.id}`
    })) : [];
  };

  const fetchPartners = async (): Promise<EntityOption[]> => {
    const { data, error } = await supabase
      .from('partners_manufacturers')
      .select('partner_manufacturer_id, company_name')
      .order('company_name');
    
    if (error) throw error;
    return Array.isArray(data) ? data.map(item => ({
      id: item.partner_manufacturer_id,
      name: item.company_name || `Партнер #${item.partner_manufacturer_id}`
    })) : [];
  };

  // Use React Query for better caching and error handling
  const contactsQuery = useQuery({
    queryKey: ['orderContacts'],
    queryFn: fetchContacts,
    retry: 2,
    staleTime: 300000 // 5 minutes
  });

  const companiesQuery = useQuery({
    queryKey: ['orderCompanies'],
    queryFn: fetchCompanies,
    retry: 2,
    staleTime: 300000
  });

  const leadsQuery = useQuery({
    queryKey: ['orderLeads'],
    queryFn: fetchLeads,
    retry: 2,
    staleTime: 300000
  });

  const managersQuery = useQuery({
    queryKey: ['orderManagers'],
    queryFn: fetchManagers,
    retry: 2,
    staleTime: 300000
  });

  const partnersQuery = useQuery({
    queryKey: ['orderPartners'],
    queryFn: fetchPartners,
    retry: 2,
    staleTime: 300000
  });

  // Show error toast for any failed queries
  useEffect(() => {
    const failedQueries = [
      { name: 'контактов', query: contactsQuery },
      { name: 'компаний', query: companiesQuery },
      { name: 'лидов', query: leadsQuery },
      { name: 'менеджеров', query: managersQuery },
      { name: 'партнеров', query: partnersQuery },
    ].filter(({ query }) => query.isError);

    if (failedQueries.length > 0) {
      toast.error(`Ошибка загрузки ${failedQueries.map(q => q.name).join(', ')}`, {
        description: "Пожалуйста, обновите страницу или обратитесь к администратору"
      });
    }
  }, [
    contactsQuery.isError, 
    companiesQuery.isError, 
    leadsQuery.isError, 
    managersQuery.isError, 
    partnersQuery.isError
  ]);

  // Generate combined error message
  const errors = [
    contactsQuery.error,
    companiesQuery.error,
    leadsQuery.error,
    managersQuery.error,
    partnersQuery.error,
  ].filter(Boolean).map(error => error?.message);
  
  const errorMessage = errors.length > 0 ? errors.join('; ') : null;

  return {
    contacts: contactsQuery.data || [],
    companies: companiesQuery.data || [],
    leads: leadsQuery.data || [],
    managers: managersQuery.data || [],
    partners: partnersQuery.data || [],
    isLoading: contactsQuery.isLoading || companiesQuery.isLoading || 
               leadsQuery.isLoading || managersQuery.isLoading || partnersQuery.isLoading,
    error: errorMessage
  };
};
