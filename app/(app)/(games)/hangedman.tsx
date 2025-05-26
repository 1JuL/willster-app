// app/games/hangedman/HangmanGameScreen.tsx

import { useNotebook } from "@/context/NotebookContext";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { getAuth } from "firebase/auth";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const API_URL = process.env.EXPO_PUBLIC_API_URL;
const MAX_LIVES = 8;

export default function Hangedman() {
  const router = useRouter();
  const { notebookId: nbId, noteId: nId } = useNotebook();
  const [loading, setLoading] = useState(true);
  const [words, setWords] = useState<string[]>([]);
  const [idx, setIdx] = useState(0);
  const [lives, setLives] = useState(MAX_LIVES);
  const [guessed, setGuessed] = useState<Set<string>>(new Set());
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [won, setWon] = useState(false);

  // Fetch words
  useEffect(() => {
    (async () => {
      try {
        const user = getAuth().currentUser;
        if (!user) throw new Error("No auth");
        const res = await fetch(
          `${API_URL}/users/${user.uid}/notebooks/${nbId}/notes/${nId}/games/hangman`
        );
        if (!res.ok) throw new Error(`Error ${res.status}`);
        const json = await res.json();
        setWords(json.data?.words.map((w: any) => w.word.toUpperCase()) || []);
      } catch (e: any) {
        alert(e.message);
        router.back();
      } finally {
        setLoading(false);
      }
    })();
  }, [nbId, nId]);

  const word = words[idx] || "";
  const isComplete = word.split("").every((ch) => guessed.has(ch));

  // handle letter guess
  const onGuess = (letter: string) => {
    if (gameOver || guessed.has(letter)) return;
    setGuessed((g) => new Set(g).add(letter));
    if (!word.includes(letter)) setLives((l) => l - 1);
  };

  // next or end
  useEffect(() => {
    if (!loading && isComplete) {
      setScore((s) => s + 20);
      if (idx + 1 < words.length) {
        setIdx(idx + 1);
        setGuessed(new Set());
      } else finishGame(true);
    }
  }, [isComplete]);

  // check lives
  useEffect(() => {
    if (lives <= 0) finishGame(false);
  }, [lives]);

  const patchScore = async () => {
    try {
      const user = getAuth().currentUser;
      if (!user) return;
      const url = `${API_URL}/users/${user.uid}/notebooks/${nbId}/notes/${nId}/games/hangman/score`;
      await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ score }),
      });
    } catch (e) {
      console.error(e);
    }
  };

  const finishGame = async (didWin: boolean) => {
    setGameOver(true);
    setWon(didWin);
    await patchScore();
    setModalVisible(true);
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#F4AB9C" />
      </View>
    );
  }

  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <StatusBar style="dark" />
      <View style={styles.screen}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Hanged-man</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.imageContainer}>
          <Image source={require("@/assets/images/will-worried.png")} style={styles.imageHeader} />
          <Image source={require("@/assets/images/hanged-man.png")} style={styles.imageHeader} />
        </View>

        <Text style={styles.title}>Hanged-man</Text>
        <Text style={styles.subtitle}>
          Word {idx + 1} of {words.length}
        </Text>
        <Text style={styles.lives}>Lives: {lives}</Text>

        <View style={styles.wordContainer}>
          {word.split("").map((ch, i) => (
            <Text key={i} style={styles.letter}>
              {guessed.has(ch) || gameOver ? ch : "_"}
            </Text>
          ))}
        </View>

        <FlatList
          data={letters}
          keyExtractor={(l) => l}
          numColumns={7}
          contentContainerStyle={styles.letters}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.letterBox, guessed.has(item) && styles.letterBoxDisabled]}
              onPress={() => onGuess(item)}
              disabled={guessed.has(item) || gameOver}
            >
              <Text style={styles.letterBoxText}>{item}</Text>
            </TouchableOpacity>
          )}
        />

        <Text style={styles.score}>Score: {score}</Text>
      </View>
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
                  await patchScore();
                  setIdx(0);
                  setLives(MAX_LIVES);
                  setGuessed(new Set());
                  setScore(0);
                  setGameOver(false);
                  setModalVisible(false);
                }}
              >
                <Text>Try again</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={async () => {
                  await patchScore();
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FEF3D9",
  },
  screen: { flex: 1, backgroundColor: "#FEF3D9" },
  imageContainer: {
    flex: 1,
    flexDirection: "row",
    marginTop: 50,
    marginBottom: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    backgroundColor: "#F4AB9C",
    alignItems: "center",
    padding: 15,
    borderBottomEndRadius: 10,
    borderBottomStartRadius: 10,
  },
  headerTitle: { fontSize: 18, fontWeight: "700", marginLeft: 130 },
  imageHeader: {
    width: 180,
    height: 180,
    resizeMode: "contain",
    alignSelf: "center",
  },
  title: { fontSize: 24, fontWeight: "700", textAlign: "center" },
  subtitle: { fontSize: 16, textAlign: "center", marginBottom: 8, marginTop: 8 },
  lives: { fontSize: 20, textAlign: "center", marginBottom: 16, fontWeight: "600" },
  wordContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 20,
  },
  letter: { fontSize: 32, marginHorizontal: 4 },
  letters: { alignItems: "center", justifyContent: "center" },
  letterBox: {
    width: 45,
    height: 45,
    margin: 4,
    backgroundColor: "#FEF6E8",
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  letterBoxDisabled: { backgroundColor: "#DDD" },
  letterBoxText: { fontSize: 18, fontWeight: "700" },
  score: { fontSize: 28, textAlign: "center", marginBottom: 50, fontWeight: "700" },
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
});
