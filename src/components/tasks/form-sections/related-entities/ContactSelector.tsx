
import { useState } from "react";
import { useContacts } from "@/hooks/useContacts";
import EntitySelector from "./EntitySelector";

interface ContactSelectorProps {
  value: number | undefined;
  onChange: (value: number | undefined) => void;
}

export const ContactSelector = ({ value, onChange }: ContactSelectorProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const { contacts, loading: isLoading } = useContacts({
    page: 1,
    pageSize: 50,
    sortColumn: "full_name",
    sortDirection: "asc"
  });

  // Format contact data for display in entity selector
  const formattedContacts = contacts.map((contact) => ({
    id: contact.contact_id,
    name: contact.full_name || `Контакт #${contact.contact_id}`,
    description: contact.primary_phone || contact.primary_email || '',
    imageUrl: null,
    subtitle: contact.companies?.company_name || 'Без компании'
  }));

  return (
    <EntitySelector
      value={value}
      onChange={onChange}
      options={formattedContacts}
      isLoading={isLoading}
      error={null}
      searchTerm={searchTerm}
      onSearchChange={setSearchTerm}
      placeholder="Поиск контакта..."
      emptyMessage="Контакты не найдены"
      entityLabel="контакт"
    />
  );
};

export default ContactSelector;
