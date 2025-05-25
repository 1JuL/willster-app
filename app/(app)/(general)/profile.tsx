// app/profile.tsx

import { useAuth } from "@/context/AuthContext";
import { MaterialIcons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [userName, setUserName] = useState<string>("");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [carrera, setCarrera] = useState("");
  const [horario, setHorario] = useState("");
  const [metodo, setMetodo] = useState("");
  const [temas, setTemas] = useState("");

  const photoOptions = [
    "https://shorturl.at/XBLfC",
    "https://shorturl.at/MDmI5",
    "https://shorturl.at/324r0",
    "https://shorturl.at/ZvXVc",
  ];

  useEffect(() => {
    async function loadProfile() {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`${API_URL}/users/${user.uid}`);
        if (!res.ok) throw new Error(`Error ${res.status}`);
        const json = await res.json();
        const data = json;
        setUserName(data.username || "");
        setPhotoUrl(data.photoUrl || photoOptions[0]);
        setCarrera(data.carrera || "");
        setHorario(data.preferenciasEstudio?.horario || "");
        setMetodo(data.preferenciasEstudio?.metodo || "");
        setTemas((data.preferenciasEstudio?.temasInteres || []).join(", "));
      } catch (e: any) {
        Alert.alert("Error", e.message);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const prefs: any = {};
      if (horario) prefs.horario = horario;
      if (metodo.trim()) prefs.metodo = metodo.trim();
      const temasArr = temas
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t.length);
      if (temasArr.length) prefs.temasInteres = temasArr;

      const body: any = {};
      if (photoUrl) body.photoUrl = photoUrl;
      if (carrera.trim()) body.carrera = carrera.trim();
      if (Object.keys(prefs).length) body.preferenciasEstudio = prefs;

      const res = await fetch(`${API_URL}/users/${user.uid}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      Alert.alert("Éxito", "Perfil actualizado");
    } catch (e: any) {
      Alert.alert("Error", e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#F4AB9C" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Hello! {userName}</Text>
        <Text style={styles.label}>Avatar</Text>
        <View style={styles.avatarContainer}>
          {photoOptions.map((url) => (
            <TouchableOpacity
              key={url}
              style={styles.avatarOption}
              onPress={() => setPhotoUrl(url)}
            >
              <Image
                source={{ uri: url }}
                style={[
                  styles.avatar,
                  photoUrl === url && { borderColor: "#F4AB9C", borderWidth: 2 },
                ]}
              />
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Carrera</Text>
        <TextInput
          style={styles.input}
          placeholder="Carrera"
          value={carrera}
          onChangeText={setCarrera}
        />

        <Text style={styles.label}>Horario</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={horario}
            onValueChange={(v) => setHorario(v)}
            style={styles.picker}
          >
            <Picker.Item label="Mañana" value="mañana" />
            <Picker.Item label="Tarde" value="tarde" />
            <Picker.Item label="Noche" value="noche" />
          </Picker>
        </View>

        <Text style={styles.label}>Método</Text>
        <TextInput
          style={styles.input}
          placeholder="Método de estudio"
          value={metodo}
          onChangeText={setMetodo}
        />

        <Text style={styles.label}>Temas de interés</Text>
        <TextInput
          style={styles.input}
          placeholder="tema1, tema2, tema3"
          value={temas}
          onChangeText={setTemas}
        />

        <TouchableOpacity
          style={[styles.button, saving && { opacity: 0.6 }]}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.buttonText}>{saving ? "Guardando..." : "Guardar cambios"}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.reminders} onPress={() => router.push("/studysession")}>
          <MaterialIcons name="notifications" size={20} color="#000" />
          <Text style={styles.remindersText}>Reminders</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logout} onPress={logout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FEF3D9" },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 20,
    color: "#000",
  },
  inner: {
    padding: 20,
    alignItems: "center",
  },
  label: {
    alignSelf: "flex-start",
    marginTop: 15,
    marginBottom: 5,
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  avatarContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 20,
  },
  avatarOption: {
    flex: 1,
    alignItems: "center",
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  input: {
    width: "100%",
    height: 45,
    backgroundColor: "#FFF",
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 10,
    color: "#000",
  },
  pickerWrapper: {
    width: "100%",
    backgroundColor: "#FFF",
    borderRadius: 8,
    marginBottom: 10,
  },
  picker: { width: "100%", height: 50 },
  button: {
    marginTop: 20,
    width: "100%",
    height: 50,
    backgroundColor: "#F4AB9C",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: { fontSize: 16, fontWeight: "600", color: "#000" },
  reminders: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    borderWidth: 1,
    width: "100%",
    height: 50,
    borderRadius: 12,
    justifyContent: "center",
  },
  remindersText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "600",
  },
  logout: {
    marginTop: 30,
    width: "100%",
    height: 50,
    borderWidth: 1,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderColor: "#C00",
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#C00",
  },
  loader: { flex: 1, alignItems: "center", justifyContent: "center" },
});
