
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useAuthActions = () => {
  const { toast } = useToast();

  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      console.log("Attempting to sign up user:", email);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName || ''
          }
        }
      });

      if (error) {
        console.error("Error during signup:", error);
        toast({
          title: "Ошибка при регистрации",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      // Проверяем, успешно ли создан пользователь
      if (data.user) {
        console.log("User successfully created, checking if profile exists");
        
        // Проверяем, существует ли уже профиль
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', data.user.id)
          .maybeSingle();
          
        if (profileError) {
          console.error("Error checking profile:", profileError);
        }
        
        // Если профиль не существует, создаем его вручную
        if (!profileData) {
          console.log("Profile not found, creating manually");
          const { error: insertError } = await supabase
            .from('profiles')
            .insert([
              { 
                id: data.user.id, 
                email: email,
                full_name: fullName || '',
                role: 'Менеджер', // роль по умолчанию
                is_active: true 
              }
            ]);
            
          if (insertError) {
            console.error("Error creating profile:", insertError);
            toast({
              title: "Профиль создан, но произошла ошибка при настройке доступа",
              description: "Пожалуйста, обратитесь к администратору",
              variant: "destructive",
            });
          } else {
            console.log("Profile successfully created");
          }
        } else {
          console.log("Profile already exists");
        }
      }

      toast({
        title: "Регистрация прошла успешно",
        description: "Пожалуйста, проверьте вашу электронную почту для подтверждения учетной записи.",
      });
      
      return null;
    } catch (error) {
      console.error("Error signing up:", error);
      toast({
        title: "Ошибка",
        description: "Произошла неизвестная ошибка при регистрации.",
        variant: "destructive",
      });
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log("Attempting to sign in user:", email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Error during signin:", error);
        toast({
          title: "Ошибка входа",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      // Дополнительно проверим наличие профиля после успешного входа
      if (data.user) {
        console.log("User successfully logged in, checking profile");
        
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id, role')
          .eq('id', data.user.id)
          .maybeSingle();
          
        if (profileError) {
          console.error("Error checking profile:", profileError);
        }
        
        // Если профиль не существует, создаем его вручную
        if (!profileData) {
          console.log("Profile not found after login, creating manually");
          const { error: insertError } = await supabase
            .from('profiles')
            .insert([
              { 
                id: data.user.id, 
                email: email,
                role: 'Менеджер', // роль по умолчанию
                is_active: true 
              }
            ]);
            
          if (insertError) {
            console.error("Error creating profile after login:", insertError);
          } else {
            console.log("Profile successfully created after login");
          }
        } else {
          console.log("Profile exists with role:", profileData.role);
        }
      }

      toast({
        title: "Вход выполнен успешно",
      });
      
      return null;
    } catch (error) {
      console.error("Error signing in:", error);
      toast({
        title: "Ошибка",
        description: "Произошла неизвестная ошибка при входе.",
        variant: "destructive",
      });
      return { error };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Выход выполнен",
      });
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        title: "Ошибка",
        description: "Произошла ошибка при выходе из системы.",
        variant: "destructive",
      });
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/reset-password',
      });

      if (error) {
        toast({
          title: "Ошибка сброса пароля",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      toast({
        title: "Инструкции по сбросу пароля отправлены",
        description: "Пожалуйста, проверьте вашу электронную почту.",
      });
      
      return null;
    } catch (error) {
      console.error("Error resetting password:", error);
      toast({
        title: "Ошибка",
        description: "Произошла неизвестная ошибка при сбросе пароля.",
        variant: "destructive",
      });
      return { error };
    }
  };

  return {
    signUp,
    signIn,
    signOut,
    resetPassword
  };
};
