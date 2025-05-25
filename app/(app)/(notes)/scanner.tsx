// app/scanner.tsx
import CameraOCR from "@/components/CameraOCR";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

export default function ScannerScreen() {
  const router = useRouter();

  const handleTextExtracted = (text: string) => {
    console.log('Text extracted:', text);
  };

  const handleImageSelected = (imageUrl: string) => {
    console.log('Image URL received:', imageUrl);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Scan your notes</Text>
      </View>

      <View style={styles.content}>
        <CameraOCR
          onTextExtracted={handleTextExtracted}
          onImageSelected={handleImageSelected}
          characterImageSource={require('@/assets/images/will scanner.png')}
        />
      </View>

      <View style={styles.bottomNav}>
        <TouchableOpacity onPress={() => router.push("/home")} style={styles.navItem}>
          <MaterialCommunityIcons name="plus-box" size={24} color="black" />
          <Text style={styles.navText}>Add notebook</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push("/home")} style={styles.navItem}>
          <MaterialCommunityIcons name="home" size={24} color="black" />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push("/scanner")} style={styles.navItem}>
          <MaterialCommunityIcons name="qrcode-scan" size={24} color="#EF5C40" />
          <Text style={[styles.navText, styles.activeNavText]}>Scan notes</Text>
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
  content: { flex: 1, paddingHorizontal: 20, paddingBottom: 100 },
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  navItem: { alignItems: "center", justifyContent: "center", flex: 1 },
  navText: { fontSize: 10, marginTop: 2, textAlign: "center", color: "black" },
  activeNavText: { color: "#EF5C40", fontWeight: "bold" },
});