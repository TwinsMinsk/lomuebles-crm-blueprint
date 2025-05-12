
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { LeadFormValues } from "../hooks/useLeadForm";

interface AssignmentAndCommentFieldsProps {
  form: UseFormReturn<LeadFormValues>;
  users: any[];
}

const AssignmentAndCommentFields: React.FC<AssignmentAndCommentFieldsProps> = ({ form, users }) => {
  return (
    <div className="space-y-3">
      <FormField
        control={form.control}
        name="assigned_user_id"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Назначен</FormLabel>
            <Select
              onValueChange={field.onChange}
              value={field.value || "not_assigned"}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите пользователя" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="not_assigned">Не назначен</SelectItem>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.full_name || user.email || user.id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="initial_comment"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Комментарий</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Дополнительная информация о лиде"
                className="min-h-[100px]"
                {...field}
                value={field.value || ""}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default AssignmentAndCommentFields;
