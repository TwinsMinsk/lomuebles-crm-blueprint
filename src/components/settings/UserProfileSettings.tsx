
import React from "react";
import { useAuth } from "@/context/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface ProfileFormValues {
  fullName: string;
}

const UserProfileSettings = () => {
  const { user, userRole } = useAuth();
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ProfileFormValues>({
    defaultValues: {
      fullName: user?.user_metadata?.full_name || ""
    }
  });
  
  const onSubmit = async (data: ProfileFormValues) => {
    if (!user) return;
    
    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: data.fullName }
      });
      
      if (error) throw error;
      
      toast.success("Профиль успешно обновлен");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Ошибка при обновлении профиля");
    }
  };
  
  if (!user) {
    return <div>Загрузка профиля...</div>;
  }
  
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Профиль пользователя</h2>
      
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium">Основная информация</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Управление информацией вашей учетной записи
          </p>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={user.email} disabled />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="fullName">Имя</Label>
                <Input 
                  id="fullName" 
                  {...register("fullName", { required: "Имя обязательно" })}
                />
                {errors.fullName && (
                  <p className="text-sm text-red-500">{errors.fullName.message}</p>
                )}
              </div>
              
              <div className="grid gap-2">
                <Label>Роль</Label>
                <div>
                  <Badge variant="outline" className="bg-blue-50 text-blue-600 hover:bg-blue-50">
                    {userRole || "Загрузка..."}
                  </Badge>
                </div>
              </div>
            </div>
            
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Сохранение..." : "Сохранить изменения"}
            </Button>
          </form>
        </div>
        
        <Separator />
        
        <div>
          <h3 className="text-lg font-medium">Безопасность</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Настройки безопасности вашей учетной записи
          </p>
          
          <Button variant="outline">
            Изменить пароль
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UserProfileSettings;
