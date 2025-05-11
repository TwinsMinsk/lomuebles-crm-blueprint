
import { useState } from "react";
import { useLeads } from "@/hooks/useLeads";
import EntitySelector from "./EntitySelector";

interface LeadSelectorProps {
  value: number | undefined;
  onChange: (value: number | undefined) => void;
}

export const LeadSelector = ({ value, onChange }: LeadSelectorProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const { leads, loading: isLoading } = useLeads();

  // Format lead data for the entity selector
  const formattedLeads = leads.map((lead) => ({
    id: lead.lead_id,
    name: lead.name || `Лид #${lead.lead_id}`,
    description: `${lead.lead_status || 'Новый'} - ${lead.lead_source || 'Неизвестно'}`,
    imageUrl: null,
    subtitle: lead.email || lead.phone || 'Нет контактной информации'
  }));

  return (
    <EntitySelector
      value={value}
      onChange={onChange}
      options={formattedLeads}
      isLoading={isLoading}
      error={null}
      searchTerm={searchTerm}
      onSearchChange={setSearchTerm}
      placeholder="Поиск лида..."
      emptyMessage="Лиды не найдены"
      entityLabel="лид"
    />
  );
};

export default LeadSelector;
