import { getDashboardStats, getBestSellingProducts, getRevenueOverview, getRecentOrders, } from "./dashboard.service.js";
export const getDashboard = async (_req, res, next) => {
    try {
        const [stats, bestSellingProducts, revenueOverview, recentOrders] = await Promise.all([
            getDashboardStats(),
            getBestSellingProducts(),
            getRevenueOverview(),
            getRecentOrders(),
        ]);
        res.status(200).json({
            stats,
            bestSellingProducts,
            revenueOverview,
            recentOrders,
        });
    }
    catch (error) {
        next(error);
    }
};
