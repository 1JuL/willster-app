import { Typewriter } from "@/components/Typewriter"; // ajusta ruta
import { useFonts } from "expo-font";
import { useRouter } from "expo-router";
import LottieView from "lottie-react-native";
import React, { useEffect } from "react";
import { Dimensions, Image, StyleSheet, View } from "react-native";

const { width, height } = Dimensions.get("window");

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    const timeout = setTimeout(() => {
      router.replace("/dashboard");
    }, 3500);

    return () => clearTimeout(timeout);
  }, []);

  const [loaded] = useFonts({
    Roboto_Black: require("@/assets/fonts/Roboto-Black.ttf"),
  });

  return (
    <View style={styles.container}>
      {/* Fondo Lottie */}
      <LottieView
        source={require("@/assets/animations/linear-background.json")}
        autoPlay
        loop
        resizeMode="cover"
        style={styles.background}
      />

      {/* Contenido central */}
      <View style={styles.centerContainer}>
        {/* Logo estático */}
        <Image
          source={require("@/assets/images/will.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        {/* Texto animado */}
        <Typewriter
          text="Willster-App"
          typingSpeed={150}
          deletingSpeed={100}
          pauseTime={200}
          style={styles.typewriterText}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#202123",
  },
  background: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: width * 0.7,
    height: width * 0.7,
    marginBottom: 20,
  },
  typewriterText: {
    fontSize: 32,
    fontFamily: "Roboto_Black",
    color: "#FFFFFF",
    textAlign: "center",
  },
});
