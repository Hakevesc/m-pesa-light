import type { ComponentType } from 'react';
import {
  ArrowLeft,
  Bell,
  Building2,
  CircleCheck,
  Coins,
  HelpCircle,
  Home,
  LayoutGrid,
  Lock,
  QrCode,
  Receipt,
  Scan,
  ScanLine,
  Send,
  ShieldCheck,
  Smartphone,
  Sparkles,
  User,
  UserCircle
} from 'lucide-react';
import type { LucideProps } from 'lucide-react';

const iconMap: Record<string, ComponentType<LucideProps>> = {
  'arrow-left': ArrowLeft,
  home: Home,
  sparkles: Sparkles,
  'qr-code': QrCode,
  'scan-line': ScanLine,
  scan: Scan,
  'shield-check': ShieldCheck,
  send: Send,
  'building-2': Building2,
  coins: Coins,
  lock: Lock,
  'circle-check': CircleCheck,
  receipt: Receipt,
  user: User,
  'user-circle': UserCircle,
  bell: Bell,
  smartphone: Smartphone,
  'help-circle': HelpCircle,
  layout: LayoutGrid
};

export function Icon({ name, size = 18, className }: { name: string; size?: number; className?: string }) {
  const IconComponent = iconMap[name] ?? LayoutGrid;
  return <IconComponent size={size} className={className} />;
}
