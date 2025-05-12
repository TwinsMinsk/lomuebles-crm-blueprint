
import React from "react";
import { useFormContext } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { taskTypeOptions, taskStatusOptions, priorityOptions } from "../schema/taskFormSchema";

const BasicTaskFields: React.FC = () => {
  const { control } = useFormContext();

  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name="task_name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Название задачи*</FormLabel>
            <FormControl>
              <Input placeholder="Введите название задачи" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Описание</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Введите описание задачи"
                className="min-h-[100px]"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={control}
          name="task_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Тип задачи</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите тип задачи" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {taskTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="task_status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Статус*</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите статус" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {taskStatusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="priority"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Приоритет</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите приоритет" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {priorityOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="due_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Срок выполнения</FormLabel>
              <FormControl>
                <DateTimePicker
                  value={field.value}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormDescription>
                Выберите дату и время завершения задачи
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};

export default BasicTaskFields;
