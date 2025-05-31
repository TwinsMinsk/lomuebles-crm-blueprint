
import React from "react";
import { useFormContext } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUsers } from "@/hooks/useUsers";
import { useAuth } from "@/context/AuthContext";

const AssignmentFields: React.FC = () => {
  const { control, setValue } = useFormContext();
  const { users, isLoading, error } = useUsers();
  const { user, userRole } = useAuth();

  console.log("AssignmentFields render:", { 
    userRole, 
    usersCount: users?.length, 
    isLoading, 
    error: error?.message,
    currentUserId: user?.id 
  });

  // For specialists, auto-assign to themselves and make it readonly
  React.useEffect(() => {
    if (userRole === 'Специалист' && user?.id) {
      console.log("Auto-assigning task to specialist:", user.id);
      setValue('assigned_task_user_id', user.id);
    }
  }, [userRole, user?.id, setValue]);

  // If specialist, show readonly field
  if (userRole === 'Специалист') {
    return (
      <FormField
        control={control}
        name="assigned_task_user_id"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Ответственный</FormLabel>
            <FormControl>
              <Select value={field.value} disabled>
                <SelectTrigger>
                  <SelectValue placeholder="Назначено на меня" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={user?.id || ""}>
                    Я ({user?.email})
                  </SelectItem>
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    );
  }

  // Show loading state
  if (isLoading) {
    return (
      <FormField
        control={control}
        name="assigned_task_user_id"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Ответственный*</FormLabel>
            <FormControl>
              <Select disabled>
                <SelectTrigger>
                  <SelectValue placeholder="Загрузка пользователей..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="loading">Загрузка...</SelectItem>
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    );
  }

  // Show error state
  if (error) {
    console.error("Error loading users:", error);
    return (
      <FormField
        control={control}
        name="assigned_task_user_id"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Ответственный*</FormLabel>
            <FormControl>
              <Select 
                value={field.value || user?.id || ""} 
                onValueChange={field.onChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Ошибка загрузки пользователей" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={user?.id || ""}>
                    Я ({user?.email})
                  </SelectItem>
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
            <p className="text-sm text-red-600">
              Ошибка загрузки пользователей. Задача будет назначена на вас.
            </p>
          </FormItem>
        )}
      />
    );
  }

  // Normal user selection for admins/managers
  return (
    <FormField
      control={control}
      name="assigned_task_user_id"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Ответственный*</FormLabel>
          <Select
            onValueChange={field.onChange}
            value={field.value || ""}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Выберите ответственного" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {users?.map((user) => (
                <SelectItem key={user.id} value={user.id || ""}>
                  {user.full_name || user.email || `Пользователь ${user.id}`}
                </SelectItem>
              ))}
              {(!users || users.length === 0) && (
                <SelectItem value={user?.id || ""}>
                  Я ({user?.email})
                </SelectItem>
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
