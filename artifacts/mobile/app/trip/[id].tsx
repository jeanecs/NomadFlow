import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import { ActivityNode } from "@/components/ActivityNode";
import { AddActivitySheet } from "@/components/AddActivitySheet";
import { api } from "@/utils/api";
import { Activity, CreateActivityInput } from "@/types";
import { getDaysBetween, getDayLabel, formatDateShort, getTripStatus } from "@/utils/helpers";

export default function TripDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const tripId = parseInt(id, 10);
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const [selectedDay, setSelectedDay] = useState(0);
  const [showAddActivity, setShowAddActivity] = useState(false);

  const { data: trip, isLoading } = useQuery({
    queryKey: ["trip", tripId],
    queryFn: () => api.getTrip(tripId),
  });

  const createActivityMutation = useMutation({
    mutationFn: (data: CreateActivityInput) => api.createActivity(tripId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trip", tripId] });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
  });

  const deleteActivityMutation = useMutation({
    mutationFn: (activityId: number) => api.deleteActivity(tripId, activityId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trip", tripId] });
    },
  });

  const handleDeleteActivity = useCallback((activity: Activity) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      "Delete Activity",
      `Remove "${activity.title}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteActivityMutation.mutate(activity.id),
        },
      ]
    );
  }, [deleteActivityMutation]);

  const totalDays = trip ? getDaysBetween(trip.startDate, trip.endDate) : 1;

  const dayActivities = useMemo(() => {
    if (!trip) return [];
    return (trip.activities ?? [])
      .filter(a => a.dayIndex === selectedDay)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [trip, selectedDay]);

  const status = trip ? getTripStatus(trip.startDate, trip.endDate) : "upcoming";

  const webTop = Platform.OS === "web" ? 67 : 0;

  if (isLoading) {
    return (
      <View style={[styles.centered, { paddingTop: insets.top + webTop }]}>
        <ActivityIndicator size="large" color="#0D7377" />
      </View>
    );
  }

  if (!trip) {
    return (
      <View style={[styles.centered, { paddingTop: insets.top + webTop }]}>
        <Text style={styles.errorText}>Trip not found</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top + webTop }]}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <Pressable style={styles.backBtn} onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="arrow-back" size={22} color="#0A1628" />
        </Pressable>
        <View style={styles.topBarCenter}>
          <Text style={styles.tripName} numberOfLines={1}>{trip.name}</Text>
          <View style={styles.destinationRow}>
            <Ionicons name="location-outline" size={12} color="#6B7280" />
            <Text style={styles.destination}>{trip.destination}</Text>
          </View>
        </View>
        <View style={[styles.statusPill, { backgroundColor: statusColor(status) + "22" }]}>
          <Text style={[styles.statusText, { color: statusColor(status) }]}>
            {statusLabel(status, trip.endDate)}
          </Text>
        </View>
      </View>

      {/* Date range */}
      <View style={styles.dateBar}>
        <Ionicons name="calendar-outline" size={14} color="#9CA3AF" />
        <Text style={styles.dateRange}>
          {formatDateShort(trip.startDate)} – {formatDateShort(trip.endDate)} · {totalDays} day{totalDays !== 1 ? "s" : ""}
        </Text>
      </View>

      {/* Day tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.dayTabsScroll}
        contentContainerStyle={styles.dayTabsContent}
      >
        {Array.from({ length: totalDays }).map((_, i) => {
          const actCount = trip.activities?.filter(a => a.dayIndex === i).length ?? 0;
          const isSelected = selectedDay === i;
          return (
            <Pressable
              key={i}
              onPress={() => {
                setSelectedDay(i);
                Haptics.selectionAsync();
              }}
              style={[
                styles.dayTab,
                isSelected && { backgroundColor: trip.coverColor },
              ]}
            >
              <Text style={[styles.dayTabLabel, isSelected && { color: "#fff" }]}>
                Day {i + 1}
              </Text>
              <Text style={[styles.dayTabDate, isSelected && { color: "#ffffff99" }]}>
                {getDayLabel(trip.startDate, i).split(",")[0]}
              </Text>
              {actCount > 0 && (
                <View style={[styles.dayBadge, isSelected ? { backgroundColor: "#ffffff55" } : { backgroundColor: trip.coverColor }]}>
                  <Text style={styles.dayBadgeText}>{actCount}</Text>
                </View>
              )}
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Day header */}
      <View style={styles.dayHeader}>
        <View>
          <Text style={styles.dayTitle}>Day {selectedDay + 1}</Text>
          <Text style={styles.daySubtitle}>{getDayLabel(trip.startDate, selectedDay)}</Text>
        </View>
        <Text style={styles.activityCount}>
          {dayActivities.length} {dayActivities.length === 1 ? "activity" : "activities"}
        </Text>
      </View>

      {/* Timeline */}
      <ScrollView
        style={styles.timeline}
        contentContainerStyle={[
          styles.timelineContent,
          { paddingBottom: Platform.OS === "web" ? 140 : insets.bottom + 120 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {dayActivities.length === 0 ? (
          <View style={styles.emptyDay}>
            <View style={styles.emptyDayIcon}>
              <Ionicons name="map-outline" size={32} color="#0D7377" />
            </View>
            <Text style={styles.emptyDayTitle}>Nothing planned yet</Text>
            <Text style={styles.emptyDayText}>Tap the + button to add an activity</Text>
          </View>
        ) : (
          dayActivities.map((activity, index) => (
            <ActivityNode
              key={activity.id}
              activity={activity}
              isFirst={index === 0}
              isLast={index === dayActivities.length - 1}
              onDelete={() => handleDeleteActivity(activity)}
              onEdit={() => {}}
            />
          ))
        )}
      </ScrollView>

      {/* FAB */}
      <View style={[styles.fabContainer, { bottom: Platform.OS === "web" ? 50 : insets.bottom + 24 }]}>
        <Pressable
          style={[styles.fab, { backgroundColor: trip.coverColor }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setShowAddActivity(true);
          }}
        >
          <Ionicons name="add" size={28} color="#fff" />
        </Pressable>
      </View>

      <AddActivitySheet
        visible={showAddActivity}
        onClose={() => setShowAddActivity(false)}
        onSubmit={createActivityMutation.mutateAsync}
        dayIndex={selectedDay}
        totalDays={totalDays}
      />
    </View>
  );
}

function statusColor(status: string): string {
  if (status === "active") return "#10B981";
  if (status === "past") return "#9CA3AF";
  return "#F5A623";
}

function statusLabel(status: string, endDate: string): string {
  if (status === "active") return "Active";
  if (status === "past") return "Completed";
  return "Upcoming";
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FB" },
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  errorText: { color: "#6B7280", fontFamily: "Inter_400Regular", fontSize: 16 },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  topBarCenter: { flex: 1 },
  tripName: { fontSize: 18, fontFamily: "Inter_700Bold", color: "#0A1628", letterSpacing: -0.3 },
  destinationRow: { flexDirection: "row", alignItems: "center", gap: 3, marginTop: 2 },
  destination: { fontSize: 12, fontFamily: "Inter_400Regular", color: "#6B7280" },
  statusPill: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  statusText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  dateBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  dateRange: { fontSize: 13, fontFamily: "Inter_400Regular", color: "#9CA3AF" },
  dayTabsScroll: { maxHeight: 72 },
  dayTabsContent: { paddingHorizontal: 16, gap: 8 },
  dayTab: {
    minWidth: 64,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
    position: "relative",
  },
  dayTabLabel: { fontSize: 13, fontFamily: "Inter_700Bold", color: "#0A1628" },
  dayTabDate: { fontSize: 11, fontFamily: "Inter_400Regular", color: "#9CA3AF", marginTop: 2 },
  dayBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 5,
  },
  dayBadgeText: { fontSize: 10, fontFamily: "Inter_700Bold", color: "#fff" },
  dayHeader: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 10,
  },
  dayTitle: { fontSize: 20, fontFamily: "Inter_700Bold", color: "#0A1628" },
  daySubtitle: { fontSize: 13, fontFamily: "Inter_400Regular", color: "#6B7280", marginTop: 2 },
  activityCount: { fontSize: 12, fontFamily: "Inter_500Medium", color: "#9CA3AF" },
  timeline: { flex: 1 },
  timelineContent: { paddingTop: 8 },
  emptyDay: {
    alignItems: "center",
    paddingTop: 60,
    paddingHorizontal: 40,
    gap: 10,
  },
  emptyDayIcon: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: "#E6F4F4",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  emptyDayTitle: { fontSize: 18, fontFamily: "Inter_700Bold", color: "#0A1628", textAlign: "center" },
  emptyDayText: { fontSize: 14, fontFamily: "Inter_400Regular", color: "#9CA3AF", textAlign: "center" },
  fabContainer: {
    position: "absolute",
    right: 20,
    alignItems: "center",
  },
  fab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
});
