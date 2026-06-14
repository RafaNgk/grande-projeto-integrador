"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import type { HortaAggregates } from "@/lib/types"
import { TrendingDown } from "lucide-react"

const tooltipStyle = {
  backgroundColor: "var(--color-card)",
  border: "1px solid var(--color-border)",
  borderRadius: "8px",
  fontSize: "12px",
}

export function ReportSection({ data }: { data: HortaAggregates }) {
  const waterData = data.weeklyWater.map((d) => ({
    day: format(new Date(d.date), "EEE", { locale: ptBR }),
    litros: d.liters,
  }))

  const irrigationData = [...data.irrigationsByCanteiro]
    .sort((a, b) => b.count - a.count)
    .map((d) => ({ name: d.canteiroName.replace("Canteiro ", ""), irrigacoes: d.count }))

  const totalWeek = data.weeklyWater.reduce((acc, d) => acc + d.liters, 0)

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card className="bg-card">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Consumo semanal de água</CardTitle>
            <span className="flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-xs font-medium text-primary">
              <TrendingDown className="h-3 w-3" />
              {data.waterSavings}% economia
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Total na semana: {totalWeek.toFixed(1)} L
          </p>
        </CardHeader>
        <CardContent>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={waterData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="day" stroke="var(--color-muted-foreground)" fontSize={10} tickLine={false} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={10} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v} L`, "Consumo"]} cursor={{ fill: "var(--color-muted)", opacity: 0.3 }} />
                <Bar dataKey="litros" fill="var(--color-chart-2)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Irrigações por canteiro</CardTitle>
          <p className="text-xs text-muted-foreground">Total de acionamentos nos últimos 7 dias</p>
        </CardHeader>
        <CardContent>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={irrigationData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" horizontal={false} />
                <XAxis type="number" stroke="var(--color-muted-foreground)" fontSize={10} tickLine={false} />
                <YAxis type="category" dataKey="name" stroke="var(--color-muted-foreground)" fontSize={10} tickLine={false} width={40} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v} irrigações`, "Total"]} cursor={{ fill: "var(--color-muted)", opacity: 0.3 }} />
                <Bar dataKey="irrigacoes" fill="var(--color-primary)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
