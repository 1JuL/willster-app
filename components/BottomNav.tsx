// components/BottomNav.tsx
import AddNotebook from "@/components/addNotebook";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface BottomNavProps {
  /** Se ejecuta cuando se crea un notebook para refrescar la lista */
  onNotebookAdded?: () => void;
}

export default function BottomNav({ onNotebookAdded }: BottomNavProps) {
  const router = useRouter();
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleOpen = () => setIsModalVisible(true);
  const handleClose = () => setIsModalVisible(false);

  const handleSuccess = () => {
    setIsModalVisible(false);
    onNotebookAdded?.();
  };

  return (
    <>
      {/* Modal para crear notebook */}
      <Modal
        visible={isModalVisible}
        transparent
        animationType="slide"
        onRequestClose={handleClose}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Notebook</Text>
              <TouchableOpacity onPress={handleClose}>
                <MaterialCommunityIcons name="close" size={24} color="#2A1E1E" />
              </TouchableOpacity>
            </View>
            <AddNotebook onSuccess={handleSuccess} />
          </View>
        </View>
      </Modal>

      {/* Barra de navegación inferior */}
      <SafeAreaView style={styles.container} edges={["bottom"]}>
        <View style={styles.bottomNav}>
          <TouchableOpacity onPress={handleOpen} style={styles.navItem}>
            <MaterialCommunityIcons name="plus-box" size={24} color="black" />
            <Text style={styles.navText}>Add notebook</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.replace("/dashboard")} style={styles.navItem}>
            <MaterialCommunityIcons name="home" size={24} color="black" />
            <Text style={styles.navText}>Home</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push("/scanner")} style={styles.navItem}>
            <MaterialCommunityIcons name="qrcode-scan" size={24} color="black" />
            <Text style={styles.navText}>Scan notes</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push("/profile")} style={styles.navItem}>
            <MaterialCommunityIcons name="account-circle" size={24} color="black" />
            <Text style={styles.navText}>Profile</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF5DC" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#FFF5DC",
    width: "90%",
    maxWidth: 400,
    borderRadius: 20,
    padding: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2A1E1E",
  },
  bottomNav: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#F2A9A0",
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 25,
    elevation: 5,
    shadowColor: "#2A1E1E",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  navText: {
    fontSize: 10,
    marginTop: 2,
    textAlign: "center",
    color: "black",
  },
});
