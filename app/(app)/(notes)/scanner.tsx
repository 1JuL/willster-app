// app/scanner.tsx
import CameraOCR from "@/components/CameraOCR";
import NotebookPicker from "@/components/NotebookPicker";
import { useAuth } from "@/context/AuthContext";
import { useNotebook } from "@/context/NotebookContext";
import { Notebook } from "@/interfaces/AppInterfaces";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function ScannerScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { setNotebook } = useNotebook();
  const [imageUrl, setImageUrl] = useState<string>("");
  const [extractedText, setExtractedText] = useState<string>("");
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [showNotebookModal, setShowNotebookModal] = useState(false);
  const [showTitleModal, setShowTitleModal] = useState(false);
  const [pendingNotebook, setPendingNotebook] = useState<{ id: string; title: string } | null>(
    null
  );
  const [noteTitle, setNoteTitle] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);

  // load notebooks
  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const resp = await fetch(`${API_URL}/users/${user.uid}/notebooks`);
        const data = await resp.json();
        if (resp.ok) setNotebooks(data);
      } catch (e) {
        console.error("Error fetching notebooks:", e);
      }
    })();
  }, [user]);

  // OCR callbacks
  const handleTextExtracted = (text: string) => {
    setExtractedText(text);
    setShowNotebookModal(true);
  };
  const handleImageSelected = (url: string) => {
    setImageUrl(url);
  };

  // when user taps a notebook
  const onNotebookSelect = (id: string, title: string) => {
    setPendingNotebook({ id, title });
    setShowNotebookModal(false);
    setShowTitleModal(true);
  };

  // final save
  const saveNote = async (customTitle: string) => {
    if (!user || !pendingNotebook) {
      return Alert.alert("Error", "Missing data to save.");
    }
    setIsSaving(true);
    try {
      const resp = await fetch(
        `${API_URL}/users/${user.uid}/notebooks/${pendingNotebook.id}/notes`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: customTitle.trim(),
            content: extractedText,
            imageUrl,
          }),
        }
      );
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.message || JSON.stringify(data));

      // update contexts
      setNotebook(pendingNotebook.id, data.id);
      Alert.alert("Success", `Note saved in "${pendingNotebook.title}"`);

      // navigate to note
      router.push(`/notescanned`);

      // reset
      setShowTitleModal(false);
      setExtractedText("");
      setImageUrl("");
      setPendingNotebook(null);
      setNoteTitle("");
    } catch (e: any) {
      console.error("Error guardando nota:", e);
      Alert.alert("Error", e.message || "We couldnt save the note.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <StatusBar style="dark" />
      <View style={styles.container}>
        {/* header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.headerText}>Scan your notes</Text>
        </View>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* camera + ocr */}
          <View style={styles.content}>
            <CameraOCR
              onTextExtracted={handleTextExtracted}
              onImageSelected={handleImageSelected}
              characterImageSource={require("@/assets/images/will scanner.png")}
            />
          </View>
        </ScrollView>
        {/* notebook picker */}
        <NotebookPicker
          visible={showNotebookModal}
          notebooks={notebooks}
          isSaving={isSaving}
          onSelect={onNotebookSelect}
          onClose={() => setShowNotebookModal(false)}
        />

        {/* title input modal */}
        <Modal visible={showTitleModal} transparent animationType="slide">
          <View style={styles.overlay}>
            <View style={styles.titleModal}>
              <Text style={styles.modalTitle}>Notes title</Text>
              <TextInput
                value={noteTitle}
                onChangeText={setNoteTitle}
                placeholder="Write a title..."
                style={styles.input}
              />
              <View style={styles.actions}>
                <TouchableOpacity
                  onPress={() => {
                    setShowTitleModal(false);
                    setPendingNotebook(null);
                  }}
                  style={styles.cancelBtn}
                >
                  <Text>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  disabled={!noteTitle.trim() || isSaving}
                  onPress={() => saveNote(noteTitle)}
                  style={[styles.saveBtn, (!noteTitle.trim() || isSaving) && styles.disabledBtn]}
                >
                  {isSaving ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text style={styles.saveText}>Save</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF5DC",
  },
  header: {
    backgroundColor: "#F2A9A0",
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderBottomEndRadius: 10,
    borderBottomStartRadius: 10,
  },
  backButton: {
    marginRight: 10,
  },
  headerText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "black",
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  titleModal: {
    backgroundColor: "#FFF5DC",
    width: "80%",
    borderRadius: 20,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    backgroundColor: "white",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 15,
  },
  cancelBtn: {
    marginRight: 15,
  },
  saveBtn: {
    backgroundColor: "#4CAF50",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  saveText: {
    color: "white",
    fontWeight: "bold",
  },
  disabledBtn: {
    backgroundColor: "#aaa",
  },
});
