// components/NotebookPicker.tsx
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { StatusBar } from "expo-status-bar";
import { Props } from "../interfaces/AppInterfaces";

export default function NotebookPicker({ visible, notebooks, isSaving, onSelect, onClose }: Props) {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <StatusBar style="dark" />
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>¿Dónde guardar la nota?</Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialCommunityIcons name="close" size={24} color="black" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.list}>
            {notebooks.map((nb) => (
              <TouchableOpacity
                key={nb.id}
                style={styles.item}
                onPress={() => onSelect(nb.id, nb.title)}
                disabled={isSaving}
              >
                <Text style={styles.itemText}>{nb.title}</Text>
                {isSaving && <ActivityIndicator size="small" color="#EF5C40" />}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    backgroundColor: "#FFF5DC",
    width: "80%",
    borderRadius: 20,
    padding: 20,
    maxHeight: "70%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  title: { fontSize: 20, fontWeight: "bold" },
  list: { marginTop: 10 },
  item: {
    padding: 15,
    backgroundColor: "white",
    borderRadius: 8,
    marginBottom: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  itemText: { fontSize: 16, color: "black" },
});
