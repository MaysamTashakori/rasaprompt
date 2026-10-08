// نگاشت حوزه → آیکن (Phosphor، سازگار با Server Components)
import {
  Code, ChartBar, Megaphone, Buildings, Target, GraduationCap, PenNib, Palette, Heartbeat, Scales, Translate, Lightning, ShieldCheck, MaskHappy, Leaf,
} from "@phosphor-icons/react/dist/ssr"
import type { Icon } from "@phosphor-icons/react"

export const FIELD_ICON: Record<string, Icon> = {
  coding: Code, data: ChartBar, marketing: Megaphone, business: Buildings, career: Target, education: GraduationCap, writing: PenNib,
  design: Palette, health: Heartbeat, legal: Scales, language: Translate, productivity: Lightning, security: ShieldCheck, fun: MaskHappy, life: Leaf,
}

export function FieldIcon({ id, className, weight = "duotone" }: { id: string; className?: string; weight?: "regular" | "duotone" | "fill" }) {
  const I = FIELD_ICON[id] ?? Lightning
  return <I className={className} weight={weight} aria-hidden />
}
