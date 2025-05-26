import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function Home() {
  const router = useRouter();
  return (
    <>
      <View style={styles.screen}>
        <StatusBar style="dark" />
        {/* Center card */}
        <View style={styles.card}>
          <Image
            source={require("@/assets/images/will.png")}
            style={styles.avatar}
            resizeMode="contain"
          />

          <Text style={styles.title}>Hi! My name is Will</Text>

          <TouchableOpacity style={styles.loginButton} onPress={() => router.push("/login")}>
            <Text style={styles.loginText}>Login</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.signupButton} onPress={() => router.push("/signup")}>
            <Text style={styles.signupText}>Signup</Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FEF3D9",
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    width: "90%",
    backgroundColor: "#FEF3D9",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  avatar: {
    width: 400,
    height: 400,
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    marginBottom: 40,
    color: "#000",
  },
  loginButton: {
    backgroundColor: "#F4AB9C",
    width: 291,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 40,
  },
  signupButton: {
    backgroundColor: "#FFEAA4",
    width: 291,
    paddingVertical: 14,
    borderRadius: 12,
  },
  signupText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    alignSelf: "center",
  },
  loginText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    alignSelf: "center",
  },
});
