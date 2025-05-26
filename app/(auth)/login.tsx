import { useAuth } from "@/context/AuthContext";
import { MagicScroll } from "@appandflow/react-native-magic-scroll";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

export default function login() {
  const router = useRouter();

  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const firebaseUser = await login(email, password);
      const name = firebaseUser.displayName;
      await login(email, password);
      Toast.show({
        type: "success",
        text1: "Successful login",
        text2: `Welcome back ${name}!`,
      });
      setTimeout(() => {
        router.replace("/dashboard");
      }, 1500);
    } catch (error: any) {
      console.log({ error });
      Toast.show({
        type: "error",
        text1: "Login error",
        text2: error.message || "An error occurred during login.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <View style={styles.container}>
        <StatusBar style="dark" />
        {/* Mascot */}
        <Image
          source={require("@/assets/images/will.png")}
          style={styles.avatar}
          resizeMode="contain"
        />

        {/* Title */}
        <Text style={styles.title}>Login</Text>

        {/* Inputs */}
        <MagicScroll.ScrollView>
          <MagicScroll.TextInput
            name="email"
            renderInput={(magicProps) => (
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#999"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                {...magicProps}
              />
            )}
            chainTo="password"
            textInputProps={{
              style: styles.input,
            }}
          />

          <MagicScroll.TextInput
            name="password"
            renderInput={(magicProps) => (
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#999"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                {...magicProps}
              />
            )}
            textInputProps={{
              style: styles.input,
            }}
          />

          {/* Button */}
          <TouchableOpacity
            style={[styles.button, loading && { opacity: 0.6 }]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#000" />
            ) : (
              <Text style={styles.buttonText}>Login</Text>
            )}
          </TouchableOpacity>
        </MagicScroll.ScrollView>
      </View>
      <Toast />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FEF3D9",
  },
  avatar: {
    width: 402,
    height: 402,
    marginTop: 50,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 25,
    color: "#000",
  },
  input: {
    width: 290,
    height: 45,
    backgroundColor: "#FFF",
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 15,
    color: "#000",
  },
  button: {
    marginTop: 10,
    width: 290,
    height: 50,
    backgroundColor: "#F4AB9C", // dusty pink
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
});
