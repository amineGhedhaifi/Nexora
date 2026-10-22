import { apiRequest } from "./api";
import type { DashboardData } from "@/types/dashboard";

export const dashboardService = {
  async getDashboard(): Promise<DashboardData> {
    return apiRequest<DashboardData>("/dashboard", { auth: true });
  },
};