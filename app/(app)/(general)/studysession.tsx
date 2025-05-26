// app/studysession.tsx

import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Calendar } from "react-native-calendars";
import { SafeAreaView } from "react-native-safe-area-context";

type Reminder = {
  id: string;
  timestamp: number;
};

export default function StudySessionScreen() {
  const router = useRouter();
  const [date, setDate] = useState<Date>(new Date());
  const [selectedDay, setSelectedDay] = useState<string>(new Date().toISOString().slice(0, 10));
  const [showPicker, setShowPicker] = useState<boolean>(false);
  const [reminders, setReminders] = useState<Reminder[]>([]);

  // preview
  const [preview, setPreview] = useState<string>("");

  // load stored reminders
  useEffect(() => {
    AsyncStorage.getItem("study_reminders").then((json) => {
      if (json) setReminders(JSON.parse(json));
    });
  }, []);

  // notification handler
  useEffect(() => {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });

    // listener to auto-delete when notification is received
    const sub = Notifications.addNotificationReceivedListener((notification) => {
      const id = notification.request.identifier;
      // remove from storage + state
      const filtered = reminders.filter((r) => r.id !== id);
      AsyncStorage.setItem("study_reminders", JSON.stringify(filtered));
      setReminders(filtered);
    });

    return () => sub.remove();
  }, [reminders]);

  // request permissions
  useEffect(() => {
    (async () => {
      if (Device.isDevice) {
        const { status: existing } = await Notifications.getPermissionsAsync();
        let final = existing;
        if (existing !== "granted") {
          const { status } = await Notifications.requestPermissionsAsync();
          final = status;
        }
        if (final !== "granted") {
          Alert.alert("Permission denied", "You will not be able to receive notifications.");
        }
      }
    })();
  }, []);

  const saveToStorage = async (newList: Reminder[]) => {
    await AsyncStorage.setItem("study_reminders", JSON.stringify(newList));
    setReminders(newList);
  };

  const scheduleNotification = async () => {
    // cancel all
    await Notifications.cancelAllScheduledNotificationsAsync();

    // compute trigger
    const triggerDate = new Date(`${selectedDay}T${date.toTimeString().slice(0, 5)}:00`);
    if (triggerDate.getTime() <= Date.now()) {
      Alert.alert("Past date", "Choose a future time.");
      return;
    }

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: "🎓 Hey, aren't you forgetting something? 🧐",
        body: `Study session at: ${triggerDate.toLocaleString()}`,
      },
      trigger: { type: "date", date: triggerDate } as any,
    });

    const newReminders = [{ id, timestamp: triggerDate.getTime() }];
    await saveToStorage(newReminders);
    setPreview("");
    Alert.alert("Ready", "Scheduled reminder.");
  };

  const deleteReminder = async (reminderId: string) => {
    await Notifications.cancelScheduledNotificationAsync(reminderId);
    await saveToStorage([]);
    Alert.alert("Deleted", "The reminder has been deleted.");
  };

  const deleteAll = async () => {
    await Notifications.cancelAllScheduledNotificationsAsync();
    await saveToStorage([]);
    Alert.alert("Eliminated", "All reminders have been deleted.");
  };

  // update preview
  useEffect(() => {
    const dt = new Date(`${selectedDay}T${date.toTimeString().slice(0, 5)}:00`);
    setPreview(`Preview: ${dt.toLocaleString()}`);
  }, [selectedDay, date]);

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <StatusBar style="dark" />
      {/* Header (Top App Bar) */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reminders</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Main Content Area */}
      <View style={styles.content}>
        <Calendar
          onDayPress={(day) => setSelectedDay(day.dateString)}
          markedDates={{ [selectedDay]: { selected: true, selectedColor: "#F4AB9C" } }}
          theme={{
            todayTextColor: "#F4AB9C",
            arrowColor: "#F4AB9C",
          }}
          style={styles.calendar}
        />

        <TouchableOpacity style={styles.timeButton} onPress={() => setShowPicker(true)}>
          <Text style={styles.timeText}>Choose an hour</Text>
        </TouchableOpacity>
        {showPicker && (
          <DateTimePicker
            value={date}
            mode="time"
            is24Hour
            display="spinner"
            onChange={(_, sel) => {
              setShowPicker(false);
              if (sel) setDate(sel);
            }}
          />
        )}

        <Text style={styles.previewText}>{preview}</Text>

        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.saveButton} onPress={scheduleNotification}>
            <Text style={styles.saveText}>Save</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteAllButton} onPress={deleteAll}>
            <Text style={styles.deleteAllText}>Delete All</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.listContainer}>
          <Text style={styles.listTitle}>Saved Reminders:</Text>
          {reminders.map((r) => (
            <View key={r.id} style={styles.listRow}>
              <Text style={styles.listItem}>• {new Date(r.timestamp).toLocaleString()}</Text>
              <TouchableOpacity style={styles.deleteButton} onPress={() => deleteReminder(r.id)}>
                <Text style={styles.deleteText}>Delete</Text>
              </TouchableOpacity>
            </View>
          ))}
          {reminders.length === 0 && (
            <Text style={styles.emptyText}>There are no reminders scheduled</Text>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FEF3D9",
  },
  header: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#F4AB9C",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "700",
    flex: 1,
    textAlign: "center",
  },
  content: {
    flex: 1,
    backgroundColor: "#FEF3D9",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: 20,
    paddingHorizontal: 20,
    gap: 10,
    marginTop: 20,
  },
  calendar: {
    width: 400,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  timeButton: {
    backgroundColor: "#FFF",
    borderColor: "#F4AB9C",
    borderWidth: 2,
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    width: "90%",
    alignItems: "center",
  },
  timeText: { fontSize: 18, fontWeight: "600", color: "#F4AB9C" },
  previewText: { fontSize: 16, marginVertical: 10, color: "#333" },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "90%",
    marginBottom: 20,
  },
  saveButton: {
    backgroundColor: "#F4AB9C",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    width: 140,
  },
  saveText: { fontSize: 16, fontWeight: "600", color: "#000", alignSelf: "center" },
  deleteAllButton: {
    backgroundColor: "#C00",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    width: 140,
  },
  deleteAllText: { fontSize: 16, fontWeight: "600", color: "#FFF", alignSelf: "center" },
  listContainer: {
    width: "90%",
    backgroundColor: "#FFF",
    borderRadius: 8,
    padding: 10,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 1,
  },
  listTitle: { fontWeight: "700", marginBottom: 10, fontSize: 16 },
  listRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  listItem: { fontSize: 14 },
  deleteButton: {
    backgroundColor: "#f8d7da",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  deleteText: { color: "#721c24", fontSize: 12 },
  emptyText: { fontStyle: "italic", color: "#666", textAlign: "center", marginTop: 10 },
});
