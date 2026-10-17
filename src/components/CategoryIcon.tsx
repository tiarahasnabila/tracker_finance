import React from "react";
import {
  Briefcase,
  Laptop,
  Store,
  TrendingUp,
  Gift,
  PlusCircle,
  Utensils,
  Car,
  Home,
  GraduationCap,
  Receipt,
  HeartPulse,
  Gamepad2,
  ShoppingBag,
  PiggyBank,
  MoreHorizontal,
  Wallet,
  Tag,
  Coffee,
  Plane,
  Film,
  Zap,
  Folder,
  type LucideIcon,
} from "lucide-react";

export const AVAILABLE_ICONS: Record<string, LucideIcon> = {
  Briefcase,
  Laptop,
  Store,
  TrendingUp,
  Gift,
  PlusCircle,
  Utensils,
  Car,
  Home,
  GraduationCap,
  Receipt,
  HeartPulse,
  Gamepad2,
  ShoppingBag,
  PiggyBank,
  MoreHorizontal,
  Wallet,
  Tag,
  Coffee,
  Plane,
  Film,
  Zap,
  Folder,
};

interface CategoryIconProps {
  name?: string | null;
  className?: string;
  size?: number;
}

export function CategoryIcon({ name, className = "w-5 h-5", size = 20 }: CategoryIconProps) {
  if (!name || !AVAILABLE_ICONS[name]) {
    const Fallback = Tag;
    return <Fallback className={className} size={size} />;
  }

  const IconComponent = AVAILABLE_ICONS[name];
  return <IconComponent className={className} size={size} />;
}
