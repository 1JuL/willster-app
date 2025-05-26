import BottomNav from "@/components/BottomNav";
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
  TextInput,
  TouchableOpacity,
  View
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
  const [renameModalVisible, setRenameModalVisible] = useState(false);
  const [renameTarget, setRenameTarget] = useState<Notebook | null>(null);
  const [renameTitle, setRenameTitle] = useState("");

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

  const handleNotebookPress = (notebook: Notebook) => {
    setNotebook(notebook.id, "");
    router.push("/notesdashboard");
  };

  const handleDeleteNotebook = (nb: Notebook) => {
    Alert.alert(
      "Delete Notebook",
      `¿Are you sure you want to delete this notebook "${nb.title}"? This will delete al your notes and games. This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              const resp = await fetch(
                `${API_URL}/users/${user!.uid}/notebooks/${nb.id}`,
                { method: "DELETE", headers: { "Content-Type": "application/json" } }
              );
              if (!resp.ok) {
                const err = await resp.text();
                throw new Error(err || "Delete failed");
              }
              // Si eliminó, recargamos lista y cerramos expansión
              fetchNotebooks();
              setExpanded(null);
            } catch (e: any) {
              console.error(e);
              Alert.alert("Error", e.message || "No se pudo eliminar el notebook");
            }
          },
        },
      ]
    );
  };

  const openRename = (nb: Notebook) => {
    setRenameTarget(nb);
    setRenameTitle(nb.title);
    setRenameModalVisible(true);
  };

  const handleSaveRename = async () => {
      if (!renameTarget) return;
      try {
        const resp = await fetch(
          `${API_URL}/users/${user!.uid}/notebooks/${renameTarget.id}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title: renameTitle.trim() }),
          }
        );
        if (!resp.ok) {
          const err = await resp.text();
          throw new Error(err || "Rename failed");
        }
        setRenameModalVisible(false);
        fetchNotebooks();
        setExpanded(null);
      } catch (e: any) {
        console.error(e);
        Alert.alert("Error", e.message);
      }
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
                      onPress={() => openRename(notebook)}
                    >
                      <MaterialCommunityIcons name="pencil-outline" size={18}/>
                      <Text style={styles.subText}>Rename Notebook</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.subItem}
                      onPress={() => handleDeleteNotebook(notebook)}
                    >
                      <MaterialCommunityIcons name="delete-outline" size={18} />
                      <Text style={styles.subText}>Delete Notebook</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))
          )}
        </ScrollView>
        {/* Rename Notebook Modal */}
        <Modal visible={renameModalVisible} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Rename Notebook</Text>
                <TouchableOpacity onPress={() => setRenameModalVisible(false)}>
                  <MaterialCommunityIcons name="close" size={24} color="#2A1E1E"/>
                </TouchableOpacity>
              </View>
              <TextInput
                style={styles.input}
                value={renameTitle}
                onChangeText={setRenameTitle}
                placeholder="New title..."
              />
              <View style={styles.renameActions}>
                <TouchableOpacity
                  onPress={() => setRenameModalVisible(false)}
                  style={styles.cancelBtn}
                >
                  <Text>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleSaveRename}
                  style={[styles.saveBtn, !renameTitle.trim() && { opacity: 0.5 }]}
                  disabled={!renameTitle.trim()}
                >
                  <Text style={styles.saveText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
        {/* Bottom Navigation */}
        <BottomNav onNotebookAdded={fetchNotebooks} /> 
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
    justifyContent: "center",
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
  /* Modal styles */
  modalOverlay: {
    flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#FFF5DC", width: "80%", borderRadius: 20, padding: 20,
  },
  modalHeader: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10,
  },
  modalTitle: { fontSize: 18, fontWeight: "bold", color: "#2A1E1E" },
  input: {
    borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 10, backgroundColor: "white",
  },
  renameActions: { flexDirection: "row", justifyContent: "flex-end", marginTop: 15 },
  cancelBtn: { marginRight: 15 },
  saveBtn: { backgroundColor: "#4CAF50", paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 },
  saveText: { color: "white", fontWeight: "bold" },
});