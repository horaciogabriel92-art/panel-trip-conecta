import { createElement } from "react";
import {
  Shield,
  Users,
  CreditCard,
  Gem,
  Clock,
  MapPin,
  Plane,
  Star,
  Heart,
  Check,
  Sparkles,
  Headphones,
  Award,
  Briefcase,
  Compass,
  Sun,
  Umbrella,
  ArrowRight,
  Search,
  ChevronLeft,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  Shield,
  Users,
  CreditCard,
  Gem,
  Clock,
  MapPin,
  Plane,
  Star,
  Heart,
  Check,
  Sparkles,
  Headphones,
  Award,
  Briefcase,
  Compass,
  Sun,
  Umbrella,
  ArrowRight,
  Search,
  ChevronLeft,
  ChevronRight,
};

export function getIcon(name: string): LucideIcon {
  return ICON_MAP[name] || Sparkles;
}

interface FeatureIconProps {
  name: string;
  className?: string;
}

export default function FeatureIcon({ name, className = "w-5 h-5" }: FeatureIconProps) {
  const Icon = getIcon(name);
  return createElement(Icon, { className });
}
