const primary = "#0D7377";
const primaryLight = "#14BDBE";
const amber = "#F5A623";
const navy = "#0A1628";

const colors = {
  light: {
    text: "#0A1628",
    textSecondary: "#6B7280",
    textMuted: "#9CA3AF",
    background: "#F8F9FB",
    surface: "#FFFFFF",
    surfaceElevated: "#FFFFFF",
    border: "#E5E7EB",
    tint: primary,
    tintLight: primaryLight,
    amber,
    navy,
    tabIconDefault: "#9CA3AF",
    tabIconSelected: primary,
    categories: {
      transport: "#3B82F6",
      accommodation: "#8B5CF6",
      food: "#F97316",
      nature: "#10B981",
      culture: "#EC4899",
      shopping: "#F59E0B",
      nightlife: "#6366F1",
      other: "#6B7280",
    },
    coverColors: [
      "#0D7377",
      "#1E40AF",
      "#7C3AED",
      "#DB2777",
      "#D97706",
      "#059669",
      "#DC2626",
      "#0891B2",
    ],
  },
};

export default colors;
export type ThemeColors = typeof colors.light;
