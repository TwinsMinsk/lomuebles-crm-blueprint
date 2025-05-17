
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { useToast } from "@/components/ui/use-toast";

export const useUserRole = (user: User | null) => {
  const [userRole, setUserRole] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchUserRole(user.id);
    } else {
      setUserRole(null);
    }
  }, [user]);

  const fetchUserRole = async (userId: string) => {
    try {
      console.log("Fetching role for user:", userId);

      // Сначала проверим, существует ли профиль пользователя
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('role, email')
        .eq('id', userId)
        .maybeSingle();

      if (profileError) {
        console.error('Error fetching user profile:', profileError);
        return;
      }

      // Если профиль не существует, создаем его с ролью "Менеджер" по умолчанию
      if (!profileData) {
        console.log("User profile not found, attempting to create one");
        
        // Получаем email пользователя из auth.users
        const { data: userData, error: userError } = await supabase.auth.getUser();
        
        if (userError || !userData) {
          console.error('Error getting user data:', userError);
          return;
        }
        
        const email = userData.user?.email;
        
        // Создаем профиль пользователя с ролью "Менеджер" по умолчанию
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert([
            { 
              id: userId, 
              email: email,
              role: 'Менеджер',
              is_active: true
            }
          ])
          .select()
          .single();
        
        if (insertError) {
          console.error('Error creating user profile:', insertError);
          toast({
            title: "Ошибка создания профиля",
            description: "Пожалуйста, обратитесь к администратору",
            variant: "destructive",
          });
          return;
        }
        
        console.log("Created new profile with role Менеджер");
        setUserRole('Менеджер');
        return;
      }

      // Если профиль существует, устанавливаем роль из него
      if (profileData && profileData.role) {
        console.log("Found user role:", profileData.role);
        setUserRole(profileData.role);
      } else {
        console.log("User has no role assigned");
        setUserRole(null);
      }
    } catch (error) {
      console.error('Error in fetchUserRole:', error);
      toast({
        title: "Ошибка при получении роли пользователя",
        description: "Пожалуйста, попробуйте войти снова или обратитесь к администратору",
        variant: "destructive",
      });
    }
  };

  return userRole;
};
