"use client"

import { useState } from "react"
import { useCanteiros, useAggregates } from "@/lib/hooks"
import { CanteiroCard } from "@/components/canteiro-card"
import { CanteiroDetail } from "@/components/canteiro-detail"
import { OverviewStats } from "@/components/overview-stats"
import { TimeSeriesCharts } from "@/components/time-series-charts"
import { ReportSection } from "@/components/report-section"
import { PageHeader } from "@/components/page-header"
import { ErrorState, LoadingGrid, LoadingBlock } from "@/components/data-states"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

export default function PrincipalPage() {
  const { data: canteiros, error: canteirosError, isLoading: loadingCanteiros, mutate: mutateCanteiros } = useCanteiros()
  const { data: aggregates, error: aggError, isLoading: loadingAgg, mutate: mutateAgg } = useAggregates()
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const selected = canteiros?.find((c) => c.id === selectedId)

  function refreshAll() {
    mutateCanteiros()
    mutateAgg()
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Visão Geral"
        description={`Monitoramento em tempo real • ${format(new Date(), "dd 'de' MMMM, HH:mm", { locale: ptBR })}`}
      >
        <Button variant="outline" size="sm" onClick={refreshAll} className="gap-2">
          <RefreshCw className="h-3.5 w-3.5" />
          Atualizar
        </Button>
      </PageHeader>

      {/* KPIs */}
      {loadingAgg ? (
        <LoadingBlock className="h-44" />
      ) : aggError ? (
        <ErrorState message={(aggError as Error).message} onRetry={() => mutateAgg()} />
      ) : aggregates ? (
        <OverviewStats data={aggregates} />
      ) : null}

      {/* Gráficos temporais */}
      {loadingCanteiros ? (
        <LoadingBlock className="h-96" />
      ) : canteirosError ? (
        <ErrorState message={(canteirosError as Error).message} onRetry={() => mutateCanteiros()} />
      ) : canteiros && canteiros.length > 0 ? (
        <TimeSeriesCharts canteiros={canteiros} />
      ) : null}

      {/* Relatório agregado */}
      {!loadingAgg && aggregates && <ReportSection data={aggregates} />}

      {/* Status atual dos canteiros */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">Status dos canteiros</h2>
          {canteiros && <span className="text-sm text-muted-foreground">{canteiros.length} canteiros</span>}
        </div>

        {loadingCanteiros ? (
          <LoadingGrid />
        ) : canteirosError ? (
          <ErrorState message={(canteirosError as Error).message} onRetry={() => mutateCanteiros()} />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {canteiros?.map((c) => (
              <CanteiroCard
                key={c.id}
                canteiro={c}
                isSelected={selectedId === c.id}
                onClick={() => setSelectedId(selectedId === c.id ? null : c.id)}
              />
            ))}
          </div>
        )}

        {selected && (
          <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
            <CanteiroDetail canteiro={selected} />
          </div>
        )}
      </section>
    </div>
  )
}
