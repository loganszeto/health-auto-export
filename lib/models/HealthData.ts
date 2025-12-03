export interface HealthMetric {
  name: string;
  units: string;
  data: Array<{
    date: string;
    qty: number;
  }>;
}

export interface HealthDataPayload {
  data: {
    metrics: HealthMetric[];
  };
}

export interface StoredHealthData {
  _id?: string;
  timestamp: Date;
  metrics: HealthMetric[];
  createdAt: Date;
}

