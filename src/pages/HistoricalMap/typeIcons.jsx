import {
  Swords,
  User,
  Crown,
  Landmark,
  Building2,
  Shield,
  ScrollText,
  BookOpen,
} from "lucide-react";

/**
 * Icon lucide nhất quán cho từng loại node (thay emoji cho gọn & chuyên nghiệp).
 */
const TYPE_ICON = {
  battle: Swords,
  person: User,
  dynasty: Crown,
  heritage: Landmark,
  capital: Building2,
  enemy: Shield,
  event: ScrollText,
  artifact: BookOpen,
};

export function TypeIcon({ type, className = "h-3.5 w-3.5" }) {
  const Icon = TYPE_ICON[type] || Landmark;
  return <Icon className={className} />;
}
