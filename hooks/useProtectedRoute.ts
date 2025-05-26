// hooks/useProtectedRoute.ts
import { useAuth } from "@/context/AuthContext";
import { useRouter, useSegments } from "expo-router";
import { useEffect } from "react";

export function useProtectedRoute() {
  const { user } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    const inAuthGroup = segments[0] === "login" || segments[0] === "signup";
    if (!user && !inAuthGroup) {
      router.replace("/home");
    }
  }, [user, segments, router]);

  return user;
}
