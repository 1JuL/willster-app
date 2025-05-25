// app/notescanned.tsx
import { useAuth } from "@/context/AuthContext";
import { useNotebook } from "@/context/NotebookContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

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
        Alert.alert("Error", "No se pudo cargar la nota o sus juegos.");
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
        throw new Error(err.message || "Resumen falló");
      }
      const updated = await resp.json();
      setNote(n => n ? { ...n, summary: updated.summary, titleSummary: updated.titleSummary } : n);
      router.push("/notesSummary");
    } catch (e: any) {
      console.error("Error generating summary:", e);
      Alert.alert("Error", e.message || "No se pudo generar el resumen.");
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
          types.map(async type => {
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
        Alert.alert("Error", "Falló la generación de juegos.");
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
        <Text>No se encontró la nota.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => justScanned ? router.push("/dashboard") : router.back()}
          style={styles.backButton}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="black" />
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
        <Text style={styles.text}>{note.content}</Text>
      </View>

      {/* botones generar */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.btn}
          onPress={handleSummary}
          disabled={workingSummary}
        >
          {workingSummary
            ? <ActivityIndicator color="white" />
            : <Text style={styles.btnText}>
                {note.summary ? "See AI summary" : "Generate AI summary"}
              </Text>
          }
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.btn}
          onPress={handleGames}
          disabled={workingGames}
        >
          {workingGames
            ? <ActivityIndicator color="white" />
            : <Text style={styles.btnText}>
                {hasGames ? "Game Score" : "Generate games"}
              </Text>
          }
        </TouchableOpacity>
      </View>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity onPress={() => router.push("/dashboard")} style={styles.navItem}>
          <MaterialCommunityIcons name="plus-box" size={24} color="black" />
          <Text style={styles.navText}>Add notebook</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push("/dashboard")} style={styles.navItem}>
          <MaterialCommunityIcons name="home" size={24} color="black" />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push("/scanner")} style={styles.navItem}>
          <MaterialCommunityIcons name="qrcode-scan" size={24} color="black" />
          <Text style={styles.navText}>Scan notes</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push("/game_scores")} style={styles.navItem}>
          <MaterialCommunityIcons name="gamepad-variant-outline" size={24} color="black" />
          <Text style={styles.navText}>Your games</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
  container: { flex: 1, backgroundColor: "#FFF5DC" },
  header: {
    backgroundColor: "#F2A9A0",
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    paddingTop: 50,
  },
  backButton: { marginRight: 10 },
  headerText: { fontSize: 20, fontWeight: "bold", color: "black" },
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
  textTitle: { fontSize: 20, fontWeight: "bold", color: "#2A1E1E", padding: 10 },
  text: { fontSize: 14, lineHeight: 20, color: "#2A1E1E", fontWeight: "bold", textAlign: "justify" },
  actions: { flexDirection: "row", justifyContent: "space-around", marginBottom: 130 },
  btn: { backgroundColor: "#F2A9A0", padding: 10, borderRadius: 8, minWidth: 110, alignSelf: "center" },
  btnText: { color: "#2A1E1E", fontWeight: "bold", fontSize: 12, textAlign: "center" },
  bottomNav: {
    position: "absolute", bottom: 20, left: 20, right: 20,
    flexDirection: "row", justifyContent: "space-around",
    backgroundColor: "#F2A9A0", paddingVertical: 12, paddingHorizontal: 10,
    borderRadius: 25, elevation: 5, shadowColor: "#2A1E1E",
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84,
  },
  navItem: { flex: 1, alignItems: "center", justifyContent: "center" },
  navText: { fontSize: 10, marginTop: 2, color: "black" },
});