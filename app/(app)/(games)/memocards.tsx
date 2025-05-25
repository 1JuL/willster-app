// app/games/memory/MemoryGameScreen.tsx

import { useNotebook } from "@/context/NotebookContext";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { getAuth } from "firebase/auth";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const SCREEN_WIDTH = Dimensions.get("window").width;
const NUM_COLUMNS = 2;
const CARD_SIZE = (SCREEN_WIDTH - 32 - (NUM_COLUMNS - 1) * 8) / NUM_COLUMNS;
const GAME_TIME_SEC = 60;
const API_URL = process.env.EXPO_PUBLIC_API_URL;

type CardItem = {
  id: string;
  content: string;
  pairId: string;
};

export default function MemoryGameScreen() {
  const router = useRouter();
  const { notebookId: nbId, noteId: nId } = useNotebook();

  const [cards, setCards] = useState<CardItem[]>([]);
  const [flipped, setFlipped] = useState<Set<string>>(new Set());
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(GAME_TIME_SEC);
  const [gameOver, setGameOver] = useState(false);

  const firstPick = useRef<string | null>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    async function loadCards() {
      setLoading(true);
      try {
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) throw new Error("Usuario no autenticado");

        const url = `${API_URL}/users/${user.uid}/notebooks/${nbId}/notes/${nId}/games/memory`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Error ${res.status}`);
        const json = await res.json();
        const raw: { concept: string; description: string }[] = json.data?.cards || [];

        const fallback = [
          { concept: "Apple", description: "A fruit" },
          { concept: "Dog", description: "A pet" },
          { concept: "Car", description: "A vehicle" },
        ];
        const items = raw.length ? raw : fallback;

        let deck: CardItem[] = [];
        items.forEach((item, idx) => {
          const pid = `pair-${idx}`;
          deck.push(
            { id: `${pid}-a`, pairId: pid, content: item.concept },
            { id: `${pid}-b`, pairId: pid, content: item.description }
          );
        });

        // Shuffle deck
        deck = deck
          .map((c) => ({ sort: Math.random(), card: c }))
          .sort((a, b) => a.sort - b.sort)
          .map((x) => x.card);

        setCards(deck);
        setLoading(false);
      } catch (e) {
        console.error(e);
        setLoading(false);
      }
    }
    loadCards();
  }, [nbId, nId]);

  // Timer
  useEffect(() => {
    if (loading) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          endGame();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [loading]);

  const endGame = async () => {
    setGameOver(true);
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) throw new Error("No auth");
      const pairsFound = matched.size;
      const score = pairsFound * 10 + timeLeft;
      const patchUrl = `${API_URL}/users/${user.uid}/notebooks/${nbId}/notes/${nId}/games/memory/score`;
      await fetch(patchUrl, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ score }),
      });
      Alert.alert("Juego terminado", `Tu puntaje: ${score}`, [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (e) {
      console.error(e);
    }
  };

  const onCardPress = (card: CardItem) => {
    if (gameOver || flipped.has(card.id) || matched.has(card.pairId)) return;
    setFlipped((f) => new Set(f).add(card.id));
    if (!firstPick.current) {
      firstPick.current = card.id;
      return;
    }
    const firstId = firstPick.current;
    const firstCard = cards.find((c) => c.id === firstId)!;
    if (firstCard.pairId === card.pairId) {
      setMatched((m) => new Set(m).add(card.pairId));
    } else {
      setTimeout(() => {
        setFlipped((f) => {
          const clone = new Set(f);
          clone.delete(firstId);
          clone.delete(card.id);
          return clone;
        });
      }, 800);
    }
    firstPick.current = null;

    // If all matched, end game
    if (matched.size + 1 === cards.length / 2) {
      clearInterval(timerRef.current!);
      endGame();
    }
  };

  const renderItem = ({ item }: { item: CardItem }) => {
    const isFlipped = flipped.has(item.id) || matched.has(item.pairId);
    return (
      <TouchableOpacity
        onPress={() => onCardPress(item)}
        style={[styles.card, matched.has(item.pairId) && styles.cardMatched]}
      >
        {isFlipped && <Text style={styles.cardText}>{item.content}</Text>}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#F4AB9C" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.screen}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Memo Cards</Text>
          <Text style={styles.timer}>{timeLeft}s</Text>
        </View>

        <FlatList
          data={cards}
          keyExtractor={(c) => c.id}
          renderItem={renderItem}
          numColumns={NUM_COLUMNS}
          contentContainerStyle={styles.list}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  screen: { flex: 1, backgroundColor: "#FEF3D9" },
  header: {
    flexDirection: "row",
    padding: 12,
    backgroundColor: "#F4AB9C",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: { fontSize: 18, fontWeight: "700" },
  timer: { fontSize: 16, fontWeight: "600" },
  list: {
    padding: 8,
    justifyContent: "center",
  },
  card: {
    width: CARD_SIZE,
    height: CARD_SIZE,
    margin: 4,
    backgroundColor: "#FEF6E8",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  cardMatched: {
    opacity: 0.5,
  },
  cardText: {
    textAlign: "center",
    padding: 4,
    fontSize: 14,
    color: "#000",
  },
  loader: { flex: 1, alignItems: "center", justifyContent: "center" },
});
