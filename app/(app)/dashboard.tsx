// app/home.tsx
import AddNotebook from "@/components/addNotebook";
import { useAuth } from "@/context/AuthContext";
import { useNotebook } from "@/context/NotebookContext"; // Importar el contexto
import { Notebook } from "@/interfaces/AppInterfaces";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function HomeScreen() {
  const router = useRouter();
  const { logout, user } = useAuth();
  const { setNotebook } = useNotebook(); // Usar el contexto
  const [expanded, setExpanded] = useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotebooks = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/users/${user.uid}/notebooks`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch notebooks");
      }

      const data = await response.json();
      setNotebooks(data);
    } catch (error) {
      console.error("Error fetching notebooks:", error);
      Alert.alert("Error", "Failed to load notebooks");
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  // Se ejecuta cuando la pantalla obtiene el foco
  useFocusEffect(
    useCallback(() => {
      fetchNotebooks();
    }, [user])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchNotebooks();
  }, []);

  const toggleExpand = (notebookId: string) => {
    setExpanded((prev) => (prev === notebookId ? null : notebookId));
  };

  const handleAddNotebook = () => {
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
  };

  const handleNotebookCreated = () => {
    // Callback para cuando se crea el notebook exitosamente
    setIsModalVisible(false);
    // Recargar la lista de notebooks
    fetchNotebooks();
  };

  const handleNotebookPress = (notebook: Notebook) => {
    // AQUÍ ESTÁ EL CAMBIO IMPORTANTE: Configurar el contexto antes de navegar
    setNotebook(notebook.id, ""); // Pasar el ID del notebook seleccionado
    router.push("/notesdashboard");
  };

  const handleGamesPress = (notebook: Notebook) => {
    // También configurar el contexto para los juegos
    setNotebook(notebook.id, "");
    router.push(`/game_scores`);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        <View style={[styles.container, styles.loadingContainer]}>
          <ActivityIndicator size="large" color="#EF5C40" />
          <Text style={styles.loadingText}>Loading your notebooks...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.push("/profile")}>
            <MaterialCommunityIcons name="account-circle" size={34} color="#2A1E1E" />
          </TouchableOpacity>
          <Text style={styles.headerText}>Home</Text>
        </View>

        {/* Content */}
        <ScrollView
          contentContainerStyle={styles.scroll}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {notebooks.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="book-outline" size={64} color="#ccc" />
              <Text style={styles.emptyStateTitle}>No notebooks yet</Text>
              <Text style={styles.emptyStateText}>Create your first notebook to get started!</Text>
              <TouchableOpacity onPress={handleAddNotebook} style={styles.createFirstButton}>
                <Text style={styles.createFirstButtonText}>Create Notebook</Text>
              </TouchableOpacity>
            </View>
          ) : (
            notebooks.map((notebook) => (
              <View key={notebook.id} style={styles.subjectBlock}>
                <TouchableOpacity
                  onPress={() => toggleExpand(notebook.id)}
                  style={styles.subjectButton}
                >
                  <MaterialCommunityIcons name="book-open-page-variant-outline" size={18} color="#2A1E1E" />
                  <Text style={styles.subjectText}>{notebook.title}</Text>
                  <MaterialCommunityIcons
                    name={expanded === notebook.id ? "chevron-up" : "chevron-down"}
                    size={20}
                    color="#2A1E1E"
                  />
                </TouchableOpacity>
                {expanded === notebook.id && (
                  <View style={styles.subMenu}>
                    <TouchableOpacity
                      style={styles.subItem}
                      onPress={() => handleNotebookPress(notebook)}
                    >
                      <MaterialCommunityIcons name="format-list-bulleted" size={18} />
                      <Text style={styles.subText}>{notebook.title} Notes</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.subItem}
                      onPress={() => handleGamesPress(notebook)}
                    >
                      <MaterialCommunityIcons name="puzzle" size={18} />
                      <Text style={styles.subText}>{notebook.title} games</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))
          )}
        </ScrollView>

        {/* Modal for Adding Notebook */}
        <Modal
          visible={isModalVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={handleCloseModal}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Add New Notebook</Text>
                <TouchableOpacity onPress={handleCloseModal}>
                  <MaterialCommunityIcons name="close" size={24} color="#2A1E1E" />
                </TouchableOpacity>
              </View>
              <AddNotebook onSuccess={handleNotebookCreated} />
            </View>
          </View>
        </Modal>

        {/* Bottom Navigation */}
        <View style={styles.bottomNav}>
          <TouchableOpacity onPress={handleAddNotebook} style={styles.navItem}>
            <MaterialCommunityIcons name="plus-box" size={24} color="#2A1E1E" />
            <Text style={styles.navText}>Add notebook</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push("/dashboard")} style={styles.navItem}>
            <MaterialCommunityIcons name="home" size={24} color="#2A1E1E" />
            <Text style={styles.navText}>Home</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push("/scanner")} style={styles.navItem}>
            <MaterialCommunityIcons name="qrcode-scan" size={24} color="#2A1E1E" />
            <Text style={styles.navText}>Scan notes</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push("/game_scores")} style={styles.navItem}>
            <MaterialCommunityIcons name="gamepad-variant-outline" size={24} color="#2A1E1E" />
            <Text style={styles.navText}>Your games</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF5DC",
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
    marginTop: 10,
  },
  header: {
    backgroundColor: "#F2A9A0",
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    gap: 10,
    borderBottomEndRadius: 10,
    borderBottomStartRadius: 10,
    marginBottom: 15,
  },
  headerText: {
    fontSize: 20,
    fontWeight: "bold",
  },
  scroll: {
    padding: 10,
    paddingBottom: 120,
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#666",
    marginTop: 20,
    marginBottom: 10,
  },
  emptyStateText: {
    fontSize: 16,
    color: "#999",
    textAlign: "center",
    marginBottom: 30,
    paddingHorizontal: 40,
  },
  createFirstButton: {
    backgroundColor: "#EF5C40",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createFirstButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  subjectBlock: {
    marginBottom: 25,
  },
  subjectButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#EF5C40",
    padding: 20,
    borderRadius: 10,
  },
  subjectText: {
    color: "#2A1E1E",
    fontWeight: "bold",
    fontSize: 16,
    flex: 1,
    marginLeft: 10,
  },
  subMenu: {
    backgroundColor: "#D8BBA9",
    padding: 10,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  subItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginVertical: 5,
    padding: 5,
  },
  subText: {
    fontSize: 15,
    fontWeight: "bold",
  },
  bottomNav: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#F2A9A0",
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 25,
    elevation: 5,
    shadowColor: "#2A1E1E",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  navItem: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  navText: {
    fontSize: 10,
    marginTop: 2,
    textAlign: "center",
    color: "#2A1E1E",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#FFF5DC",
    margin: 20,
    borderRadius: 20,
    padding: 20,
    width: "90%",
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2A1E1E",
  },
});