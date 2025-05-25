import { useAuth } from "@/context/AuthContext";
import { useNotebook } from "@/context/NotebookContext";
import { Note } from "@/interfaces/AppInterfaces";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function NotesDashboardScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { notebookId, setNotebook } = useNotebook();

  const [notes, setNotes] = useState<Note[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotes = async () => {
    if (!user || !notebookId) {
      console.log("Missing user or notebookId:", { user: !!user, notebookId });
      setLoading(false);
      return;
    }
    
    try {
      const url = `${API_URL}/users/${user.uid}/notebooks/${notebookId}/notes`;
      
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch notes: ${response.status}`);
      }
      
      const data = await response.json();
      setNotes(data);
    } catch (error) {
      console.error("Error fetching notes:", error);
      Alert.alert("Error", "Failed to load notes");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Usar useFocusEffect como en HomeScreen para recargar cuando la pantalla obtiene foco
  useFocusEffect(
    useCallback(() => {
      fetchNotes();
    }, [user, notebookId])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchNotes();
  }, [user, notebookId]);

  const toggleExpand = (noteId: string) => {
    setExpanded(prev => (prev === noteId ? null : noteId));
  };

  const handleReviewNotes = (note: Note) => {
    setNotebook(notebookId, note.id);
    router.push("/notescanned");
  };
  
  const handleReviewGames = (note: Note) => {
    setNotebook(notebookId, note.id);
    router.push("/game_scores");
  };
  
  const handleReviewSummary = (note: Note) => {
    setNotebook(notebookId, note.id);
    router.push("/dashboard");
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        <View style={[styles.container, styles.loadingContainer]}>
          <ActivityIndicator size="large" color="#EF5C40" />
          <Text style={styles.loadingText}>Loading notes...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#2A1E1E" />
          </TouchableOpacity>
          <Text style={styles.headerText}>Notes</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Content */}
        <ScrollView
          contentContainerStyle={styles.scroll}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {notes.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="note-off" size={64} color="#ccc" />
              <Text style={styles.emptyStateTitle}>No notes yet</Text>
              <Text style={styles.emptyStateText}>
                Scan and add some notes to this notebook to get started!
              </Text>
              <TouchableOpacity onPress={onRefresh} style={styles.retryButton}>
                <Text style={styles.retryButtonText}>Refresh</Text>
              </TouchableOpacity>
            </View>
          ) : (
            notes.map(note => (
              <View key={note.id} style={styles.subjectBlock}>
                <TouchableOpacity
                  style={styles.subjectButton}
                  onPress={() => toggleExpand(note.id)}
                >
                  <MaterialCommunityIcons
                    name="book-open-page-variant-outline"
                    size={18}
                    color="#2A1E1E"
                  />
                  <Text style={styles.subjectText}>{note.title}</Text>
                  <MaterialCommunityIcons
                    name={expanded === note.id ? "chevron-up" : "chevron-down"}
                    size={20}
                    color="#2A1E1E"
                  />
                </TouchableOpacity>
                {expanded === note.id && (
                  <View style={styles.subMenu}>
                    <TouchableOpacity
                      style={styles.subItem}
                      onPress={() => handleReviewNotes(note)}
                    >
                      <MaterialCommunityIcons
                        name="format-list-bulleted"
                        size={18}
                        color="#2A1E1E"
                      />
                      <Text style={styles.subText}>Review notes</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.subItem}
                      onPress={() => handleReviewGames(note)}
                    >
                      <MaterialCommunityIcons
                        name="puzzle"
                        size={18}
                        color="#2A1E1E"
                      />
                      <Text style={styles.subText}>Review games</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.subItem}
                      onPress={() => handleReviewSummary(note)}
                    >
                      <MaterialCommunityIcons
                        name="inbox-full-outline"
                        size={18}
                        color="#2A1E1E"
                      />
                      <Text style={styles.subText}>Review IA summary</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))
          )}
        </ScrollView>

        {/* Bottom Navigation */}
        <View style={styles.bottomNav}>
          <TouchableOpacity onPress={() => router.push("/dashboard")} style={styles.navItem}>
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
    justifyContent: "space-between",
    padding: 15,
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
  debugInfo: {
    backgroundColor: "#f0f0f0",
    padding: 10,
    marginBottom: 20,
    borderRadius: 5,
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
  retryButton: {
    backgroundColor: "#EF5C40",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
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
    backgroundColor: "#6C6C6C",
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
});