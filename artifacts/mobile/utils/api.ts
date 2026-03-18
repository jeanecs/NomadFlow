import { Trip, TripDetail, Activity, CreateTripInput, CreateActivityInput } from "@/types";

const BASE = process.env.EXPO_PUBLIC_DOMAIN
  ? `https://${process.env.EXPO_PUBLIC_DOMAIN}/api`
  : "/api";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  getTrips: () => request<Trip[]>("/trips"),
  createTrip: (data: CreateTripInput) =>
    request<Trip>("/trips", { method: "POST", body: JSON.stringify(data) }),
  getTrip: (id: number) => request<TripDetail>(`/trips/${id}`),
  deleteTrip: (id: number) => request<void>(`/trips/${id}`, { method: "DELETE" }),

  getActivities: (tripId: number, dayIndex?: number) =>
    request<Activity[]>(`/trips/${tripId}/activities${dayIndex !== undefined ? `?dayIndex=${dayIndex}` : ""}`),
  createActivity: (tripId: number, data: CreateActivityInput) =>
    request<Activity>(`/trips/${tripId}/activities`, { method: "POST", body: JSON.stringify(data) }),
  updateActivity: (tripId: number, activityId: number, data: Partial<CreateActivityInput>) =>
    request<Activity>(`/trips/${tripId}/activities/${activityId}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteActivity: (tripId: number, activityId: number) =>
    request<void>(`/trips/${tripId}/activities/${activityId}`, { method: "DELETE" }),
};
