// app/games/quiz/QuizGameScreen.tsx

import { useNotebook } from "@/context/NotebookContext";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
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
const POINTS_PER = 10;

type Question = {
  question: string;
  options: string[];
  answer: string;
};

export default function QuizGameScreen() {
  const router = useRouter();
  const { notebookId: nbId, noteId: nId } = useNotebook();

  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [won, setWon] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const user = getAuth().currentUser;
        if (!user) throw new Error("No auth");
        const res = await fetch(
          `${API_URL}/users/${user.uid}/notebooks/${nbId}/notes/${nId}/games/quiz`
        );
        if (!res.ok) throw new Error(`Error ${res.status}`);
        const json = await res.json();
        setQuestions(json.data.questions);
      } catch (e: any) {
        alert(e.message);
        router.back();
      } finally {
        setLoading(false);
      }
    })();
  }, [nbId, nId]);

  const patchScore = async (finalScore: number) => {
    try {
      const user = getAuth().currentUser;
      if (!user) return;
      const url = `${API_URL}/users/${user.uid}/notebooks/${nbId}/notes/${nId}/games/quiz/score`;
      await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ score: finalScore }),
      });
    } catch (e) {
      console.error(e);
    }
  };

  const finish = async () => {
    const finalScore = score;
    const maxPossibleScore = questions.length * POINTS_PER;
    const winThreshold = maxPossibleScore * 0.7;
    setWon(finalScore >= winThreshold);
    await patchScore(finalScore);
    setModalVisible(true);
  };

  const onOption = (optionIndex: number) => {
    if (showAnswer) return;
    setSelected(optionIndex);
    setShowAnswer(true);
    const q = questions[idx];
    const letter = ["a", "b", "c", "d"][optionIndex];
    if (letter === q.answer) {
      setScore((s) => s + POINTS_PER);
    }
    setTimeout(() => {
      if (idx + 1 < questions.length) {
        setIdx(idx + 1);
        setSelected(null);
        setShowAnswer(false);
      } else {
        finish();
      }
    }, 1500);
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#F4AB9C" />
      </View>
    );
  }

  const current = questions[idx];

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Quiz</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <Text style={styles.qText}>{current.question}</Text>
        <FlatList
          data={current.options}
          keyExtractor={(_, i) => String(i)}
          renderItem={({ item, index }) => {
            const isSelected = index === selected;
            const correctIndex = ["a", "b", "c", "d"].indexOf(current.answer);
            let bg = "#FEF6E8";
            if (showAnswer && isSelected) {
              bg = index === correctIndex ? "#d4edda" : "#f8d7da";
            }
            return (
              <TouchableOpacity
                style={[styles.optionButton, { backgroundColor: bg }]}
                onPress={() => onOption(index)}
                disabled={showAnswer}
              >
                <Text style={styles.optionText}>
                  {String.fromCharCode(65 + index)}. {item}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
        <Text style={styles.score}>Score: {score}</Text>
      </View>

      <View style={styles.bottomImageContainer}>
        <Image source={require("@/assets/images/will-think2.png")} style={styles.bottomImage} />
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
                  await patchScore(score);
                  setIdx(0);
                  setScore(0);
                  setSelected(null);
                  setShowAnswer(false);
                  setModalVisible(false);
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FEF3D9" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F4AB9C",
    padding: 12,
    justifyContent: "space-between",
  },
  headerTitle: { fontSize: 20, fontWeight: "700" },
  content: { flex: 1, padding: 16 },
  qText: { fontSize: 18, marginBottom: 20 },
  optionButton: {
    padding: 12,
    marginVertical: 6,
    borderRadius: 8,
  },
  optionText: { fontSize: 16 },
  score: { marginTop: 20, fontSize: 28, textAlign: "center", fontWeight: "700" },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
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
  modalImage: { width: 150, height: 150, marginBottom: 10, resizeMode: "contain" },
  modalText: { fontSize: 20, fontWeight: "600", marginBottom: 20 },
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
  bottomImage: {
    width: 350,
    height: 350,
    resizeMode: "contain",
  },
  bottomImageContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "flex-end",
    paddingRight: 0,
    marginRight: 0,
    paddingBottom: 10,
  },
});
