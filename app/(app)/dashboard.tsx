import { useAuth } from "@/context/AuthContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Button, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function Dashboard() {
  const router = useRouter();
  const { logout } = useAuth();
  return (
    <>
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <View>
          <Text>dashboard</Text>
          <Button title={"Index"} onPress={() => router.push("/")}></Button>
          <Button title={"Add user info"} onPress={() => router.push("/additional_info")}></Button>
          <Button title={"Hangedman"} onPress={() => router.push("/hangedman")}></Button>
          <Button title={"Scanner"} onPress={() => router.push("/scanner")}></Button>
          <Button title={"Game selection"} onPress={() => router.push("/game_selection")}></Button>
        </View>
        <View>
          <TouchableOpacity
            style={styles.lastButton}
            onPress={async () => {
              try {
                await logout();
                router.replace("/home");
              } catch (error) {
                console.error("Error al cerrar sesión:", error);
              }
            }}
          >
            <View style={styles.buttonContent}>
              <MaterialCommunityIcons name="logout" size={20} color="#ED8C8C" style={styles.icon} />
              <Text style={styles.redText}>Logout</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  lastButton: {
    marginBottom: 0,
    width: "100%",
    backgroundColor: "#e0e0e0",
    padding: 15,
    marginVertical: 5,
    borderRadius: 5,
    alignItems: "flex-start",
  },
  redText: {
    color: "#ED8C8C",
    fontSize: 16,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    marginRight: 10, // Espacio entre el ícono y el texto
  },
});
