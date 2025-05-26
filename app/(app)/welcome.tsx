import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function Welcome() {
  const router = useRouter();

  // Estado que controla qué vista se muestra
  const [showSlides, setShowSlides] = useState(false);

  // Tus slides originales
  const exampleSets = [
    {
      title: "Capabilities",
      examples: [
        "Capture handwritten or printed notes using your device’s camera.",
        "Automatically generate summaries from scanned notes using Gemini API.",
        "Reinforce key concepts through interactive games.",
      ],
    },
    {
      title: "Limitations",
      examples: [
        "May occasionally generate incorrect information",
        "May occasionally produce harmful instructions or biased content",
        "Limited knowledge of world and events after 2021",
      ],
    },
  ];

  const exampleIcons: ("lightning-bolt" | "alert-outline")[] = ["lightning-bolt", "alert-outline"];

  const [currentExampleIndex, setCurrentExampleIndex] = useState(0);

  const handleNext = () => {
    if (currentExampleIndex < exampleSets.length - 1) {
      setCurrentExampleIndex(currentExampleIndex + 1);
    } else {
      router.replace("/dashboard");
    }
  };

  // Renderiza la pantalla de bienvenida
  if (!showSlides) {
    return (
      <View style={styles.containerWelcome}>
        <View style={styles.topSectionWelcome}>
          <Image
            source={require("@/assets/images/will-welcome.png")}
            style={styles.welcomeImage}
            resizeMode="contain"
          />
          <Text style={styles.title}>Welcome to Willster</Text>
          <View style={styles.bottomSectionWelcome}>
            <TouchableOpacity style={styles.nextButton} onPress={() => setShowSlides(true)}>
              <Text style={styles.nextButtonText}>Start</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  // Renderiza los slides originales
  return (
    <>
      <View style={styles.container}>
        <StatusBar style="dark" />
        {/* Sección superior: Logo, título y subtítulo */}
        <View style={styles.topSection}>
          <Image
            source={require("@/assets/images/will.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>Welcome to Willster</Text>
          <Text style={styles.subtitle}>Play games and get summaries</Text>
          <Text style={styles.subtitle}>from your notes</Text>
        </View>

        {/* Sección central */}
        <View style={styles.middleSection}>
          <MaterialCommunityIcons
            name={exampleIcons[currentExampleIndex]}
            size={30}
            color="#F4AB9C"
          />
          <Text style={styles.examplesTitle}>{exampleSets[currentExampleIndex].title}</Text>
          <View style={styles.examplesContainer}>
            {exampleSets[currentExampleIndex].examples.map((text, index) => (
              <View key={index} style={styles.exampleBox}>
                <Text style={styles.exampleText}>{text}</Text>
              </View>
            ))}
          </View>

          {/* Indicadores para el carrusel */}
          <View style={styles.indicatorContainer}>
            {exampleSets.map((_, index) => (
              <TouchableOpacity key={index} onPress={() => setCurrentExampleIndex(index)}>
                <View
                  style={[
                    styles.indicator,
                    currentExampleIndex === index
                      ? { backgroundColor: "#F4AB9C" }
                      : { backgroundColor: "#FFF" },
                  ]}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Sección inferior: Botón "Next" o "Let's Chat" */}
        <View style={styles.bottomSection}>
          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            {currentExampleIndex < exampleSets.length - 1 ? (
              <Text style={styles.nextButtonText}>Next</Text>
            ) : (
              <>
                <Text style={styles.nextButtonText}>Let's Start</Text>
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={20}
                  color="#000"
                  style={{ marginLeft: 10 }}
                />
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FEF3D9",
    justifyContent: "space-between",
  },
  containerWelcome: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: "100%",
    backgroundColor: "#FEF3D9",
  },
  topSectionWelcome: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 0,
  },
  bottomSectionWelcome: {
    marginTop: 50,
  },
  topSection: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 0,
  },
  logo: {
    width: 30,
    height: 30,
    marginBottom: 20,
  },
  title: {
    color: "#000",
    fontSize: 32,
    marginBottom: 10,
    fontWeight: "700",
  },
  subtitle: {
    color: "#000",
    fontSize: 16,
  },
  middleSection: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  examplesContainer: {
    alignItems: "center",
    width: "80%",
    gap: 10,
  },
  examplesTitle: {
    fontSize: 18,
    marginTop: 10,
    marginBottom: 30,
    color: "#000",
  },
  exampleBox: {
    backgroundColor: "rgba(255, 255, 255, 0.54)",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    width: "100%",
    height: 62,
    alignItems: "center",
    justifyContent: "center",
  },
  exampleText: {
    color: "#000",
    fontSize: 16,
    textAlign: "center",
  },
  dialogContainer: {
    width: "80%",
    padding: 20,
    borderRadius: 10,
    backgroundColor: "#f2f2f2",
    alignItems: "center",
  },
  dialogText: {
    color: "#000",
    fontSize: 16,
    textAlign: "center",
  },
  indicatorContainer: {
    flexDirection: "row",
    marginTop: 10,
  },
  indicator: {
    width: 40,
    height: 8,
    borderRadius: 12,
    marginHorizontal: 10,
  },
  bottomSection: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  nextButton: {
    width: 335,
    height: 48,
    borderRadius: 8,
    paddingTop: 12,
    paddingRight: 24,
    paddingBottom: 12,
    paddingLeft: 24,
    backgroundColor: "#F4AB9C",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  nextButtonText: {
    color: "#000",
    fontSize: 18,
  },
  welcomeImage: {
    width: 402,
    height: 402,
  },
});
