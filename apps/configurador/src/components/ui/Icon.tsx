/* ==========================================================================
   Registro explícito dos ícones usados. Importar só o necessário mantém
   o bundle pequeno — nada de varrer a biblioteca inteira.
   ========================================================================== */
import {
  ArrowLeft, ArrowRight, ArrowUpRight, BriefcaseBusiness, Building2, CalendarCheck,
  Camera, Check, ChevronDown, CircleHelp, FilePlus2, Images, LayoutGrid, Mail,
  Info, Map, MapPin, MessageCircle, MessageSquareText, MousePointerClick, Package,
  Palette, PenLine, Quote,
  RotateCcw, Share2, Smartphone, Sparkles, Type, X,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const registry = {
  ArrowLeft, ArrowRight, ArrowUpRight, BriefcaseBusiness, Building2, CalendarCheck,
  Camera, Check, ChevronDown, CircleHelp, FilePlus2, Images, LayoutGrid, Mail,
  Info, Map, MapPin, MessageCircle, MessageSquareText, MousePointerClick, Package,
  Palette, PenLine, Quote,
  RotateCcw, Share2, Smartphone, Sparkles, Type, X,
} satisfies Record<string, LucideIcon>;

export type IconName = keyof typeof registry;

export function Icon({
  name,
  className = 'size-5',
  strokeWidth = 1.75,
}: {
  name: string;
  className?: string;
  strokeWidth?: number;
}) {
  const Cmp = registry[name as IconName] ?? Sparkles;
  return <Cmp className={className} strokeWidth={strokeWidth} aria-hidden />;
}
