// app/game_scores.tsx
import BottomNav from "@/components/BottomNav";
import { useAuth } from "@/context/AuthContext";
import { useNotebook } from "@/context/NotebookContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
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
import Svg, { Circle } from "react-native-svg";

interface GameInfo {
  type: "quiz" | "hangman" | "memory";
  title: string;
  icon: string;
  score: number;
}

// Mapeo de tipo de juego a ruta de pantalla
const routeMap = {
  memory: "/memocards",
  hangman: "/hangedman",
  quiz: "/quiz",
} as const;

const Donut = ({ percentage }: { percentage: number }) => {
  const size = 40;
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - percentage / 100);

  return (
    <Svg width={size} height={size}>
      {/* fondo rojo */}
      <Circle stroke="#e74c3c" cx={size / 2} cy={size / 2} r={radius} strokeWidth={strokeWidth} />
      {/* porción verde */}
      <Circle
        stroke="#2ecc71"
        cx={size / 2}
        cy={size / 2}
        r={radius}
        strokeWidth={strokeWidth}
        strokeDasharray={[circumference, circumference]}
        strokeDashoffset={dashOffset}
        rotation="-90"
        origin={[size / 2, size / 2]}
      />
    </Svg>
  );
};

export default function GameScoresScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { notebookId, noteId } = useNotebook();
  const [loading, setLoading] = useState(true);
  const [noteTitle, setNoteTitle] = useState("Games");
  const [games, setGames] = useState<GameInfo[]>([]);

  useEffect(() => {
    if (!user || !notebookId || !noteId) return;

    const types: GameInfo["type"][] = ["quiz", "hangman", "memory"];
    const iconMap: Record<GameInfo["type"], string> = {
      quiz: "book-open-variant",
      hangman: "gamepad-variant-outline",
      memory: "memory",
    };

    async function loadAll() {
      setLoading(true);
      try {
        // 1) Traer título de la nota
        if (!user) throw new Error("User is null");
        const noteResp = await fetch(
          `${process.env.EXPO_PUBLIC_API_URL}/users/${user.uid}/notebooks/${notebookId}/notes/${noteId}`,
          { headers: { "Content-Type": "application/json" } }
        );
        if (!noteResp.ok) throw new Error("Note fetch failed");
        const noteData = await noteResp.json();
        setNoteTitle(noteData.title);

        // 2) Para cada tipo, consultar el juego y extraer score
        const fetched: GameInfo[] = await Promise.all(
          types.map(async (type) => {
            const resp = await fetch(
              `${process.env.EXPO_PUBLIC_API_URL}/users/${user.uid}/notebooks/${notebookId}/notes/${noteId}/games/${type}`
            );
            if (!resp.ok) {
              return {
                type,
                title: type[0].toUpperCase() + type.slice(1),
                icon: iconMap[type],
                score: 0,
              };
            }
            const data = await resp.json();
            const parsedScore = Number(data.score);
            return {
              type,
              title: type[0].toUpperCase() + type.slice(1),
              icon: iconMap[type],
              score: isNaN(parsedScore) ? 0 : parsedScore,
            };
          })
        );

        setGames(fetched);
      } catch (e) {
        console.error("Error loading games:", e);
        Alert.alert("Error", "Game scores could not be loaded. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    loadAll();
  }, [user, notebookId, noteId]);

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
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerText}>
          {noteTitle}
          {"\n"}Games
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {games.map((g) => (
          <View key={g.type} style={styles.card}>
            {/* Card Header */}
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons name={g.icon as any} size={20} color="#2A1E1E" />
              <Text style={styles.cardTitle}>{g.title}</Text>
            </View>

            {/* Card Body */}
            <View style={styles.cardBody}>
              <View style={styles.cardBodyLeft}>
                {/* Try again, mapea al route adecuado */}
                <TouchableOpacity
                  style={styles.retryRow}
                  onPress={() => router.push(routeMap[g.type])}
                >
                  <MaterialCommunityIcons name="repeat" size={18} color="#2A1E1E" />
                  <Text style={styles.cardText}>Try again</Text>
                </TouchableOpacity>

                {/* Score display */}
                <View style={styles.cardRow}>
                  <MaterialCommunityIcons name="flag-checkered" size={18} color="#2A1E1E" />
                  <Text style={styles.cardText}>You got a score of: {g.score}</Text>
                </View>
              </View>
              <Donut percentage={g.score} />
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomNav />
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
    justifyContent: "space-between",
    padding: 15,
    borderBottomEndRadius: 10,
    borderBottomStartRadius: 10,
  },
  backButton: { padding: 4 },
  headerText: {
    fontSize: 17,
    fontWeight: "bold",
    textAlign: "center",
    lineHeight: 22,
  },
  scroll: { padding: 20, paddingBottom: 140 },
  card: {
    marginBottom: 20,
    backgroundColor: "#FFE48F",
    borderRadius: 12,
    overflow: "hidden",
  },
  cardHeader: {
    backgroundColor: "#E4B800",
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
  },
  cardTitle: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "bold",
    color: "#2A1E1E",
  },
  cardBody: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
  },
  cardBodyLeft: { flex: 1 },
  retryRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  cardText: { marginLeft: 8, color: "#2A1E1E", fontSize: 14 },
});
