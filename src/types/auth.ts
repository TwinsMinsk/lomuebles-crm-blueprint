
import { User, Session } from "@supabase/supabase-js";

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: any } | null>;
  signIn: (email: string, password: string) => Promise<{ error: any } | null>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any } | null>;
  userRole: string | null;
}
