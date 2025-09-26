// src/hooks/useSupabaseAuth.ts
("use client"); // <- utile si tu l'importes directement dans un composant client

import { useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";

export function useSupabaseAuth() {
  const { initialize, user, profile, isLoading, isAuthenticated } =
    useAuthStore();

  useEffect(() => {
    void initialize(); // lance 1 seule fois
  }, []); // <= important : pas de dépendances

  return { user, profile, isLoading, isAuthenticated };
}
