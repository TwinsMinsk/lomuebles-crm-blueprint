
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useAuthActions = () => {
  const { toast } = useToast();

  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
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
        toast({
          title: "Ошибка при регистрации",
          description: error.message,
          variant: "destructive",
        });
        return { error };
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
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          title: "Ошибка входа",
          description: error.message,
          variant: "destructive",
        });
        return { error };
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
