// app/notescanned.tsx
import BottomNav from "@/components/BottomNav";
import { useAuth } from "@/context/AuthContext";
import { useNotebook } from "@/context/NotebookContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function NoteScannedScreen() {
  const router = useRouter();
  const { isNew } = useLocalSearchParams<{ isNew?: string }>();
  const justScanned = isNew === "true";

  const { user } = useAuth();
  const { notebookId, noteId } = useNotebook();

  const [note, setNote] = useState<{
    title: string;
    content: string;
    summary?: string;
    titleSummary?: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasGames, setHasGames] = useState(false);
  const [workingSummary, setWorkingSummary] = useState(false);
  const [workingGames, setWorkingGames] = useState(false);

  // 1) Carga la nota y detecta si ya existen juegos
  useEffect(() => {
    if (!user || !notebookId || !noteId) return;
    (async () => {
      try {
        // Cargo la nota
        const noteResp = await fetch(
          `${API_URL}/users/${user.uid}/notebooks/${notebookId}/notes/${noteId}`,
          { headers: { "Content-Type": "application/json" } }
        );
        if (!noteResp.ok) throw new Error("Fetch note failed");
        const noteData = await noteResp.json();
        setNote(noteData);

        // Intento obtener el juego "memory" para ver si hay al menos uno
        const gameResp = await fetch(
          `${API_URL}/users/${user.uid}/notebooks/${notebookId}/notes/${noteId}/games/memory`,
          { method: "GET" }
        );
        setHasGames(gameResp.ok);
      } catch (e) {
        console.error("Error fetching note or games:", e);
        Alert.alert("Error", "The note or its games could not be loaded.");
      } finally {
        setLoading(false);
      }
    })();
  }, [user, notebookId, noteId]);

  // 2) Generar o ver resumen
  const handleSummary = async () => {
    if (!note || !user) return;
    if (note.summary) {
      router.push("/notesSummary");
      return;
    }
    setWorkingSummary(true);
    try {
      const resp = await fetch(
        `${API_URL}/users/${user.uid}/notebooks/${notebookId}/notes/${noteId}/resumen`,
        { method: "PATCH", headers: { "Content-Type": "application/json" } }
      );
      if (!resp.ok) {
        const err = await resp.json();
        throw new Error(err.message || "Summary failed");
      }
      const updated = await resp.json();
      setNote((n) =>
        n ? { ...n, summary: updated.summary, titleSummary: updated.titleSummary } : n
      );
      router.push("/notesSummary");
    } catch (e: any) {
      console.error("Error generating summary:", e);
      Alert.alert("Error", e.message || "The summary could not be generated.");
    } finally {
      setWorkingSummary(false);
    }
  };

  // 3) Generar o ir a game_scores / game_selection
  const handleGames = async () => {
    if (!user) return;

    // Si es nota nueva, genero los 3 juegos y voy a selección
    if (!hasGames) {
      setWorkingGames(true);
      const types: ("memory" | "hangman" | "quiz")[] = ["memory", "hangman", "quiz"];
      try {
        await Promise.all(
          types.map(async (type) => {
            const resp = await fetch(
              `${API_URL}/users/${user.uid}/notebooks/${notebookId}/notes/${noteId}/games`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ type }),
              }
            );
            if (!resp.ok) {
              console.warn(`Game ${type} skipped:`, await resp.text());
            }
          })
        );
        router.push("/game_selection");
      } catch (e) {
        console.error("Error generating games:", e);
        Alert.alert("Error", "Game generation failed.");
      } finally {
        setWorkingGames(false);
      }
    } else {
      // Ya existían, voy directo al score
      router.push("/game_scores");
    }
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#EF5C40" />
      </View>
    );
  }
  if (!note) {
    return (
      <View style={styles.loader}>
        <Text>The note was not found.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <StatusBar style="dark" />
      <View style={styles.container}>
        {/* header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => (justScanned ? router.push("/dashboard") : router.back())}
            style={styles.backButton}
          >
            <MaterialCommunityIcons name="arrow-left" size={22} color="#2A1E1E" />
          </TouchableOpacity>
          <Text style={styles.headerText}>
            {justScanned ? "New Scanned Note" : `${note.title} notes`}
          </Text>
        </View>

        {/* contenido */}
        <View style={styles.content}>
          <View style={styles.contentHeader}>
            <MaterialCommunityIcons
              name="book-open-page-variant-outline"
              size={24}
              color="#2A1E1E"
              style={{ marginRight: 8 }}
            />
            <Text style={styles.textTitle}>{note.title}:</Text>
          </View>
          <ScrollView>
            <Text style={styles.text}>{note.content}</Text>
          </ScrollView>
        </View>

        {/* botones generar */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.btn} onPress={handleSummary} disabled={workingSummary}>
            {workingSummary ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.btnText}>
                {note.summary ? "See AI summary" : "Generate AI summary"}
              </Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.btn} onPress={handleGames} disabled={workingGames}>
            {workingGames ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.btnText}>{hasGames ? "Game Score" : "Generate games"}</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Bottom Navigation */}
        <BottomNav />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
  container: { flex: 1, backgroundColor: "#FFF5DC" },
  header: {
    backgroundColor: "#F2A9A0",
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderBottomEndRadius: 10,
    borderBottomStartRadius: 10,
  },
  backButton: { marginRight: 10 },
  headerText: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#2A1E1E",
    paddingRight: 10,
    textAlign: "center",
  },
  content: {
    flex: 1,
    backgroundColor: "#D2BFA6",
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 50,
    borderRadius: 12,
    padding: 15,
  },
  contentHeader: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  textTitle: { fontSize: 20, fontWeight: "bold", color: "#2A1E1E", padding: 5 },
  text: {
    fontSize: 14,
    lineHeight: 20,
    color: "#2A1E1E",
    fontWeight: "bold",
    textAlign: "justify",
  },
  actions: { flexDirection: "row", justifyContent: "space-around", marginBottom: 130 },
  btn: {
    backgroundColor: "#F2A9A0",
    padding: 10,
    borderRadius: 8,
    minWidth: 110,
    alignSelf: "center",
  },
  btnText: { color: "#2A1E1E", fontWeight: "bold", fontSize: 12, textAlign: "center" },
});
