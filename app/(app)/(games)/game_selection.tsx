// app/game_selection.tsx

import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function GameSelection() {
  const router = useRouter();

  const games: {
    key: string;
    title: string;
    image: any;
    route: any;
    bg: string;
  }[] = [
    {
      key: "memo",
      title: "Memo Cards",
      image: require("@/assets/images/will-cards.png"),
      route: "/memocards",
      bg: "#FEF4D4",
    },
    {
      key: "hanged-man",
      title: "Hanged Man",
      image: require("@/assets/images/will-hangedman.png"),
      route: "/hangedman",
      bg: "#FEF1C5",
    },
    {
      key: "quiz",
      title: "Quiz",
      image: require("@/assets/images/will-quiz.png"),
      route: "/quiz",
      bg: "#FFF5C7",
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Learning Games</Text>
        <View style={styles.backButton} />
      </View>

      {/* Game cards */}
      <View style={styles.list}>
        {games.map((game) => (
          <View key={game.key} style={styles.cardWrapper}>
            <Text style={styles.cardTitle}>{game.title}</Text>
            <TouchableOpacity
              style={[styles.card, { backgroundColor: game.bg }]}
              onPress={() => router.push(game.route)}
            >
              <Image source={game.image} style={styles.cardImage} />
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </SafeAreaView>
  );
}

const PAGE_BG = "#FEF3D9";
const HEADER_BG = "#F4AB9C";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PAGE_BG,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: HEADER_BG,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  backButton: {
    width: 24,
    alignItems: "center",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "700",
    color: "#000",
  },
  list: {
    flex: 1,
    padding: 16,
  },
  cardWrapper: {
    marginBottom: 24,
    alignItems: "center",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
    color: "#000",
  },
  card: {
    width: 200,
    height: 200,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  cardImage: {
    width: 168,
    height: 168,
    resizeMode: "contain",
  },
});
