import {
  ClipboardCheck,
  LifeBuoy,
  Search,
  ShieldCheck,
  Truck,
  Zap,
  type LucideIcon,
} from "lucide-react";

interface IconItem {
  icon: LucideIcon;
  title: string;
  text: string;
}

export const aboutStats: { value: string; label: string }[] = [
  { value: "12k+", label: "Orders delivered" },
  { value: "4.8", label: "Average rating" },
  { value: "48h", label: "Typical dispatch time" },
  { value: "30 days", label: "To return anything" },
];

export const aboutValues: IconItem[] = [
  {
    icon: ShieldCheck,
    title: "Quality you can trust",
    text: "Every product is reviewed before it joins the catalog, and we remove anything that doesn't meet our standard.",
  },
  {
    icon: Zap,
    title: "Ordering made simple",
    text: "No account required. Add to cart, enter your delivery details, and place your order in a couple of minutes.",
  },
  {
    icon: LifeBuoy,
    title: "Support that responds",
    text: "Questions about an order or a product? Our team replies within one business day.",
  },
];

export const aboutSteps: IconItem[] = [
  {
    icon: Search,
    title: "Choose what you love",
    text: "Browse by category, search, or filter by price to find the right product.",
  },
  {
    icon: ClipboardCheck,
    title: "Order in minutes",
    text: "Enter your delivery details. There's no account to create and no online payment step.",
  },
  {
    icon: Truck,
    title: "Follow your delivery",
    text: "Your order appears on the Orders page, moving from Ordered to Shipping to Delivered.",
  },
];
