
import { useState } from "react";
import { usePartners } from "@/hooks/usePartners";
import EntitySelector from "./EntitySelector";

interface PartnerSelectorProps {
  value: number | undefined;
  onChange: (value: number | undefined) => void;
}

export const PartnerSelector = ({ value, onChange }: PartnerSelectorProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const { partners, loading: isLoading } = usePartners(1, 50, "company_name", "asc");
  
  // Format partner data for display in entity selector
  const formattedPartners = partners.map((partner) => ({
    id: partner.partner_manufacturer_id,
    name: partner.company_name || `Партнер #${partner.partner_manufacturer_id}`,
    description: partner.specialization || '',
    imageUrl: null,
    subtitle: partner.contact_person || 'Без контактного лица'
  }));

  return (
    <EntitySelector
      value={value}
      onChange={onChange}
      options={formattedPartners}
      isLoading={isLoading}
      error={null}
      searchTerm={searchTerm}
      onSearchChange={setSearchTerm}
      placeholder="Поиск партнера..."
      emptyMessage="Партнеры не найдены"
      entityLabel="партнер"
    />
  );
};

export default PartnerSelector;
