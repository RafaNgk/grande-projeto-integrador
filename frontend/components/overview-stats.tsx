"use client"

import { Card, CardContent } from "@/components/ui/card"
import { fmt } from "@/lib/status"
import type { HortaAggregates } from "@/lib/types"
import { Thermometer, Droplets, Leaf, Sprout, CheckCircle2, AlertTriangle, AlertOctagon, WifiOff } from "lucide-react"

export function OverviewStats({ data }: { data: HortaAggregates }) {
  const kpis = [
    {
      label: "Temp. média",
      value: fmt(data.avgTemperature, "°C"),
      icon: Thermometer,
      color: "text-chart-4",
    },
    {
      label: "Umidade média",
      value: fmt(data.avgHumidity, "%"),
      icon: Droplets,
      color: "text-chart-2",
    },
    {
      label: "Solo médio",
      value: fmt(data.avgSoilMoisture, "%"),
      icon: Leaf,
      color: "text-primary",
    },
    {
      label: "Água hoje",
      value: `${data.totalWaterUsedToday} L`,
      icon: Sprout,
      color: "text-chart-2",
    },
  ]

  const statusItems = [
    { label: "Saudáveis", value: data.canteirosHealthy, icon: CheckCircle2, color: "text-primary" },
    { label: "Atenção", value: data.canteirosWarning, icon: AlertTriangle, color: "text-chart-3" },
    { label: "Críticos", value: data.canteirosCritical, icon: AlertOctagon, color: "text-destructive" },
    { label: "Offline", value: data.canteirosOffline, icon: WifiOff, color: "text-muted-foreground" },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {kpis.map((kpi) => {
        const Icon = kpi.icon
        return (
          <Card key={kpi.label} className="bg-card">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                <Icon className={`h-5 w-5 ${kpi.color}`} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{kpi.label}</p>
                <p className="text-xl font-bold">{kpi.value}</p>
              </div>
            </CardContent>
          </Card>
        )
      })}
      <Card className="bg-card sm:col-span-2 lg:col-span-4">
        <CardContent className="grid grid-cols-2 gap-4 p-4 sm:grid-cols-4">
          {statusItems.map((s) => {
            const Icon = s.icon
            return (
              <div key={s.label} className="flex items-center gap-2.5">
                <Icon className={`h-4 w-4 ${s.color}`} />
                <div>
                  <p className="text-lg font-bold leading-none">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>
    </div>
  )
}
