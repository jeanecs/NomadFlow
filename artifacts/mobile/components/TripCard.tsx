import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { useAnimatedStyle, withSpring, useSharedValue } from "react-native-reanimated";
import { Trip } from "@/types";
import { getDaysBetween, getDaysRemaining, getTripStatus, formatDateShort } from "@/utils/helpers";

interface TripCardProps {
  trip: Trip;
  onPress: () => void;
  onDelete: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function TripCard({ trip, onPress, onDelete }: TripCardProps) {
  const scale = useSharedValue(1);
  const status = getTripStatus(trip.startDate, trip.endDate);
  const daysRemaining = getDaysRemaining(trip.endDate);
  const totalDays = getDaysBetween(trip.startDate, trip.endDate);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const statusLabel = () => {
    if (status === "active") return "In Progress";
    if (status === "past") return "Completed";
    if (daysRemaining === 0) return "Tomorrow";
    if (daysRemaining === 1) return "In 1 day";
    return `In ${daysRemaining} days`;
  };

  const statusColor = () => {
    if (status === "active") return "#10B981";
    if (status === "past") return "#9CA3AF";
    return "#F5A623";
  };

  return (
    <AnimatedPressable
      style={[animatedStyle]}
      onPress={onPress}
      onPressIn={() => { scale.value = withSpring(0.97); }}
      onPressOut={() => { scale.value = withSpring(1); }}
    >
      <View style={[styles.card, { opacity: status === "past" ? 0.85 : 1 }]}>
        <View style={[styles.colorBar, { backgroundColor: trip.coverColor }]} />
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Text style={styles.tripName} numberOfLines={1}>{trip.name}</Text>
              <Pressable onPress={onDelete} hitSlop={12} style={styles.deleteBtn}>
                <Ionicons name="trash-outline" size={16} color="#9CA3AF" />
              </Pressable>
            </View>
            <View style={styles.destinationRow}>
              <Ionicons name="location-outline" size={13} color="#6B7280" />
              <Text style={styles.destination}>{trip.destination}</Text>
            </View>
          </View>

          <View style={styles.footer}>
            <View style={styles.dateRange}>
              <Ionicons name="calendar-outline" size={13} color="#6B7280" />
              <Text style={styles.dateText}>
                {formatDateShort(trip.startDate)} – {formatDateShort(trip.endDate)}
              </Text>
              <Text style={styles.daysText}>{totalDays}d</Text>
            </View>

            <View style={[styles.statusBadge, { backgroundColor: statusColor() + "22" }]}>
              {status === "active" && (
                <View style={[styles.activeDot, { backgroundColor: statusColor() }]} />
              )}
              <Text style={[styles.statusText, { color: statusColor() }]}>{statusLabel()}</Text>
            </View>
          </View>
        </View>
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    overflow: "hidden",
    flexDirection: "row",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 3,
    marginBottom: 12,
  },
  colorBar: {
    width: 5,
  },
  content: {
    flex: 1,
    padding: 16,
    gap: 10,
  },
  header: {
    gap: 4,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  tripName: {
    fontSize: 17,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
    color: "#0A1628",
    flex: 1,
  },
  deleteBtn: {
    padding: 4,
  },
  destinationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  destination: {
    fontSize: 13,
    color: "#6B7280",
    fontFamily: "Inter_400Regular",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dateRange: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  dateText: {
    fontSize: 12,
    color: "#6B7280",
    fontFamily: "Inter_400Regular",
  },
  daysText: {
    fontSize: 12,
    color: "#9CA3AF",
    fontFamily: "Inter_500Medium",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 5,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
});
