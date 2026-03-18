import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { TripCard } from "@/components/TripCard";
import { CreateTripSheet } from "@/components/CreateTripSheet";
import { api } from "@/utils/api";
import { Trip, CreateTripInput } from "@/types";
import { getTripStatus } from "@/utils/helpers";

export default function TripsScreen() {
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);

  const { data: trips, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["trips"],
    queryFn: api.getTrips,
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateTripInput) => api.createTrip(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trips"] });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.deleteTrip(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trips"] });
    },
  });

  const handleDelete = useCallback((trip: Trip) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      "Delete Trip",
      `Remove "${trip.name}"? This will also delete all activities.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteMutation.mutate(trip.id),
        },
      ]
    );
  }, [deleteMutation]);

  const active = trips?.filter(t => getTripStatus(t.startDate, t.endDate) === "active") ?? [];
  const upcoming = trips?.filter(t => getTripStatus(t.startDate, t.endDate) === "upcoming") ?? [];
  const past = trips?.filter(t => getTripStatus(t.startDate, t.endDate) === "past") ?? [];

  const sections = [
    ...(active.length > 0 ? [{ type: "sectionHeader", label: "In Progress", key: "h-active" }] : []),
    ...active.map(t => ({ type: "trip", trip: t, key: `t-${t.id}` })),
    ...(upcoming.length > 0 ? [{ type: "sectionHeader", label: "Upcoming", key: "h-upcoming" }] : []),
    ...upcoming.map(t => ({ type: "trip", trip: t, key: `t-${t.id}` })),
    ...(past.length > 0 ? [{ type: "sectionHeader", label: "Past", key: "h-past" }] : []),
    ...past.map(t => ({ type: "trip", trip: t, key: `t-${t.id}` })),
  ];

  const webTop = Platform.OS === "web" ? 67 : 0;

  return (
    <View style={[styles.container, { paddingTop: insets.top + webTop }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.appName}>NomadFlow</Text>
          <Text style={styles.subtitle}>
            {trips?.length ? `${trips.length} trip${trips.length !== 1 ? "s" : ""}` : "Plan your adventures"}
          </Text>
        </View>
        <Pressable
          style={styles.addBtn}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setShowCreate(true);
          }}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </Pressable>
      </View>

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#0D7377" />
        </View>
      ) : (
        <FlatList
          data={sections}
          keyExtractor={(item) => item.key}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: Platform.OS === "web" ? 120 : insets.bottom + 100 },
          ]}
          showsVerticalScrollIndicator={false}
          scrollEnabled={!!(sections.length > 0)}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#0D7377" />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <View style={styles.emptyIcon}>
                <Ionicons name="airplane" size={40} color="#0D7377" />
              </View>
              <Text style={styles.emptyTitle}>No trips yet</Text>
              <Text style={styles.emptySubtitle}>Tap the + button to plan your first adventure</Text>
              <Pressable style={styles.emptyBtn} onPress={() => setShowCreate(true)}>
                <Ionicons name="add-circle" size={18} color="#fff" />
                <Text style={styles.emptyBtnText}>Create Trip</Text>
              </Pressable>
            </View>
          }
          renderItem={({ item }) => {
            if (item.type === "sectionHeader") {
              return <Text style={styles.sectionHeader}>{item.label}</Text>;
            }
            if (item.type === "trip" && item.trip) {
              return (
                <TripCard
                  trip={item.trip}
                  onPress={() => router.push({ pathname: "/trip/[id]", params: { id: String(item.trip!.id) } })}
                  onDelete={() => handleDelete(item.trip!)}
                />
              );
            }
            return null;
          }}
        />
      )}

      <CreateTripSheet
        visible={showCreate}
        onClose={() => setShowCreate(false)}
        onSubmit={createMutation.mutateAsync}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FB",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  appName: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    color: "#0A1628",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "#6B7280",
    marginTop: 2,
  },
  addBtn: {
    backgroundColor: "#0D7377",
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#0D7377",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  listContent: {
    paddingHorizontal: 16,
  },
  sectionHeader: {
    fontSize: 13,
    fontFamily: "Inter_700Bold",
    color: "#9CA3AF",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 10,
    marginTop: 6,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  empty: {
    alignItems: "center",
    paddingTop: 80,
    paddingHorizontal: 40,
    gap: 12,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#E6F4F4",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    color: "#0A1628",
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
  },
  emptyBtn: {
    backgroundColor: "#0D7377",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  emptyBtnText: {
    color: "#fff",
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
});
