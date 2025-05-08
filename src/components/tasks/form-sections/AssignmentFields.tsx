
import React from "react";
import { useFormContext } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUsers } from "@/hooks/useUsers";

const AssignmentFields: React.FC = () => {
  const { control } = useFormContext();
  const { users } = useUsers();

  return (
    <FormField
      control={control}
      name="assigned_task_user_id"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Ответственный*</FormLabel>
          <Select
            onValueChange={field.onChange}
            defaultValue={field.value || "not_assigned"}
            value={field.value || "not_assigned"}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Выберите ответственного" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {users?.map((user) => (
                <SelectItem key={user.id} value={user.id || "unknown-user"}>
                  {user.full_name || user.email || `Пользователь ${user.id}`}
                </SelectItem>
              ))}
              {(!users || users.length === 0) && (
                <SelectItem value="no-users-available">Нет доступных пользователей</SelectItem>
              )}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default AssignmentFields;
