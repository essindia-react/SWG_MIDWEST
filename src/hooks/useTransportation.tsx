import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { dummyVehicles, dummyTrips } from "../data/dummyTransportation";
import type { Vehicle, TripRecord, VehicleStatus } from "../types/transportation";

interface TransportationContextValue {
  vehicles: Vehicle[];
  trips: TripRecord[];
  addVehicle: (vehicle: Omit<Vehicle, "id" | "vehicleId" | "createdAt" | "updatedAt">) => void;
  updateVehicle: (id: string, updates: Partial<Vehicle>) => void;
  deleteVehicle: (id: string) => void;
  getVehicleById: (id: string) => Vehicle | undefined;
  getTripsByVehicleId: (vehicleId: string) => TripRecord[];
}

const TransportationContext = createContext<TransportationContextValue | null>(null);

const VEHICLES_STORAGE_KEY = "swg_vehicles";
const TRIPS_STORAGE_KEY = "swg_trips";

export function TransportationProvider({ children }: { children: ReactNode }) {
  const [vehicles, setVehicles] = useState<Vehicle[]>(() => {
    const stored = localStorage.getItem(VEHICLES_STORAGE_KEY);
    return stored ? JSON.parse(stored) : dummyVehicles;
  });

  const [trips, setTrips] = useState<TripRecord[]>(() => {
    const stored = localStorage.getItem(TRIPS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : dummyTrips;
  });

  useEffect(() => {
    localStorage.setItem(VEHICLES_STORAGE_KEY, JSON.stringify(vehicles));
  }, [vehicles]);

  useEffect(() => {
    localStorage.setItem(TRIPS_STORAGE_KEY, JSON.stringify(trips));
  }, [trips]);

  const addVehicle = useCallback((input: Omit<Vehicle, "id" | "vehicleId" | "createdAt" | "updatedAt">) => {
    const now = new Date().toISOString();
    const newVehicle: Vehicle = {
      ...input,
      id: `veh-${Date.now()}`,
      vehicleId: `V-${String(vehicles.length + 1).padStart(3, "0")}`,
      createdAt: now,
      updatedAt: now,
    };
    setVehicles((prev) => [newVehicle, ...prev]);
  }, [vehicles.length]);

  const updateVehicle = useCallback((id: string, updates: Partial<Vehicle>) => {
    const now = new Date().toISOString();
    setVehicles((prev) =>
      prev.map((v) => (v.id === id ? { ...v, ...updates, updatedAt: now } : v))
    );
  }, []);

  const deleteVehicle = useCallback((id: string) => {
    setVehicles((prev) => prev.filter((v) => v.id !== id));
  }, []);

  const getVehicleById = useCallback((id: string) => {
    return vehicles.find((v) => v.id === id);
  }, [vehicles]);

  const getTripsByVehicleId = useCallback((vehicleId: string) => {
    return trips.filter((t) => t.vehicleId === vehicleId);
  }, [trips]);

  const value = useMemo(
    () => ({
      vehicles,
      trips,
      addVehicle,
      updateVehicle,
      deleteVehicle,
      getVehicleById,
      getTripsByVehicleId,
    }),
    [
      vehicles,
      trips,
      addVehicle,
      updateVehicle,
      deleteVehicle,
      getVehicleById,
      getTripsByVehicleId,
    ]
  );

  return (
    <TransportationContext.Provider value={value}>
      {children}
    </TransportationContext.Provider>
  );
}

export function useTransportation() {
  const context = useContext(TransportationContext);
  if (!context) {
    throw new Error("useTransportation must be used within a TransportationProvider");
  }
  return context;
}
