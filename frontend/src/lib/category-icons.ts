import {
  Armchair,
  BookOpen,
  Dumbbell,
  Gamepad2,
  Headphones,
  HeartPulse,
  Package,
  Shirt,
  Sparkles,
  Watch,
  type LucideIcon,
} from "lucide-react";

// Matched against the slug, so new categories from the API still get a fitting icon
const keywordIcons: [keyword: string, icon: LucideIcon][] = [
  ["electronic", Headphones],
  ["beauty", Sparkles],
  ["book", BookOpen],
  ["cloth", Shirt],
  ["fashion", Shirt],
  ["home", Armchair],
  ["kitchen", Armchair],
  ["furniture", Armchair],
  ["sport", Dumbbell],
  ["outdoor", Dumbbell],
  ["fitness", Dumbbell],
  ["toy", Gamepad2],
  ["game", Gamepad2],
  ["accessor", Watch],
  ["jewel", Watch],
  ["health", HeartPulse],
];

/** Icon used on placeholder tiles for products without photos. */
export function getCategoryIcon(categorySlug: string): LucideIcon {
  const slug = categorySlug.toLowerCase();
  return (
    keywordIcons.find(([keyword]) => slug.includes(keyword))?.[1] ?? Package
  );
}
