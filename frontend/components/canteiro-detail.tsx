"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Canteiro } from "@/lib/types"
import { statusConfig, fmt } from "@/lib/status"
import { Thermometer, Droplets, Sun, Leaf, Calendar, Clock, WifiOff } from "lucide-react"
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
  Legend,
} from "recharts"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { EmptyState } from "@/components/data-states"

const tooltipStyle = {
  backgroundColor: "var(--color-card)",
  border: "1px solid var(--color-border)",
  borderRadius: "8px",
  fontSize: "12px",
}

export function CanteiroDetail({ canteiro }: { canteiro: Canteiro }) {
  const cfg = statusConfig[canteiro.status]
  const isOffline = canteiro.status === "offline"

  const chartData = canteiro.readings
    .filter((r) => r.temperature !== null || r.humidity !== null)
    .map((r) => ({
      time: format(new Date(r.timestamp), "HH:mm"),
      temperatura: r.temperature,
      umidade: r.humidity,
      soloUmidade: r.soilMoisture,
    }))

  const validTemps = canteiro.readings.map((r) => r.temperature).filter((t): t is number => t !== null)
  const validHum = canteiro.readings.map((r) => r.humidity).filter((h): h is number => h !== null)
  const avgTemp = validTemps.length ? (validTemps.reduce((a, b) => a + b, 0) / validTemps.length).toFixed(1) : "—"
  const maxTemp = validTemps.length ? Math.max(...validTemps).toFixed(1) : "—"
  const minTemp = validTemps.length ? Math.min(...validTemps).toFixed(1) : "—"
  const avgHum = validHum.length ? Math.round(validHum.reduce((a, b) => a + b, 0) / validHum.length) : "—"

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">{canteiro.name}</h2>
          <p className="text-muted-foreground">
            {canteiro.plant} • {canteiro.area} m² • Sensor {canteiro.sensorId}
          </p>
        </div>
        <span className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-medium ${cfg.badge}`}>
          <span className={`h-2 w-2 rounded-full ${cfg.dot}`} />
          {cfg.label}
        </span>
      </div>

      {isOffline ? (
        <EmptyState
          title="Sensor offline"
          message={`O sensor ${canteiro.sensorId} não está enviando dados. As leituras abaixo podem estar indisponíveis ou desatualizadas.`}
        />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <StatCard icon={<Thermometer className="h-4 w-4 text-chart-4" />} label="Temperatura" value={fmt(canteiro.currentTemp, "°C")} sub={`Min ${minTemp}° / Max ${maxTemp}°`} />
            <StatCard icon={<Droplets className="h-4 w-4 text-chart-2" />} label="Umidade Ar" value={fmt(canteiro.currentHumidity, "%")} sub={`Média ${avgHum}%`} />
            <StatCard
              icon={<Leaf className="h-4 w-4 text-primary" />}
              label="Umidade Solo"
              value={fmt(canteiro.currentSoilMoisture, "%")}
              sub={canteiro.currentSoilMoisture !== null && canteiro.currentSoilMoisture < canteiro.idealSoilMoistureMin ? "Irrigar!" : "Adequado"}
            />
            <StatCard icon={<Sun className="h-4 w-4 text-chart-3" />} label="Luminosidade" value={fmt(canteiro.currentLight)} sub="lux" />
          </div>

          <Card className="bg-secondary/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Temperatura e Umidade</CardTitle>
            </CardHeader>
            <CardContent>
              {chartData.length > 1 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                      <XAxis dataKey="time" stroke="var(--color-muted-foreground)" fontSize={10} tickLine={false} minTickGap={20} />
                      <YAxis yAxisId="temp" stroke="var(--color-muted-foreground)" fontSize={10} tickLine={false} domain={["dataMin - 2", "dataMax + 2"]} />
                      <YAxis yAxisId="hum" orientation="right" stroke="var(--color-muted-foreground)" fontSize={10} tickLine={false} domain={[0, 100]} />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      <Line yAxisId="temp" type="monotone" dataKey="temperatura" stroke="var(--color-chart-4)" strokeWidth={2} dot={false} name="Temp (°C)" connectNulls />
                      <Line yAxisId="hum" type="monotone" dataKey="umidade" stroke="var(--color-chart-2)" strokeWidth={2} dot={false} name="Umidade (%)" connectNulls />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <EmptyState title="Sem dados" message="Não há leituras válidas suficientes." />
              )}
            </CardContent>
          </Card>

          <Card className="bg-secondary/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Umidade do Solo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="soilGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <XAxis dataKey="time" stroke="var(--color-muted-foreground)" fontSize={10} tickLine={false} minTickGap={20} />
                    <YAxis stroke="var(--color-muted-foreground)" fontSize={10} tickLine={false} domain={[0, 100]} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Area type="monotone" dataKey="soloUmidade" stroke="var(--color-primary)" strokeWidth={2} fill="url(#soilGrad)" name="Solo (%)" connectNulls />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      <div className="grid grid-cols-2 gap-3">
        <InfoCard icon={<Calendar className="h-4 w-4" />} label="Plantio" value={format(new Date(canteiro.plantedDate), "dd/MM/yyyy", { locale: ptBR })} />
        <InfoCard
          icon={<Clock className="h-4 w-4" />}
          label="Colheita estimada"
          value={canteiro.estimatedHarvest === "Contínuo" ? "Contínuo" : format(new Date(canteiro.estimatedHarvest), "dd/MM/yyyy", { locale: ptBR })}
        />
      </div>
    </div>
  )
}

function StatCard({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub: string }) {
  return (
    <Card className="bg-secondary/30">
      <CardContent className="p-4">
        <div className="mb-1 flex items-center gap-2 text-muted-foreground">
          {icon}
          <span className="text-xs">{label}</span>
        </div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-xs text-muted-foreground">{sub}</p>
      </CardContent>
    </Card>
  )
}

function InfoCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <Card className="bg-secondary/30">
      <CardContent className="p-4">
        <div className="mb-2 flex items-center gap-2 text-muted-foreground">
          {icon}
          <span className="text-xs">{label}</span>
        </div>
        <p className="text-sm font-medium">{value}</p>
      </CardContent>
    </Card>
  )
}
