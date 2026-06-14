import type { CanteiroStatus } from "./types"

export const statusConfig: Record<
  CanteiroStatus,
  { label: string; badge: string; dot: string; ring: string }
> = {
  healthy: {
    label: "Saudável",
    badge: "bg-primary/15 text-primary border-primary/30",
    dot: "bg-primary",
    ring: "border-primary/40",
  },
  warning: {
    label: "Atenção",
    badge: "bg-chart-3/15 text-chart-3 border-chart-3/30",
    dot: "bg-chart-3",
    ring: "border-chart-3/40",
  },
  critical: {
    label: "Crítico",
    badge: "bg-destructive/15 text-destructive border-destructive/30",
    dot: "bg-destructive",
    ring: "border-destructive/40",
  },
  offline: {
    label: "Offline",
    badge: "bg-muted text-muted-foreground border-border",
    dot: "bg-muted-foreground",
    ring: "border-border",
  },
}

// Formata um valor que pode ser nulo (sensor offline / dado parcial)
export function fmt(value: number | null, suffix = ""): string {
  if (value === null || value === undefined) return "—"
  return `${value}${suffix}`
}
