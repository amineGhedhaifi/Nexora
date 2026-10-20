import { Clock, Mail, MapPin, Phone, type LucideIcon } from "lucide-react";

export interface ContactDetail {
  icon: LucideIcon;
  label: string;
  value: string;
  href?: string;
}

export const contactDetails: ContactDetail[] = [
  {
    icon: Mail,
    label: "Email",
    value: "support@nexora.example",
    href: "mailto:support@nexora.example",
  },
  {
    icon: Phone,
    label: "Phone",
    value: "+1 (555) 010-2030",
    href: "tel:+15550102030",
  },
  {
    icon: Clock,
    label: "Opening hours",
    value: "Monday to Friday, 9:00 to 17:00",
  },
  {
    icon: MapPin,
    label: "Address",
    value: "120 Market Street, Suite 4, Springfield",
  },
];

export const contactTopics: string[] = [
  "Order question",
  "Product question",
  "Returns and refunds",
  "Something else",
];
