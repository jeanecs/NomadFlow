export type ActivityCategory =
  | "transport"
  | "accommodation"
  | "food"
  | "nature"
  | "culture"
  | "shopping"
  | "nightlife"
  | "other";

export interface Trip {
  id: number;
  name: string;
  destination: string;
  startDate: string;
  endDate: string;
  coverColor: string;
  createdAt: string;
}

export interface TripDetail extends Trip {
  activities: Activity[];
}

export interface Activity {
  id: number;
  tripId: number;
  dayIndex: number;
  title: string;
  category: ActivityCategory;
  startTime: string;
  endTime?: string | null;
  location?: string | null;
  notes?: string | null;
  createdAt: string;
}

export interface CreateTripInput {
  name: string;
  destination: string;
  startDate: string;
  endDate: string;
  coverColor: string;
}

export interface CreateActivityInput {
  dayIndex: number;
  title: string;
  category: ActivityCategory;
  startTime: string;
  endTime?: string | null;
  location?: string | null;
  notes?: string | null;
}
