
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

interface AssignedUserFilterProps {
  value: string | null;
  onChange: (value: string | null) => void;
}

const AssignedUserFilter: React.FC<AssignedUserFilterProps> = ({
  value,
  onChange
}) => {
  const { user } = useAuth();

  // Fetch users for the assigned user filter
  const { data: users = [] } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name")
        .eq("is_active", true)
        .order("full_name");

      if (error) {
        throw error;
      }

      return data.map((user) => ({
        id: user.id,
        name: user.full_name || user.id,
      }));
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return (
    <div className="w-64">
      <label className="block text-sm font-medium mb-1">
        Исполнитель
      </label>
      <Select
        value={value || "all"}
        onValueChange={(value) => onChange(value === "all" ? null : value)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Все исполнители" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Все исполнители</SelectItem>
          <SelectItem value={user?.id || ""}>Мои задачи</SelectItem>
          {users.map((user) => (
            <SelectItem key={user.id} value={user.id}>
              {user.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default AssignedUserFilter;
