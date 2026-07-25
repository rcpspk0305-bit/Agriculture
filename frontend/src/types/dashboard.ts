export interface IoTData {
  temperature: number;
  humidity: number;
  ph: number;
  tds: number;
  rainfall: number;
  NPK: string;
}

export interface DashboardResponse {
  status: string;
  payload: {
    hero: {
      recommended_crop: string;
    };
    cards: IoTData;
  };
}
