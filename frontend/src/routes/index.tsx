import { createBrowserRouter } from "react-router-dom";
import AuthLayout from "@/layouts/AuthLayout";
import StoreLayout from "@/layouts/StoreLayout";
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
import Shop from "@/pages/store/Shop";

// Routes are added here one page at a time, as each page is built.
export const router = createBrowserRouter([
  {
    path: "/",
    Component: StoreLayout,
    children: [
      { index: true, Component: Home },
      { path: "shop", Component: Shop },
      { path: "products/:slug", Component: ProductDetails },
      { path: "about", Component: About },
      { path: "contact", Component: Contact },
      { path: "cart", Component: Cart },
      { path: "checkout", Component: Checkout },
      { path: "order-success/:id", Component: OrderSuccess },
      { path: "orders", Component: Orders },
      { path: "orders/:id", Component: OrderDetails },
      { path: "*", Component: NotFound },
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
]);
