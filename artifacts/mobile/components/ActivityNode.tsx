import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { useAnimatedStyle, withSpring, useSharedValue } from "react-native-reanimated";
import { Activity } from "@/types";
import { formatTime } from "@/utils/helpers";
import { categoryIcon, categoryLabel } from "@/utils/helpers";
import colors from "@/constants/colors";

interface ActivityNodeProps {
  activity: Activity;
  isFirst: boolean;
  isLast: boolean;
  onDelete: () => void;
  onEdit: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function ActivityNode({ activity, isFirst, isLast, onDelete, onEdit }: ActivityNodeProps) {
  const scale = useSharedValue(1);
  const catColor = colors.light.categories[activity.category] ?? "#6B7280";

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      style={animatedStyle}
      onPress={onEdit}
      onPressIn={() => { scale.value = withSpring(0.98); }}
      onPressOut={() => { scale.value = withSpring(1); }}
    >
      <View style={styles.row}>
        {/* Timeline spine */}
        <View style={styles.spineContainer}>
          <View style={[styles.topLine, isFirst && styles.transparent]} />
          <View style={[styles.dot, { backgroundColor: catColor, borderColor: catColor + "33" }]}>
            <Ionicons name={categoryIcon(activity.category) as any} size={12} color="#fff" />
          </View>
          <View style={[styles.bottomLine, isLast && styles.transparent]} />
        </View>

        {/* Card */}
        <View style={styles.cardWrapper}>
          <View style={[styles.card, { borderLeftColor: catColor }]}>
            <View style={styles.cardHeader}>
              <View style={styles.timeCol}>
                <Text style={styles.time}>{formatTime(activity.startTime)}</Text>
                {activity.endTime ? (
                  <Text style={styles.endTime}>{formatTime(activity.endTime)}</Text>
                ) : null}
              </View>
              <View style={styles.mainCol}>
                <Text style={styles.title} numberOfLines={2}>{activity.title}</Text>
                <View style={[styles.categoryTag, { backgroundColor: catColor + "18" }]}>
                  <Text style={[styles.categoryText, { color: catColor }]}>
                    {categoryLabel(activity.category)}
                  </Text>
                </View>
                {activity.location ? (
                  <View style={styles.locationRow}>
                    <Ionicons name="location-outline" size={11} color="#9CA3AF" />
                    <Text style={styles.location} numberOfLines={1}>{activity.location}</Text>
                  </View>
                ) : null}
                {activity.notes ? (
                  <Text style={styles.notes} numberOfLines={2}>{activity.notes}</Text>
                ) : null}
              </View>
              <Pressable onPress={onDelete} hitSlop={12} style={styles.deleteBtn}>
                <Ionicons name="close-circle" size={18} color="#D1D5DB" />
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    paddingHorizontal: 16,
  },
  spineContainer: {
    width: 40,
    alignItems: "center",
  },
  topLine: {
    width: 2,
    flex: 1,
    backgroundColor: "#E5E7EB",
    minHeight: 12,
  },
  bottomLine: {
    width: 2,
    flex: 1,
    backgroundColor: "#E5E7EB",
    minHeight: 12,
  },
  transparent: {
    backgroundColor: "transparent",
  },
  dot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
  },
  cardWrapper: {
    flex: 1,
    paddingLeft: 10,
    paddingBottom: 12,
    paddingTop: 0,
    marginTop: -2,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderLeftWidth: 3,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    gap: 10,
  },
  timeCol: {
    minWidth: 52,
    paddingTop: 1,
  },
  time: {
    fontSize: 12,
    fontFamily: "Inter_700Bold",
    color: "#0A1628",
  },
  endTime: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: "#9CA3AF",
    marginTop: 2,
  },
  mainCol: {
    flex: 1,
    gap: 5,
  },
  title: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: "#0A1628",
    lineHeight: 20,
  },
  categoryTag: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  location: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "#9CA3AF",
    flex: 1,
  },
  notes: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "#6B7280",
    fontStyle: "italic",
  },
  deleteBtn: {
    paddingTop: 1,
  },
});
