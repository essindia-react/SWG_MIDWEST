export type VehicleType = "Truck" | "Trailer" | "Van" | "Equipment Trailer";

export type VehicleStatus =
  | "Available"
  | "In Transit"
  | "At Job Site"
  | "In Maintenance";

export type LiveTrackingStatus = "En Route" | "On Site" | "Returning" | "Idle";

export interface Vehicle {
  id: string;
  vehicleId: string; // Auto-generated
  name: string;
  type: VehicleType;
  licensePlate: string;
  gpsDeviceId: string;
  status: VehicleStatus;
  assignedDriverId?: string;
  assignedProjectId?: string;
  currentLocation?: string;
  lastUpdated?: string; // ISO string
  todayMileage: number;
  createdAt: string;
  updatedAt: string;
}

export type TripStatus = "Completed" | "In Progress";

export interface TripRecord {
  id: string;
  vehicleId: string;
  driverId: string;
  startTime: string; // ISO string
  endTime?: string; // ISO string
  startLocation: string;
  endLocation?: string;
  distanceTravelled: number; // in miles
  mileage: number; // odometer reading at end of trip
  status: TripStatus;
  projectId?: string;
}

export interface TimelineEvent {
  id: string;
  type: "clock-in" | "departed" | "arrived" | "completed" | "returned";
  timestamp: string;
  location: string;
  label: string;
  description?: string;
}
