
import { useState } from "react";
import { useCustomRequests } from "@/hooks/useCustomRequests";
import EntitySelector from "./EntitySelector";
import { formatDate } from "@/utils/formatters";

interface CustomRequestSelectorProps {
  value: number | undefined;
  onChange: (value: number | undefined) => void;
}

export const CustomRequestSelector = ({ value, onChange }: CustomRequestSelectorProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const { customRequests, isLoading, error } = useCustomRequests();
  
  // Format custom request data for display in entity selector
  const formattedCustomRequests = customRequests.map((request) => ({
    id: request.custom_request_id,
    name: request.request_name || `Запрос #${request.custom_request_id}`,
    description: `${formatDate(request.creation_date)} - ${request.request_status || 'Новый'}`,
    imageUrl: null,
    subtitle: request.client_description ? `${request.client_description.substring(0, 30)}...` : 'Без описания'
  }));

  return (
    <EntitySelector
      value={value}
      onChange={onChange}
      options={formattedCustomRequests}
      isLoading={isLoading}
      error={error?.message}
      searchTerm={searchTerm}
      onSearchChange={setSearchTerm}
      placeholder="Поиск запроса..."
      emptyMessage="Запросы не найдены"
      entityLabel="запрос"
    />
  );
};

export default CustomRequestSelector;
