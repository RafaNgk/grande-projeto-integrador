"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import type { Canteiro } from "@/lib/types"
import { statusConfig, fmt } from "@/lib/status"
import { Thermometer, Droplets, Sun, Leaf, WifiOff } from "lucide-react"
import { Area, AreaChart, ResponsiveContainer } from "recharts"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface CanteiroCardProps {
  canteiro: Canteiro
  onClick?: () => void
  isSelected?: boolean
}

export function CanteiroCard({ canteiro, onClick, isSelected }: CanteiroCardProps) {
  const cfg = statusConfig[canteiro.status]
  const isOffline = canteiro.status === "offline"

  const chartData = canteiro.readings
    .slice(-12)
    .map((r) => ({ time: format(new Date(r.timestamp), "HH:mm"), temp: r.temperature }))
    .filter((d) => d.temp !== null)

  return (
    <Card
      className={`cursor-pointer border bg-card transition-all duration-200 hover:border-primary/40 ${
        isSelected ? "ring-2 ring-primary" : ""
      } ${cfg.ring}`}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (onClick && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault()
          onClick()
        }
      }}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{canteiro.name}</p>
            <p className="truncate text-xs text-muted-foreground">{canteiro.plant}</p>
          </div>
          <span
            className={`flex shrink-0 items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium ${cfg.badge}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
            {cfg.label}
          </span>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {isOffline ? (
          <div className="flex flex-col items-center justify-center gap-1 py-6 text-center">
            <WifiOff className="h-5 w-5 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">Sensor sem comunicação</p>
            <p className="text-xs text-muted-foreground/70">{canteiro.sensorId}</p>
          </div>
        ) : (
          <>
            <div className="mb-3 grid grid-cols-2 gap-3">
              <div className="flex items-center gap-1.5">
                <Thermometer className="h-3.5 w-3.5 text-chart-4" />
                <span className="text-sm font-medium">{fmt(canteiro.currentTemp, "°C")}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Droplets className="h-3.5 w-3.5 text-chart-2" />
                <span className="text-sm font-medium">{fmt(canteiro.currentHumidity, "%")}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Leaf className="h-3.5 w-3.5 text-primary" />
                <span className="text-sm font-medium">{fmt(canteiro.currentSoilMoisture, "%")}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Sun className="h-3.5 w-3.5 text-chart-3" />
                <span className="text-sm font-medium">{fmt(canteiro.currentLight, " lux")}</span>
              </div>
            </div>

            <div className="h-12 w-full">
              {chartData.length > 1 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id={`grad-${canteiro.id}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area
                      type="monotone"
                      dataKey="temp"
                      stroke="var(--color-primary)"
                      strokeWidth={1.5}
                      fill={`url(#grad-${canteiro.id})`}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                  Dados insuficientes
                </div>
              )}
            </div>
          </>
        )}

        <p className="mt-2 text-xs text-muted-foreground">
          Irrigado: {format(new Date(canteiro.lastWatered), "dd/MM HH:mm", { locale: ptBR })}
        </p>
      </CardContent>
    </Card>
  )
}
