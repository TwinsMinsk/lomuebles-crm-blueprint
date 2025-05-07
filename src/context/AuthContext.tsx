
import React, { createContext, useContext } from "react";
import { useSession } from "@/hooks/auth/useSession";
import { useAuthActions } from "@/hooks/auth/useAuthActions";
import { useUserRole } from "@/hooks/auth/useUserRole";
import { AuthContextType } from "@/types/auth";

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, session, isLoading } = useSession();
  const { signUp, signIn, signOut, resetPassword } = useAuthActions();
  const userRole = useUserRole(user);

  const value: AuthContextType = {
    user,
    session,
    isLoading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    userRole
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
