import { ActivityCategory } from "@/types";

export function getDaysBetween(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diff = end.getTime() - start.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
}

export function getDaysRemaining(endDate: string): number {
  const end = new Date(endDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  const diff = end.getTime() - today.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function getTripStatus(startDate: string, endDate: string): "upcoming" | "active" | "past" {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 0);

  if (today < start) return "upcoming";
  if (today > end) return "past";
  return "active";
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function formatDateShort(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function formatTime(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, "0")} ${ampm}`;
}

export function getDayLabel(startDate: string, dayIndex: number): string {
  const date = new Date(startDate + "T00:00:00");
  date.setDate(date.getDate() + dayIndex);
  return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

export function inferCategory(title: string): ActivityCategory {
  const lower = title.toLowerCase();
  if (/(flight|airport|train|bus|taxi|uber|ferry|drive|transfer|depart|arrive)/i.test(lower)) return "transport";
  if (/(hotel|hostel|airbnb|resort|check.?in|check.?out|accommodation)/i.test(lower)) return "accommodation";
  if (/(eat|dinner|lunch|breakfast|cafe|restaurant|food|coffee|bar|brunch|snack|pizza|sushi)/i.test(lower)) return "food";
  if (/(hike|beach|park|waterfall|mountain|trail|lake|forest|garden|nature)/i.test(lower)) return "nature";
  if (/(museum|gallery|temple|church|castle|monument|tour|history|art|culture)/i.test(lower)) return "culture";
  if (/(shop|mall|market|store|boutique|souvenir|bazaar)/i.test(lower)) return "shopping";
  if (/(club|bar|pub|night|party|concert|show|festival)/i.test(lower)) return "nightlife";
  return "other";
}

export function categoryIcon(category: ActivityCategory): string {
  const icons: Record<ActivityCategory, string> = {
    transport: "airplane",
    accommodation: "bed",
    food: "restaurant",
    nature: "leaf",
    culture: "museum",
    shopping: "bag-handle",
    nightlife: "musical-notes",
    other: "ellipse",
  };
  return icons[category];
}

export function categoryLabel(category: ActivityCategory): string {
  const labels: Record<ActivityCategory, string> = {
    transport: "Transport",
    accommodation: "Stay",
    food: "Food & Drink",
    nature: "Nature",
    culture: "Culture",
    shopping: "Shopping",
    nightlife: "Nightlife",
    other: "Other",
  };
  return labels[category];
}

export function generateId(): string {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}
