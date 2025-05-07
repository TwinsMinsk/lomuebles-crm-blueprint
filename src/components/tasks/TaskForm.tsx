
import React, { useState } from "react";
import { useTaskForm } from "@/hooks/tasks/useTaskForm";
import { useTaskRelatedEntities } from "@/hooks/tasks/useTaskRelatedEntities";
import { Task } from "@/types/task";
import { taskTypeOptions, taskStatusOptions, priorityOptions } from "./schema/taskFormSchema";
import { useAuth } from "@/context/AuthContext";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

interface TaskFormProps {
  task?: Task;
  onClose: () => void;
}

const TaskForm: React.FC<TaskFormProps> = ({ task, onClose }) => {
  const { user } = useAuth();
  const { form, isLoading, onSubmit, isEditing } = useTaskForm(task, onClose);
  const { users, leads, contacts, orders, partners, customRequests, isLoading: isLoadingEntities } = useTaskRelatedEntities();
  const [relatedEntityTab, setRelatedEntityTab] = useState("none");

  // Set active tab based on existing task data
  React.useEffect(() => {
    if (task) {
      if (task.related_lead_id) setRelatedEntityTab("lead");
      else if (task.related_contact_id) setRelatedEntityTab("contact");
      else if (task.related_deal_order_id) setRelatedEntityTab("order");
      else if (task.related_partner_manufacturer_id) setRelatedEntityTab("partner");
      else if (task.related_custom_request_id) setRelatedEntityTab("request");
      else setRelatedEntityTab("none");
    }
  }, [task]);

  // Clear other relation fields when changing tab
  const handleTabChange = (value: string) => {
    setRelatedEntityTab(value);
    
    // Clear all related entity fields
    if (value !== "lead") form.setValue("related_lead_id", null);
    if (value !== "contact") form.setValue("related_contact_id", null);
    if (value !== "order") form.setValue("related_deal_order_id", null);
    if (value !== "partner") form.setValue("related_partner_manufacturer_id", null);
    if (value !== "request") form.setValue("related_custom_request_id", null);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
        {/* Basic Task Information */}
        <FormField
          control={form.control}
          name="task_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Название задачи*</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Введите название задачи" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="task_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Тип задачи</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
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
            control={form.control}
            name="task_status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Статус задачи</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="due_date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Срок выполнения</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "dd.MM.yyyy HH:mm")
                        ) : (
                          <span>Выберите дату и время</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value || undefined}
                      onSelect={(date) => {
                        // Set time to noon by default if selecting a new date
                        if (date) {
                          const newDate = new Date(date);
                          newDate.setHours(12, 0, 0, 0);
                          field.onChange(newDate);
                        } else {
                          field.onChange(null);
                        }
                      }}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                    {field.value && (
                      <div className="p-3 border-t">
                        <Input 
                          type="time" 
                          value={field.value ? format(field.value, "HH:mm") : "12:00"}
                          onChange={(e) => {
                            const [hours, minutes] = e.target.value.split(':').map(Number);
                            const newDate = new Date(field.value || new Date());
                            newDate.setHours(hours, minutes);
                            field.onChange(newDate);
                          }}
                          className="w-full"
                        />
                      </div>
                    )}
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="priority"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Приоритет</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
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
        </div>

        <FormField
          control={form.control}
          name="assigned_task_user_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ответственный исполнитель*</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите исполнителя" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.full_name}
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
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Описание</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Введите описание задачи"
                  rows={4}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Related Entity Section */}
        <div className="space-y-2 pt-2">
          <h3 className="text-sm font-medium">Связать с объектом</h3>
          
          <Tabs value={relatedEntityTab} onValueChange={handleTabChange}>
            <TabsList className="w-full flex mb-4">
              <TabsTrigger value="none" className="flex-1">Нет</TabsTrigger>
              <TabsTrigger value="lead" className="flex-1">Лид</TabsTrigger>
              <TabsTrigger value="contact" className="flex-1">Контакт</TabsTrigger>
              <TabsTrigger value="order" className="flex-1">Заказ</TabsTrigger>
              <TabsTrigger value="partner" className="flex-1">Партнер</TabsTrigger>
              <TabsTrigger value="request" className="flex-1">Запрос</TabsTrigger>
            </TabsList>
            
            <TabsContent value="lead">
              <FormField
                control={form.control}
                name="related_lead_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Связанный лид</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(Number(value))}
                      value={field.value?.toString() || ""}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите лид" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {leads.map((lead) => (
                          <SelectItem key={lead.id} value={lead.id.toString()}>
                            {lead.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </TabsContent>

            <TabsContent value="contact">
              <FormField
                control={form.control}
                name="related_contact_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Связанный контакт</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(Number(value))}
                      value={field.value?.toString() || ""}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите контакт" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {contacts.map((contact) => (
                          <SelectItem key={contact.id} value={contact.id.toString()}>
                            {contact.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </TabsContent>

            <TabsContent value="order">
              <FormField
                control={form.control}
                name="related_deal_order_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Связанный заказ</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(Number(value))}
                      value={field.value?.toString() || ""}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите заказ" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {orders.map((order) => (
                          <SelectItem key={order.id} value={order.id.toString()}>
                            {order.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </TabsContent>

            <TabsContent value="partner">
              <FormField
                control={form.control}
                name="related_partner_manufacturer_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Связанный партнер</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(Number(value))}
                      value={field.value?.toString() || ""}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите партнера" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {partners.map((partner) => (
                          <SelectItem key={partner.id} value={partner.id.toString()}>
                            {partner.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </TabsContent>

            <TabsContent value="request">
              <FormField
                control={form.control}
                name="related_custom_request_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Связанный запрос</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(Number(value))}
                      value={field.value?.toString() || ""}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите запрос" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {customRequests.map((request) => (
                          <SelectItem key={request.id} value={request.id.toString()}>
                            {request.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-2 pt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onClose}
            disabled={isLoading}
          >
            Отмена
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Сохранение..." : isEditing ? "Обновить" : "Сохранить"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default TaskForm;
