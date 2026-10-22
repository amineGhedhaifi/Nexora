export interface DashboardStats {
  revenue: string;
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
}

export interface BestSellingProduct {
  id: string;
  name: string;
  imageUrl: string | null;
  price: string;
  unitsSold: number;
}

export interface RevenueOverviewItem {
  month: string;
  revenue: number;
}

export interface RecentOrder {
  id: string;
  userId: string | null;
  customerName: string;
  totalAmount: string;
  status: string;
  createdAt: string;
}

export interface DashboardData {
  stats: DashboardStats;
  bestSellingProducts: BestSellingProduct[];
  revenueOverview: RevenueOverviewItem[];
  recentOrders: RecentOrder[];
}