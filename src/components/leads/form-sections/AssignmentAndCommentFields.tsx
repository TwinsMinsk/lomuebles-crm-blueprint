
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";
import { LeadFormData } from "../schema/leadFormSchema";

interface UserProfile {
  id: string;
  full_name: string;
  role?: string;
}

interface AssignmentAndCommentFieldsProps {
  form: UseFormReturn<LeadFormData>;
  users: UserProfile[];
}

const AssignmentAndCommentFields: React.FC<AssignmentAndCommentFieldsProps> = ({ form, users }) => {
  return (
    <>
      <FormField
        control={form.control}
        name="initial_comment"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Первоначальный комментарий</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Введите комментарий"
                className="resize-none"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="assigned_user_id"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Ответственный менеджер</FormLabel>
            <Select
              onValueChange={field.onChange}
              value={field.value || "not_assigned"}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите менеджера" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="not_assigned">Не назначен</SelectItem>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id || "unknown-user"}>
                    {user.full_name || user.id || "Неизвестный пользователь"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};

export default AssignmentAndCommentFields;
