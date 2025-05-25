import { useAuth } from "@/context/AuthContext";
import { Picker } from "@react-native-picker/picker";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function AdditionalInfo() {
  const { user } = useAuth();
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [carrera, setCarrera] = useState("");
  const [horario, setHorario] = useState("");
  const [metodo, setMetodo] = useState("");
  const [temasInteres, setTemasInteres] = useState("");
  const [loading, setLoading] = useState(false);

  // Predefined photo URLs
  const photoOptions = [
    "https://shorturl.at/XBLfC",
    "https://shorturl.at/MDmI5",
    "https://shorturl.at/324r0",
    "https://shorturl.at/ZvXVc",
  ];

  useEffect(() => {
    if (user) {
      setUsername(user.displayName || "");
      setPhotoUrl(photoOptions[0]);
    }
  }, [user]);

  const handleSubmit = async () => {
    if (!user) return;

    // Convertir temasInteres en array
    const temasArr = temasInteres
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length);

    const body: any = {
      uid: user.uid,
      username,
      photoUrl,
    };
    if (carrera.trim()) body.carrera = carrera.trim();

    // construir preferenciasEstudio si hay datos
    const prefs: any = {};
    if (horario) prefs.horario = horario;
    if (metodo.trim()) prefs.metodo = metodo.trim();
    if (temasArr.length) prefs.temasInteres = temasArr;
    if (Object.keys(prefs).length) body.preferenciasEstudio = prefs;

    try {
      setLoading(true);
      console.log("POST a:", `${API_URL}/users`);
      const res = await fetch(`${API_URL}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Error al guardar información");
      }
      Alert.alert("Éxito", "Información guardada correctamente.", [
        { text: "OK", onPress: () => router.replace("/dashboard") },
      ]);
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Información Adicional</Text>

      {/* Username read-only */}
      <TextInput
        style={[styles.input, { backgroundColor: "#eee" }]}
        value={username}
        editable={false}
      />

      {/* Photo selection */}
      <Text style={styles.sectionLabel}>Selecciona tu avatar</Text>
      <View style={styles.photoContainer}>
        {photoOptions.map((url) => (
          <TouchableOpacity key={url} onPress={() => setPhotoUrl(url)}>
            <Image
              source={{ uri: url }}
              style={[styles.photoOption, photoUrl === url && styles.photoSelected]}
            />
          </TouchableOpacity>
        ))}
      </View>

      {/* Carrera */}
      <TextInput
        style={styles.input}
        placeholder="Carrera"
        placeholderTextColor="#999"
        value={carrera}
        onChangeText={setCarrera}
      />

      {/* Horario picker */}
      <Text style={styles.sectionLabel}>Horario de estudio</Text>
      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={horario}
          onValueChange={(value: React.SetStateAction<string>) => setHorario(value)}
          style={styles.picker}
        >
          <Picker.Item label="Mañana" value="mañana" />
          <Picker.Item label="Tarde" value="tarde" />
          <Picker.Item label="Noche" value="noche" />
        </Picker>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Método (ej. visual)"
        placeholderTextColor="#999"
        value={metodo}
        onChangeText={setMetodo}
      />

      <TextInput
        style={styles.input}
        placeholder="Temas de interés (separados por coma)"
        placeholderTextColor="#999"
        value={temasInteres}
        onChangeText={setTemasInteres}
      />

      <TouchableOpacity
        style={[styles.button, loading && { opacity: 0.6 }]}
        onPress={handleSubmit}
        disabled={loading}
      >
        <Text style={styles.buttonText}>{loading ? "Guardando..." : "Guardar"}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    backgroundColor: "#FEF3D9",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 20,
    color: "#000",
  },
  sectionLabel: {
    marginTop: 15,
    marginBottom: 15,
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  input: {
    width: 350,
    height: 50,
    backgroundColor: "#FFF",
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 15,
    color: "#000",
  },
  photoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: 350,
    marginBottom: 30,
  },
  photoOption: {
    width: 80,
    height: 80,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "transparent",
    resizeMode: "contain",
  },
  photoSelected: {
    borderColor: "#F4AB9C",
  },
  pickerWrapper: {
    width: 350,
    backgroundColor: "#FFF",
    borderRadius: 12,
    marginBottom: 20,
  },
  picker: {
    width: "100%",
    height: 50,
  },
  button: {
    marginTop: 10,
    width: 350,
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
