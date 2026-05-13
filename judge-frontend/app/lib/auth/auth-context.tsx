"use client";

import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "../api/supabase/client";
import LoadingOverlay from "../../../components/General/LoadingOverlay";

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
  savedAccounts: SavedAccount[];
  switchAccount: (userId: string) => Promise<void>;
  removeAccount: (userId: string) => Promise<void>;
};

export type SavedAccount = {
  userId: string;
  email: string;
  username: string;
  avatarUrl: string;
  provider: string;
  session: Session;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isReloading, setIsReloading] = useState(false);
  const [savedAccounts, setSavedAccounts] = useState<SavedAccount[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem("vlyxir_saved_accounts");
      try {
        return stored ? JSON.parse(stored) : [];
      } catch (e) {
        console.error("Failed to parse saved accounts", e);
        return [];
      }
    }
    return [];
  });

  useEffect(() => {
    let mounted = true;

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!mounted) return;
        setSession(data.session);
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setIsLoading(false);

      if (nextSession?.user) {
        // Update or add the current user to saved accounts
        setSavedAccounts(prev => {
          const newAccounts = [...prev];
          const index = newAccounts.findIndex(a => a.userId === nextSession.user.id);
          const accountData: SavedAccount = {
            userId: nextSession.user.id,
            email: nextSession.user.email || "",
            username: nextSession.user.user_metadata?.username || nextSession.user.user_metadata?.full_name || nextSession.user.email?.split('@')[0] || "User",
            avatarUrl: nextSession.user.user_metadata?.avatar_url || "",
            provider: nextSession.user.app_metadata?.provider || "email",
            session: nextSession
          };

          if (index >= 0) {
            newAccounts[index] = accountData;
          } else {
            newAccounts.push(accountData);
          }
          localStorage.setItem("vlyxir_saved_accounts", JSON.stringify(newAccounts));
          return newAccounts;
        });
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(() => {
    return {
      session,
      user: session?.user ?? null,
      isLoading,
      signOut: async () => {
        // Note: We no longer remove from savedAccounts on sign out 
        // so the account remains in the switcher list.
        await supabase.auth.signOut();
      },
      savedAccounts,
      switchAccount: async (userId: string) => {
        const account = savedAccounts.find(a => a.userId === userId);
        if (account) {
          setIsLoading(true);
          const { error } = await supabase.auth.setSession({
            access_token: account.session.access_token,
            refresh_token: account.session.refresh_token
          });
          if (error) {
            console.error("Failed to switch account", error);
            // If session is invalid, remove it
            const newAccounts = savedAccounts.filter(a => a.userId !== userId);
            setSavedAccounts(newAccounts);
            localStorage.setItem("vlyxir_saved_accounts", JSON.stringify(newAccounts));
          } else {
            // Force a full reload to refresh all data for the new user
            setIsReloading(true);
            window.location.reload();
          }
          setIsLoading(false);
        }
      },
      removeAccount: async (userId: string) => {
        const newAccounts = savedAccounts.filter(a => a.userId !== userId);
        setSavedAccounts(newAccounts);
        localStorage.setItem("vlyxir_saved_accounts", JSON.stringify(newAccounts));
        
        // If we are currently logged in as this user, sign out
        if (session?.user.id === userId) {
          await supabase.auth.signOut();
        }
      }
    };
  }, [session, isLoading, savedAccounts]);

  return (
    <AuthContext.Provider value={value}>
      {children}
      {isReloading && <LoadingOverlay />}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
