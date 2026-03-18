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
import { CreateTripInput } from "@/types";
import colors from "@/constants/colors";

interface CreateTripSheetProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: CreateTripInput) => Promise<void>;
}

const COLORS = colors.light.coverColors;

export function CreateTripSheet({ visible, onClose, onSubmit }: CreateTripSheetProps) {
  const insets = useSafeAreaInsets();
  const [name, setName] = useState("");
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [coverColor, setCoverColor] = useState(COLORS[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isValid = name.trim() && destination.trim() && startDate && endDate;

  const handleSubmit = async () => {
    if (!isValid) return;
    // Validate dates
    if (startDate > endDate) {
      setError("End date must be after start date");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await onSubmit({ name: name.trim(), destination: destination.trim(), startDate, endDate, coverColor });
      setName("");
      setDestination("");
      setStartDate("");
      setEndDate("");
      setCoverColor(COLORS[0]);
      onClose();
    } catch (e: any) {
      setError(e.message || "Failed to create trip");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}>
          <View style={styles.handle} />
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>New Trip</Text>
            <Pressable onPress={onClose} hitSlop={12}>
              <Ionicons name="close" size={22} color="#6B7280" />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            <View style={styles.form}>
              {error ? (
                <View style={styles.errorBox}>
                  <Ionicons name="alert-circle-outline" size={16} color="#DC2626" />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              <View style={styles.field}>
                <Text style={styles.label}>Trip Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Cebu Backpacking"
                  placeholderTextColor="#9CA3AF"
                  value={name}
                  onChangeText={setName}
                  autoFocus
                  returnKeyType="next"
                />
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Destination</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Cebu, Philippines"
                  placeholderTextColor="#9CA3AF"
                  value={destination}
                  onChangeText={setDestination}
                  returnKeyType="next"
                />
              </View>

              <View style={styles.dateRow}>
                <View style={[styles.field, { flex: 1 }]}>
                  <Text style={styles.label}>Start Date</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor="#9CA3AF"
                    value={startDate}
                    onChangeText={setStartDate}
                    keyboardType="numbers-and-punctuation"
                  />
                </View>
                <View style={[styles.field, { flex: 1 }]}>
                  <Text style={styles.label}>End Date</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor="#9CA3AF"
                    value={endDate}
                    onChangeText={setEndDate}
                    keyboardType="numbers-and-punctuation"
                  />
                </View>
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Trip Color</Text>
                <View style={styles.colorRow}>
                  {COLORS.map((c) => (
                    <Pressable
                      key={c}
                      onPress={() => setCoverColor(c)}
                      style={[
                        styles.colorSwatch,
                        { backgroundColor: c },
                        coverColor === c && styles.colorSwatchSelected,
                      ]}
                    >
                      {coverColor === c && (
                        <Ionicons name="checkmark" size={14} color="#fff" />
                      )}
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Preview */}
              <View style={[styles.preview, { borderLeftColor: coverColor }]}>
                <View style={[styles.previewDot, { backgroundColor: coverColor }]} />
                <View>
                  <Text style={styles.previewName}>{name || "Trip Name"}</Text>
                  <Text style={styles.previewDest}>{destination || "Destination"}</Text>
                </View>
              </View>

              <Pressable
                style={[styles.submitBtn, { backgroundColor: coverColor }, (!isValid || loading) && styles.submitBtnDisabled]}
                onPress={handleSubmit}
                disabled={!isValid || loading}
              >
                <Ionicons name="paper-plane" size={18} color="#fff" />
                <Text style={styles.submitText}>{loading ? "Creating..." : "Create Trip"}</Text>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: "flex-end" },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.5)" },
  sheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    maxHeight: "92%",
  },
  handle: { width: 36, height: 4, backgroundColor: "#E5E7EB", borderRadius: 2, alignSelf: "center", marginBottom: 16 },
  sheetHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, marginBottom: 16 },
  sheetTitle: { fontSize: 18, fontFamily: "Inter_700Bold", color: "#0A1628" },
  form: { paddingHorizontal: 20, gap: 16, paddingBottom: 8 },
  errorBox: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#FEF2F2", borderRadius: 10, padding: 12 },
  errorText: { color: "#DC2626", fontSize: 13, fontFamily: "Inter_500Medium", flex: 1 },
  field: { gap: 6 },
  label: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: "#374151" },
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
  dateRow: { flexDirection: "row", gap: 12 },
  colorRow: { flexDirection: "row", gap: 10, flexWrap: "wrap" },
  colorSwatch: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  colorSwatchSelected: { transform: [{ scale: 1.2 }], shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
  preview: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 14,
    borderLeftWidth: 4,
  },
  previewDot: { width: 10, height: 10, borderRadius: 5 },
  previewName: { fontSize: 15, fontFamily: "Inter_700Bold", color: "#0A1628" },
  previewDest: { fontSize: 13, fontFamily: "Inter_400Regular", color: "#6B7280", marginTop: 2 },
  submitBtn: {
    borderRadius: 14,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 4,
  },
  submitBtnDisabled: { opacity: 0.5 },
  submitText: { color: "#FFFFFF", fontSize: 16, fontFamily: "Inter_700Bold" },
});
