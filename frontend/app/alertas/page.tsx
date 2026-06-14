"use client"

import { useMemo, useState } from "react"
import { useAlerts, useCanteiros } from "@/lib/hooks"
import { PageHeader } from "@/components/page-header"
import { ErrorState, EmptyState, LoadingBlock } from "@/components/data-states"
import { AlertItem } from "@/components/alert-item"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { AlertType } from "@/lib/types"
import { RefreshCw, Bell, AlertOctagon, AlertTriangle, Info } from "lucide-react"

type PeriodFilter = "all" | "1h" | "6h" | "24h"

const typeLabels: Record<AlertType | "all", string> = {
  all: "Todos os tipos",
  critical: "Crítico",
  warning: "Atenção",
  info: "Informativo",
}

export default function AlertasPage() {
  const { data: alerts, error, isLoading, mutate } = useAlerts()
  const { data: canteiros } = useCanteiros()

  const [canteiroFilter, setCanteiroFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState<AlertType | "all">("all")
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>("all")

  const filtered = useMemo(() => {
    if (!alerts) return []
    const now = Date.now()
    const periodMs: Record<PeriodFilter, number> = {
      all: Infinity,
      "1h": 3600_000,
      "6h": 6 * 3600_000,
      "24h": 24 * 3600_000,
    }
    return alerts.filter((a) => {
      if (canteiroFilter !== "all" && a.canteiroId !== canteiroFilter) return false
      if (typeFilter !== "all" && a.type !== typeFilter) return false
      if (periodFilter !== "all" && now - new Date(a.timestamp).getTime() > periodMs[periodFilter]) return false
      return true
    })
  }, [alerts, canteiroFilter, typeFilter, periodFilter])

  const counts = useMemo(() => {
    return {
      critical: alerts?.filter((a) => a.type === "critical").length ?? 0,
      warning: alerts?.filter((a) => a.type === "warning").length ?? 0,
      info: alerts?.filter((a) => a.type === "info").length ?? 0,
    }
  }, [alerts])

  const hasActiveFilters = canteiroFilter !== "all" || typeFilter !== "all" || periodFilter !== "all"

  function clearFilters() {
    setCanteiroFilter("all")
    setTypeFilter("all")
    setPeriodFilter("all")
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Alertas" description="Notificações dos sensores e condições da horta">
        <Button variant="outline" size="sm" onClick={() => mutate()} className="gap-2">
          <RefreshCw className="h-3.5 w-3.5" />
          Atualizar
        </Button>
      </PageHeader>

      {/* Resumo por tipo */}
      <div className="grid grid-cols-3 gap-3">
        <SummaryCard icon={<AlertOctagon className="h-4 w-4 text-destructive" />} label="Críticos" value={counts.critical} />
        <SummaryCard icon={<AlertTriangle className="h-4 w-4 text-chart-3" />} label="Atenção" value={counts.warning} />
        <SummaryCard icon={<Info className="h-4 w-4 text-chart-2" />} label="Informativos" value={counts.info} />
      </div>

      {/* Filtros */}
      <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center">
        <span className="text-sm font-medium text-muted-foreground">Filtros:</span>
        <div className="grid grid-cols-1 gap-3 sm:flex sm:flex-1 sm:flex-wrap">
          <Select value={canteiroFilter} onValueChange={setCanteiroFilter}>
            <SelectTrigger className="sm:w-44" aria-label="Filtrar por canteiro">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os canteiros</SelectItem>
              {canteiros?.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as AlertType | "all")}>
            <SelectTrigger className="sm:w-40" aria-label="Filtrar por tipo">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(typeLabels) as (AlertType | "all")[]).map((k) => (
                <SelectItem key={k} value={k}>
                  {typeLabels[k]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={periodFilter} onValueChange={(v) => setPeriodFilter(v as PeriodFilter)}>
            <SelectTrigger className="sm:w-40" aria-label="Filtrar por período">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todo o período</SelectItem>
              <SelectItem value="1h">Última hora</SelectItem>
              <SelectItem value="6h">Últimas 6 horas</SelectItem>
              <SelectItem value="24h">Últimas 24 horas</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Limpar
          </Button>
        )}
      </div>

      {/* Lista */}
      {isLoading ? (
        <LoadingBlock className="h-96" />
      ) : error ? (
        <ErrorState message={(error as Error).message} onRetry={() => mutate()} />
      ) : filtered.length === 0 ? (
        <EmptyState
          title={hasActiveFilters ? "Nenhum alerta com esses filtros" : "Tudo sob controle"}
          message={hasActiveFilters ? "Tente ajustar ou limpar os filtros." : "Nenhum alerta ativo no momento."}
          action={
            hasActiveFilters ? (
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Limpar filtros
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            {filtered.length} {filtered.length === 1 ? "alerta" : "alertas"}
          </p>
          {filtered.map((alert) => (
            <AlertItem key={alert.id} alert={alert} />
          ))}
        </div>
      )}
    </div>
  )
}

function SummaryCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">{icon}</div>
      <div>
        <p className="text-2xl font-bold leading-none">{value}</p>
        <p className="mt-1 text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  )
}
