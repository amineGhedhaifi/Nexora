import { createBrowserRouter } from "react-router-dom";
import AuthLayout from "@/layouts/AuthLayout";
import StoreLayout from "@/layouts/StoreLayout";
import AdminLayout from "@/layouts/AdminLayout";
import { AdminRoute } from "@/routes/AdminRoute";
import { ClientRoute } from "@/routes/ClientRoute";
import { ProtectedRoute } from "@/routes/ProtectedRoute";
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import About from "@/pages/store/About";
import Cart from "@/pages/store/Cart";
import Checkout from "@/pages/store/Checkout";
import Contact from "@/pages/store/Contact";
import Home from "@/pages/store/Home";
import NotFound from "@/pages/store/NotFound";
import OrderDetails from "@/pages/store/OrderDetails";
import OrderSuccess from "@/pages/store/OrderSuccess";
import Orders from "@/pages/store/Orders";
import ProductDetails from "@/pages/store/ProductDetails";
import Profile from "@/pages/store/Profile";
import Shop from "@/pages/store/Shop";
import AdminDashboard from "@/pages/admin/Dashboard";
import AdminProducts from "@/pages/admin/Products";
import AdminCategories from "@/pages/admin/Categories";
import AdminOrders from "@/pages/admin/Orders";
import AdminOrderDetails from "@/pages/admin/OrderDetails";
import AdminMessages from "@/pages/admin/Messages";
import AdminCustomers from "@/pages/admin/Customers";
import AdminProfile from "@/pages/admin/Profile";

function withClientRoute(Component: React.ComponentType, protectedRoute = false) {
  return () => (
    <ClientRoute>
      {protectedRoute ? <ProtectedRoute><Component /></ProtectedRoute> : <Component />}
    </ClientRoute>
  );
}

// Routes are added here one page at a time, as each page is built.
export const router = createBrowserRouter([
  {
    path: "/",
    Component: StoreLayout,
    children: [
      { index: true, Component: withClientRoute(Home) },
      { path: "shop", Component: withClientRoute(Shop) },
      { path: "products/:slug", Component: withClientRoute(ProductDetails) },
      { path: "about", Component: withClientRoute(About) },
      { path: "contact", Component: withClientRoute(Contact) },
      { path: "cart", Component: withClientRoute(Cart) },
      { path: "checkout", Component: withClientRoute(Checkout) },
      { path: "order-success/:id", Component: withClientRoute(OrderSuccess) },
      { path: "orders", Component: withClientRoute(Orders) },
      { path: "orders/:id", Component: withClientRoute(OrderDetails) },
      { path: "profile", Component: withClientRoute(Profile, true) },
      { path: "*", Component: withClientRoute(NotFound) },
    ],
  },
  {
    // Full-screen auth pages: no store navbar or footer
    Component: AuthLayout,
    children: [
      { path: "login", Component: Login },
      { path: "register", Component: Register },
    ],
  },
  {
    path: "admin",
    Component: AdminLayout,
    children: [
      { index: true, Component: AdminDashboard },
      { path: "products", Component: AdminProducts },
      { path: "categories", Component: AdminCategories },
      { path: "orders", Component: AdminOrders },
      { path: "orders/:id", Component: AdminOrderDetails },
      { path: "messages", Component: AdminMessages },
      { path: "customers", Component: AdminCustomers },
      { path: "profile", Component: AdminProfile },
    ].map((route) => ({
      ...route,
      Component: () => <AdminRoute><route.Component /></AdminRoute>,
    })),
  },
]);
