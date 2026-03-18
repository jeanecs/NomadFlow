import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ActivityCategory, CreateActivityInput } from "@/types";
import { categoryIcon, categoryLabel, inferCategory } from "@/utils/helpers";
import colors from "@/constants/colors";

const CATEGORIES: ActivityCategory[] = [
  "transport", "accommodation", "food", "nature", "culture", "shopping", "nightlife", "other",
];

interface AddActivitySheetProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: CreateActivityInput) => Promise<void>;
  dayIndex: number;
  totalDays: number;
}

export function AddActivitySheet({ visible, onClose, onSubmit, dayIndex, totalDays }: AddActivitySheetProps) {
  const insets = useSafeAreaInsets();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<ActivityCategory>("other");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [autoCategory, setAutoCategory] = useState(true);

  const handleTitleChange = (text: string) => {
    setTitle(text);
    if (autoCategory) {
      setCategory(inferCategory(text));
    }
  };

  const handleCategorySelect = (cat: ActivityCategory) => {
    setCategory(cat);
    setAutoCategory(false);
  };

  const handleSubmit = async () => {
    if (!title.trim() || !startTime) return;
    setLoading(true);
    try {
      await onSubmit({
        dayIndex,
        title: title.trim(),
        category,
        startTime,
        endTime: endTime || null,
        location: location || null,
        notes: notes || null,
      });
      setTitle("");
      setCategory("other");
      setStartTime("09:00");
      setEndTime("");
      setLocation("");
      setNotes("");
      setAutoCategory(true);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}>
          <View style={styles.handle} />

          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>Add Activity</Text>
            <Pressable onPress={onClose} hitSlop={12}>
              <Ionicons name="close" size={22} color="#6B7280" />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            <View style={styles.form}>
              <View style={styles.field}>
                <Text style={styles.label}>Activity Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Dinner at local restaurant"
                  placeholderTextColor="#9CA3AF"
                  value={title}
                  onChangeText={handleTitleChange}
                  autoFocus
                  returnKeyType="done"
                />
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Category</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
                  <View style={styles.catRow}>
                    {CATEGORIES.map((cat) => {
                      const catColor = colors.light.categories[cat];
                      const selected = category === cat;
                      return (
                        <Pressable
                          key={cat}
                          onPress={() => handleCategorySelect(cat)}
                          style={[
                            styles.catChip,
                            selected && { backgroundColor: catColor, borderColor: catColor },
                            !selected && { borderColor: "#E5E7EB" },
                          ]}
                        >
                          <Ionicons
                            name={categoryIcon(cat) as any}
                            size={14}
                            color={selected ? "#fff" : catColor}
                          />
                          <Text style={[styles.catLabel, selected && { color: "#fff" }, !selected && { color: "#374151" }]}>
                            {categoryLabel(cat)}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </ScrollView>
              </View>

              <View style={styles.timeRow}>
                <View style={[styles.field, { flex: 1 }]}>
                  <Text style={styles.label}>Start Time</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="09:00"
                    placeholderTextColor="#9CA3AF"
                    value={startTime}
                    onChangeText={setStartTime}
                    keyboardType="numbers-and-punctuation"
                  />
                </View>
                <View style={[styles.field, { flex: 1 }]}>
                  <Text style={styles.label}>End Time (optional)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="10:00"
                    placeholderTextColor="#9CA3AF"
                    value={endTime}
                    onChangeText={setEndTime}
                    keyboardType="numbers-and-punctuation"
                  />
                </View>
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Location (optional)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Marina Bay Sands"
                  placeholderTextColor="#9CA3AF"
                  value={location}
                  onChangeText={setLocation}
                />
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Notes (optional)</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Any details, booking refs, etc."
                  placeholderTextColor="#9CA3AF"
                  value={notes}
                  onChangeText={setNotes}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>

              <Pressable
                style={[styles.submitBtn, (!title.trim() || loading) && styles.submitBtnDisabled]}
                onPress={handleSubmit}
                disabled={!title.trim() || loading}
              >
                <Ionicons name="add-circle" size={20} color="#fff" />
                <Text style={styles.submitText}>{loading ? "Adding..." : "Add to Timeline"}</Text>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  sheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    maxHeight: "90%",
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: "#E5E7EB",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 16,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sheetTitle: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    color: "#0A1628",
  },
  form: {
    paddingHorizontal: 20,
    gap: 16,
    paddingBottom: 8,
  },
  field: {
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: "#374151",
  },
  input: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 13,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: "#0A1628",
  },
  textArea: {
    height: 80,
    paddingTop: 12,
  },
  timeRow: {
    flexDirection: "row",
    gap: 12,
  },
  catScroll: {
    marginHorizontal: -4,
  },
  catRow: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 4,
  },
  catChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1.5,
    backgroundColor: "#F9FAFB",
  },
  catLabel: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  submitBtn: {
    backgroundColor: "#0D7377",
    borderRadius: 14,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 4,
  },
  submitBtnDisabled: {
    opacity: 0.5,
  },
  submitText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Inter_700Bold",
  },
});
