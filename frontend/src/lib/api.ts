import axios from "axios";
import { DashboardResponse } from "@/types/dashboard";

const API_BASE = "http://localhost:8000";

export const getDashboardWindow = async (windowName: string): Promise<DashboardResponse> => {
  const response = await axios.get(`${API_BASE}/dashboard/windows/${windowName}`);
  return response.data;
};
