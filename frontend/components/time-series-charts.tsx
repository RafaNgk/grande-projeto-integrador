"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { format } from "date-fns"
import type { Canteiro } from "@/lib/types"
import { EmptyState } from "@/components/data-states"

type Metric = "temperatura" | "umidade" | "luz"

const metricConfig: Record<
  Metric,
  { label: string; key: "temperature" | "humidity" | "lightLevel"; color: string; suffix: string }
> = {
  temperatura: { label: "Temperatura", key: "temperature", color: "var(--color-chart-4)", suffix: "°C" },
  umidade: { label: "Umidade", key: "humidity", color: "var(--color-chart-2)", suffix: "%" },
  luz: { label: "Luminosidade", key: "lightLevel", color: "var(--color-chart-3)", suffix: " lux" },
}

const tooltipStyle = {
  backgroundColor: "var(--color-card)",
  border: "1px solid var(--color-border)",
  borderRadius: "8px",
  fontSize: "12px",
}

export function TimeSeriesCharts({ canteiros }: { canteiros: Canteiro[] }) {
  const [metric, setMetric] = useState<Metric>("temperatura")
  const onlineCanteiros = canteiros.filter((c) => c.status !== "offline")
  const [canteiroId, setCanteiroId] = useState<string>(onlineCanteiros[0]?.id ?? "")

  const cfg = metricConfig[metric]
  const canteiro = canteiros.find((c) => c.id === canteiroId)

  const chartData = useMemo(() => {
    if (!canteiro) return []
    return canteiro.readings
      .map((r) => ({
        time: format(new Date(r.timestamp), "dd/MM HH'h'"),
        value: r[cfg.key],
      }))
      .filter((d) => d.value !== null)
  }, [canteiro, cfg.key])

  return (
    <Card className="bg-card">
      <CardHeader className="gap-4 pb-2">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-base">Leituras ao longo do tempo</CardTitle>
          <Select value={canteiroId} onValueChange={setCanteiroId}>
            <SelectTrigger className="w-full sm:w-48" aria-label="Selecionar canteiro">
              <SelectValue placeholder="Selecione um canteiro" />
            </SelectTrigger>
            <SelectContent>
              {onlineCanteiros.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name} — {c.plant}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Tabs value={metric} onValueChange={(v) => setMetric(v as Metric)}>
          <TabsList>
            <TabsTrigger value="temperatura">Temperatura</TabsTrigger>
            <TabsTrigger value="umidade">Umidade</TabsTrigger>
            <TabsTrigger value="luz">Luminosidade</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        {chartData.length > 1 ? (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              {metric === "luz" ? (
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="lightGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={cfg.color} stopOpacity={0.35} />
                      <stop offset="100%" stopColor={cfg.color} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="time" stroke="var(--color-muted-foreground)" fontSize={10} tickLine={false} minTickGap={24} />
                  <YAxis stroke="var(--color-muted-foreground)" fontSize={10} tickLine={false} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v}${cfg.suffix}`, cfg.label]} />
                  <Area type="monotone" dataKey="value" stroke={cfg.color} strokeWidth={2} fill="url(#lightGrad)" />
                </AreaChart>
              ) : (
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="time" stroke="var(--color-muted-foreground)" fontSize={10} tickLine={false} minTickGap={24} />
                  <YAxis
                    stroke="var(--color-muted-foreground)"
                    fontSize={10}
                    tickLine={false}
                    domain={metric === "umidade" ? [0, 100] : ["dataMin - 2", "dataMax + 2"]}
                  />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v}${cfg.suffix}`, cfg.label]} />
                  <Line type="monotone" dataKey="value" stroke={cfg.color} strokeWidth={2} dot={false} />
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>
        ) : (
          <EmptyState
            title="Sem dados para exibir"
            message="O canteiro selecionado não possui leituras válidas suficientes."
          />
        )}
      </CardContent>
    </Card>
  )
}
