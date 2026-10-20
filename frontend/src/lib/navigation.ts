export interface NavLinkItem {
  name: string;
  to: string;
}

export const mainNav: NavLinkItem[] = [
  { name: "Shop", to: "/shop" },
  { name: "About", to: "/about" },
  { name: "Contact", to: "/contact" },
  { name: "Orders", to: "/orders" },
];

export const shopLinks: NavLinkItem[] = [
  { name: "All products", to: "/shop" },
  { name: "New arrivals", to: "/shop?sort=newest" },
];

export const companyLinks: NavLinkItem[] = [
  { name: "About Nexora", to: "/about" },
  { name: "Contact us", to: "/contact" },
];

export const accountLinks: NavLinkItem[] = [
  { name: "Sign in", to: "/login" },
  { name: "Create account", to: "/register" },
  { name: "My orders", to: "/orders" },
];
