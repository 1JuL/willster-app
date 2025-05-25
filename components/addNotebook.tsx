// components/AddNotebook.tsx
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

interface AddNotebookProps {
  onSuccess?: () => void; // Callback opcional para cuando se crea exitosamente
}

const AddNotebook = ({ onSuccess }: AddNotebookProps) => {
  const [title, setTitle] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  const handleCreateNotebook = async () => {
    if (!title.trim()) {
      Alert.alert("Error", "Please enter a notebook title.");
      return;
    }

    if (!user) {
      Alert.alert("Error", "User not authenticated.");
      return;
    }

    if (isLoading) {
      return; // Evita múltiples llamadas si ya está cargando
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/users/${user.uid}/notebooks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });

      if (!response.ok) throw new Error("Failed to create notebook");

      Alert.alert("Success", "Notebook created!");
      setTitle("");
      
      // Si hay callback, ejecutarlo (para cerrar modal)
      if (onSuccess) {
        onSuccess();
      } else {
        // Si no hay callback, navegar (comportamiento original)
        router.push("/");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to create notebook.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Notebook title</Text>
      <TextInput
        placeholder="e.g. Water cycle"
        style={styles.input}
        value={title}
        onChangeText={setTitle}
      />
      <TouchableOpacity 
        onPress={handleCreateNotebook} 
        style={[
          styles.button,
          isLoading && styles.buttonDisabled
        ]}
        disabled={isLoading}
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="white" />
            <Text style={styles.buttonText}>Creating...</Text>
          </View>
        ) : (
          <Text style={styles.buttonText}>Create notebook</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default AddNotebook;

const styles = StyleSheet.create({
  container: { 
    padding: 0 // Cambiado de 20 a 0 para que funcione mejor en el modal
  },
  label: { 
    fontSize: 16, 
    marginBottom: 8,
    color: "black" 
  },
  input: {
    borderColor: "#ccc",
    borderWidth: 1,
    padding: 10,
    borderRadius: 6,
    marginBottom: 12,
    backgroundColor: "white",
  },
  button: {
    backgroundColor: "#EF5C40", // Cambié el color para que coincida con tu tema
    padding: 12,
    borderRadius: 6,
    alignItems: "center",
    minHeight: 44, // Altura mínima para evitar que cambie de tamaño
  },
  buttonDisabled: {
    backgroundColor: "#B8B8B8", // Color gris cuando está deshabilitado
    opacity: 0.7,
  },
  buttonText: { 
    color: "white", 
    fontWeight: "bold" 
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
});