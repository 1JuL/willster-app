import { useAuth } from "@/context/AuthContext";
import { auth } from "@/utils/firebase";
import { MagicScroll } from "@appandflow/react-native-magic-scroll";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
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

export default function signup() {
  const router = useRouter();

  const { login } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (email !== confirmEmail) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "The emails do not match.",
      });
      return;
    }
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName });
      await userCredential.user.reload();
      Toast.show({
        type: "success",
        text1: "Successful registration",
        text2: `Welcome ${displayName}!`,
      });
      try {
        await login(email, password);
      } catch (error) {
        console.log({ error });
      }
      setTimeout(() => {
        router.replace("/additional_info");
      }, 1500);
    } catch (error: any) {
      console.log({ error });
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error.message || "An error occurred during the registration process.",
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
        <Text style={styles.title}>Signup</Text>

        {/* Inputs */}
        <MagicScroll.ScrollView>
          <MagicScroll.TextInput
            name="name"
            renderInput={(magicProps) => (
              <TextInput
                style={styles.input}
                placeholder="Name"
                placeholderTextColor="#999"
                value={displayName}
                onChangeText={setDisplayName}
                {...magicProps}
              />
            )}
            chainTo="email"
            textInputProps={{
              style: styles.input,
            }}
          />

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
            chainTo="confirm-email"
            textInputProps={{
              style: styles.input,
            }}
          />

          <MagicScroll.TextInput
            name="confirm-email"
            renderInput={(magicProps) => (
              <TextInput
                style={styles.input}
                placeholder="Confirm Email"
                placeholderTextColor="#999"
                value={confirmEmail}
                onChangeText={setConfirmEmail}
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
            onPress={handleSignup}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#000" />
            ) : (
              <Text style={styles.buttonText}>Signup</Text>
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
    marginBottom: 45,
    color: "#000",
  },
  input: {
    width: 290,
    height: 45,
    backgroundColor: "#FFF",
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 10,
    color: "#000",
  },
  button: {
    marginTop: 10,
    width: 290,
    height: 50,
    backgroundColor: "#F4AB9C",
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
