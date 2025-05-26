import { useProtectedRoute } from "@/hooks/useProtectedRoute";
import { Slot } from "expo-router";

export default function AppLayout() {
  useProtectedRoute();
  return <Slot />;
}
