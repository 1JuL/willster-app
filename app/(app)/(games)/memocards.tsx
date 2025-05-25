// app/games/memory/MemoryGameScreen.tsx

import { useNotebook } from "@/context/NotebookContext";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { getAuth } from "firebase/auth";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

const SCREEN_WIDTH = Dimensions.get("window").width;
const NUM_COLUMNS = 2;
const CARD_SIZE = (SCREEN_WIDTH - 32 - (NUM_COLUMNS - 1) * 8) / NUM_COLUMNS;
const GAME_TIME_SEC = 65;
const API_URL = process.env.EXPO_PUBLIC_API_URL;

type CardItem = {
  id: string;
  content: string;
  pairId: string;
};

const CARD_COLORS = [
  "#B0E0E6", // Powder Blue (un azul muy suave y fresco)
  "#ADD8E6", // Light Blue (un azul cielo pálido)
  "#90EE90", // Light Green (un verde menta muy claro)
  "#FFB6C1", // Light Pink (un rosa claro y delicado)
  "#DDA0DD", // Plum (un violeta muy pálido, casi lila)
  "#AFEEEE", // Pale Turquoise (un turquesa muy suave y algo verdoso)
  "#F08080", // Light Coral (un rosa rojizo muy tenue)
  "#87CEFA", // Light Sky Blue (un azul ligeramente más saturado que Powder Blue)
  "#CCEEFF", // Periwinkle (un azul-violeta muy claro)
  "#D8BFD8", // Thistle (un lila grisáceo muy suave)
];

const TIMER_INTERVAL = 1000;

export default function MemoryGameScreen() {
  const router = useRouter();
  const { notebookId: nbId, noteId: nId } = useNotebook();

  const [cards, setCards] = useState<CardItem[]>([]);
  const [flipped, setFlipped] = useState<Set<string>>(new Set());
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(GAME_TIME_SEC);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [won, setWon] = useState(false);

  const flatListRef = useRef<FlatList>(null);
  const [listHeight, setListHeight] = useState(0);
  const [contentHeight, setContentHeight] = useState(0);
  const [hasShownScrollReminder, setHasShownScrollReminder] = useState(false);

  const firstPick = useRef<string | null>(null);
  const timerRef = useRef<NodeJS.Timeout | number | null>(null);

  const loadAndShuffleCards = async () => {
    setLoading(true);
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) throw new Error("No auth");

      const res = await fetch(
        `${API_URL}/users/${user.uid}/notebooks/${nbId}/notes/${nId}/games/memory`
      );
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const json = await res.json();
      const raw = json.data?.cards;

      let deck: CardItem[] = [];
      raw.forEach((item: { concept: any; description: any }, idx: any) => {
        const pid = `pair-${idx}`;
        deck.push(
          { id: `${pid}-a`, pairId: pid, content: item.concept },
          { id: `${pid}-b`, pairId: pid, content: item.description }
        );
      });

      deck = deck
        .map((c) => ({ sort: Math.random(), card: c }))
        .sort((a, b) => a.sort - b.sort)
        .map((x) => x.card);

      setCards(deck);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAndShuffleCards();
  }, [nbId, nId]);

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
    }, TIMER_INTERVAL);
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current as NodeJS.Timeout);
      }
    };
  }, [loading]);

  useEffect(() => {
    // Solo si el juego está cargado y aún no hemos mostrado el recordatorio
    if (
      !loading &&
      cards.length > 0 &&
      !hasShownScrollReminder &&
      contentHeight > listHeight &&
      listHeight > 0
    ) {
      Toast.show({
        type: "info",
        text1: "¡Recuerda Hay más cartas!",
        text2: "Desliza hacia abajo para verlas todas.",
        position: "top",
        visibilityTime: 3500,
        autoHide: true,
        topOffset: 450,
        bottomOffset: 40,
      });
      setHasShownScrollReminder(true); // Marcar que ya se mostró
    }
  }, [loading, cards, listHeight, contentHeight, hasShownScrollReminder]);

  const patchScore = async (finalScore: number) => {
    try {
      const user = getAuth().currentUser;
      if (!user) return;
      const url = `${API_URL}/users/${user.uid}/notebooks/${nbId}/notes/${nId}/games/memory/score`;
      await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ score: finalScore }),
      });
    } catch (e) {
      console.error(e);
    }
  };

  const endGame = async () => {
    setGameOver(true);
    const pairs = matched.size;
    let calculatedScore = 0;
    if (pairs > 0) {
      calculatedScore = pairs * 10 + timeLeft;
    }
    setScore(calculatedScore);
    setWon(pairs === cards.length / 2);
    await patchScore(calculatedScore);
    setModalVisible(true);
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

    if (matched.size + 1 === cards.length / 2) {
      clearInterval(timerRef.current!);
      endGame();
    }
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#F4AB9C" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
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
          renderItem={({ item, index }) => {
            const isFlipped = flipped.has(item.id) || matched.has(item.pairId);
            const bgColor = CARD_COLORS[index % CARD_COLORS.length];
            return (
              <TouchableOpacity
                onPress={() => onCardPress(item)}
                style={[
                  styles.card,
                  { backgroundColor: bgColor },
                  matched.has(item.pairId) && styles.cardMatched,
                ]}
              >
                {isFlipped ? (
                  <Text style={styles.cardText}>{item.content}</Text>
                ) : (
                  <Image
                    source={require("@/assets/images/will-think.png")}
                    style={styles.cardBackImage}
                  />
                )}
              </TouchableOpacity>
            );
          }}
          numColumns={NUM_COLUMNS}
          contentContainerStyle={styles.list}
          onLayout={(event) => {
            setListHeight(event.nativeEvent.layout.height);
          }}
          onContentSizeChange={(w, h) => {
            setContentHeight(h);
          }}
        />
      </View>

      <Toast />

      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Image
              source={
                won
                  ? require("@/assets/images/will-congrats.png")
                  : require("@/assets/images/will-lose.png")
              }
              style={styles.modalImage}
            />
            <Text style={styles.modalText}>You got {score} points</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={async () => {
                  await patchScore(score);
                  setFlipped(new Set());
                  setMatched(new Set());
                  setTimeLeft(GAME_TIME_SEC);
                  setGameOver(false);
                  setModalVisible(false);
                  setHasShownScrollReminder(false);
                  await loadAndShuffleCards();
                }}
              >
                <Text>Try again</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={async () => {
                  await patchScore(score);
                  router.back();
                }}
              >
                <Text>Main menu</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// styles unchanged

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
    backgroundColor: "#b9ffa4",
  },
  cardText: {
    textAlign: "center",
    padding: 4,
    fontSize: 14,
    color: "#000",
  },
  loader: { flex: 1, alignItems: "center", justifyContent: "center" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: "#FFEAA4",
    borderRadius: 12,
    alignItems: "center",
  },
  modalImage: {
    width: 150,
    height: 150,
    marginBottom: 10,
    resizeMode: "contain",
  },
  modalText: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 5,
    paddingVertical: 10,
    backgroundColor: "#F4AB9C",
    borderRadius: 8,
    alignItems: "center",
  },
  cardBackImage: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
    borderRadius: 8,
  },
});
