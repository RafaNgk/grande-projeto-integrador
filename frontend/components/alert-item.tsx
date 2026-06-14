"use client"

import type { Alert } from "@/lib/types"
import { AlertOctagon, AlertTriangle, Info, WifiOff, Droplets, Thermometer, Activity, Sprout } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"

const typeConfig = {
  critical: { border: "border-destructive/40", bg: "bg-destructive/10", icon: "text-destructive", label: "Crítico" },
  warning: { border: "border-chart-3/40", bg: "bg-chart-3/10", icon: "text-chart-3", label: "Atenção" },
  info: { border: "border-border", bg: "bg-card", icon: "text-chart-2", label: "Info" },
}

const categoryIcon = {
  soil_moisture: Droplets,
  temperature: Thermometer,
  humidity: Droplets,
  sensor_offline: WifiOff,
  suspect_reading: Activity,
  irrigation: Sprout,
}

export function AlertItem({ alert }: { alert: Alert }) {
  const cfg = typeConfig[alert.type]
  const CategoryIcon = categoryIcon[alert.category] ?? Info
  const TypeIcon = alert.type === "critical" ? AlertOctagon : alert.type === "warning" ? AlertTriangle : Info

  return (
    <div className={`flex items-start gap-3 rounded-xl border p-4 ${cfg.border} ${cfg.bg}`}>
      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-background/50">
        <CategoryIcon className={`h-4 w-4 ${cfg.icon}`} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-semibold">{alert.title}</p>
          <span className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${cfg.icon}`}>
            <TypeIcon className="h-3 w-3" />
            {cfg.label}
          </span>
          {alert.acknowledged && (
            <span className="rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground">
              Reconhecido
            </span>
          )}
        </div>
        <p className="mt-1 text-sm text-muted-foreground text-pretty">{alert.message}</p>
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          {alert.canteiroName && <span>{alert.canteiroName}</span>}
          <span>
            {formatDistanceToNow(new Date(alert.timestamp), { addSuffix: true, locale: ptBR })}
          </span>
        </div>
      </div>
    </div>
  )
}
