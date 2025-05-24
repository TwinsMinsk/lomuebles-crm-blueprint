
import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface UserFilterProps {
  value: string | null | undefined;
  onUserFilterChange: (value: string) => void;
}

const UserFilter: React.FC<UserFilterProps> = ({ value, onUserFilterChange }) => {
  // Fetch users for the user filter dropdown
  const { data: users = [] } = useQuery({
    queryKey: ["users-filter"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .eq("is_active", true)
        .order("full_name");

      if (error) throw error;
      
      return data
        .filter(user => user.id) // Убираем пользователей без ID
        .map((user) => ({
          id: user.id,
          full_name: user.full_name || user.email || `Пользователь ${user.id?.slice(0, 8)}`,
        }));
    },
  });

  return (
    <Select
      value={value || "all"}
      onValueChange={onUserFilterChange}
    >
      <SelectTrigger>
        <SelectValue placeholder="Ответственный" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Все исполнители</SelectItem>
        <SelectItem value="my">Мои задачи</SelectItem>
        {users.map((user) => (
          <SelectItem key={user.id} value={user.id}>
            {user.full_name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default UserFilter;
