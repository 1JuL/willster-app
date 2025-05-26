import { NotebookProvider } from "@/context/NotebookContext";
import { useProtectedRoute } from "@/hooks/useProtectedRoute";
import { Slot } from "expo-router";

export default function AppLayout() {
  useProtectedRoute();
  return (
    <NotebookProvider>
      <Slot />
    </NotebookProvider>
  );
}
