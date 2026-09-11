export type Mandi = {
  id: string;
  name: string;
  city: string;
  state: string;
  district: string;
  distanceKm: number;
  congestionStatus: string;
  freeCapacityPercentage: number;
  utilizationPercentage: number;
  smartRedirect: boolean;
  estimatedWaitMinutes: number;
  latitude: number;
  longitude: number;
};

export type QueueItem = {
  tokenId: string;
  tokenNumber: string;
  status: string;
  assignedCounter: number | null;
  estimatedWaitMinutes: number;
};

export type Token = {
  id: string;
  tokenNumber: string;
  status: string;
  cropType: string;
  quantityKg: number;
  assignedCounter: number | null;
  mandiId: string;
  slotTime: string;
  farmerId?: string;
  farmerPhone?: string;
  farmerName?: string;
  farmerLocation?: { latitude: number; longitude: number; timestamp: string };
};

export type Stats = {
  grainsProcuredKg: number;
  averageWaitMinutes: number;
  activeMandis: number;
};

export type CrowdStatus = "low" | "medium" | "high" | "very_high";

export type CrowdUpdate = {
  id: string;
  mandiId: string;
  crowdLevel: CrowdStatus;
  timestamp: string;
  notes?: string;
  updatedBy: string;
};

export type BookingUpdate = {
  tokenId: string;
  tokenNumber: string;
  farmerId: string;
  farmerName: string;
  farmerPhone: string;
  mandiId: string;
  mandiName: string;
  cropType: string;
  quantityKg: number;
  farmerLocation: { latitude: number; longitude: number; timestamp: string };
  slotTime: string;
  status: "BOOKED" | "GATE_ENTRY" | "QUALITY_VERIFIED" | "WEIGHED" | "PAYMENT_DISPATCHED";
};
