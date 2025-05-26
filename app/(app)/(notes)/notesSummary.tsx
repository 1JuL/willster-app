// app/notesSummary.tsx
import BottomNav from "@/components/BottomNav";
import { useAuth } from "@/context/AuthContext";
import { useNotebook } from "@/context/NotebookContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
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

export default function NotesSummaryScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { notebookId, noteId } = useNotebook();

  const [titleSummary, setTitleSummary] = useState<string>("");
  const [summary, setSummary] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [workingGames, setWorkingGames] = useState(false);
  const [hasGames, setHasGames] = useState(false);

  // 1) Carga la nota y su resumen; si no existe, avisa y regresa
  useEffect(() => {
    if (!user || !notebookId || !noteId) return;
    (async () => {
      try {
        const resp = await fetch(
          `${API_URL}/users/${user.uid}/notebooks/${notebookId}/notes/${noteId}`,
          { headers: { "Content-Type": "application/json" } }
        );
        const data = await resp.json();
        if (!resp.ok) throw new Error("Fetch failed");

        if (!data.summary) {
          Alert.alert("No summary", "This note does not yet have a summary generated.");
          router.back();
          return;
        }
        setTitleSummary(data.titleSummary || "AI Summary");
        setSummary(data.summary);

        // compruebo si existe ya un juego "memory"
        const gameResp = await fetch(
          `${API_URL}/users/${user.uid}/notebooks/${notebookId}/notes/${noteId}/games/memory`
        );
        setHasGames(gameResp.ok);
      } catch (e) {
        console.error("Error fetching summary or games:", e);
        Alert.alert("Error", "The summary and your game status could not be loaded.");
        router.back();
      } finally {
        setLoading(false);
      }
    })();
  }, [user, notebookId, noteId]);

  // 2) Al pulsar Generate games / Game Score
  const handleGames = async () => {
    if (!user) return;

    if (!hasGames) {
      setWorkingGames(true);
      const types: ("memory" | "hangman" | "quiz")[] = ["memory", "hangman", "quiz"];
      try {
        await Promise.all(
          types.map(async (type) => {
            const r = await fetch(
              `${API_URL}/users/${user.uid}/notebooks/${notebookId}/notes/${noteId}/games`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ type }),
              }
            );
            if (!r.ok) {
              console.warn(`Game ${type} skipped:`, await r.text());
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

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <StatusBar style="dark" />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#2A1E1E" />
          </TouchableOpacity>
          <Text style={styles.headerText}>{titleSummary} AI summary</Text>
        </View>

        {/* Summary Card */}
        <View style={styles.content}>
          <View style={styles.contentHeader}>
            <MaterialCommunityIcons
              name="book-open-variant"
              size={24}
              color="#2A1E1E"
              style={{ marginRight: 8 }}
            />
            <Text style={styles.textTitle}>Your {titleSummary} summary:</Text>
          </View>
          <ScrollView>
            <Text style={styles.text}>{summary}</Text>
          </ScrollView>
        </View>

        {/* Generate / Score Button */}
        <View style={styles.actions}>
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
    padding: 15,
    borderBottomEndRadius: 10,
    borderBottomStartRadius: 10,
  },
  backButton: { marginRight: 10 },
  headerText: { fontSize: 17, fontWeight: "bold", color: "#2A1E1E", paddingRight: 10 },
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
