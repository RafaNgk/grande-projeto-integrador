"use client"

import { useState } from "react"
import { useReadings, useCanteiros } from "@/lib/hooks"
import { PageHeader } from "@/components/page-header"
import { ErrorState, EmptyState, LoadingBlock } from "@/components/data-states"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { fmt } from "@/lib/status"
import { getReadings } from "@/lib/api"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Download, ChevronLeft, ChevronRight } from "lucide-react"
import { toast } from "sonner"

const PAGE_SIZE = 12

const readingStatusConfig = {
  ok: { label: "OK", className: "bg-primary/15 text-primary" },
  offline: { label: "Offline", className: "bg-muted text-muted-foreground" },
  partial: { label: "Parcial", className: "bg-chart-3/15 text-chart-3" },
  suspect: { label: "Suspeita", className: "bg-destructive/15 text-destructive" },
}

export default function HistoricoPage() {
  const [page, setPage] = useState(1)
  const [canteiroId, setCanteiroId] = useState("all")
  const [exporting, setExporting] = useState(false)

  const { data: canteiros } = useCanteiros()
  const { data, error, isLoading, mutate } = useReadings({
    page,
    pageSize: PAGE_SIZE,
    canteiroId: canteiroId === "all" ? undefined : canteiroId,
  })

  const totalPages = data ? Math.max(1, Math.ceil(data.total / PAGE_SIZE)) : 1

  function handleCanteiroChange(value: string) {
    setCanteiroId(value)
    setPage(1)
  }

  async function handleExport() {
    setExporting(true)
    try {
      // Busca todas as leituras (sem paginação) para exportar
      const all = await getReadings({
        page: 1,
        pageSize: 10000,
        canteiroId: canteiroId === "all" ? undefined : canteiroId,
      })
      const header = ["Canteiro", "Data/Hora", "Temperatura(C)", "Umidade(%)", "Solo(%)", "Luz(lux)", "Status"]
      const rows = all.items.map((r) => [
        r.canteiroName,
        format(new Date(r.timestamp), "dd/MM/yyyy HH:mm"),
        r.temperature ?? "",
        r.humidity ?? "",
        r.soilMoisture ?? "",
        r.lightLevel ?? "",
        r.status,
      ])
      const csv = [header, ...rows].map((row) => row.join(",")).join("\n")
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `historico-horta-${format(new Date(), "yyyy-MM-dd")}.csv`
      link.click()
      URL.revokeObjectURL(url)
      toast.success(`${all.items.length} leituras exportadas`)
    } catch {
      toast.error("Falha ao exportar os dados")
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Histórico de Leituras" description="Registros dos sensores ordenados do mais recente ao mais antigo">
        <Button variant="outline" size="sm" onClick={handleExport} disabled={exporting || !data} className="gap-2">
          <Download className="h-3.5 w-3.5" />
          {exporting ? "Exportando..." : "Exportar CSV"}
        </Button>
      </PageHeader>

      <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">Canteiro:</span>
          <Select value={canteiroId} onValueChange={handleCanteiroChange}>
            <SelectTrigger className="w-48" aria-label="Filtrar por canteiro">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os canteiros</SelectItem>
              {canteiros?.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name} — {c.plant}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {data && (
          <p className="text-sm text-muted-foreground">
            {data.total} {data.total === 1 ? "registro" : "registros"} no total
          </p>
        )}
      </div>

      {isLoading && !data ? (
        <LoadingBlock className="h-96" />
      ) : error ? (
        <ErrorState message={(error as Error).message} onRetry={() => mutate()} />
      ) : !data || data.items.length === 0 ? (
        <EmptyState title="Sem registros" message="Não há leituras para o filtro selecionado." />
      ) : (
        <>
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Canteiro</TableHead>
                    <TableHead>Data/Hora</TableHead>
                    <TableHead className="text-right">Temp.</TableHead>
                    <TableHead className="text-right">Umidade</TableHead>
                    <TableHead className="text-right">Solo</TableHead>
                    <TableHead className="text-right">Luz</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.items.map((r, i) => {
                    const sc = readingStatusConfig[r.status]
                    return (
                      <TableRow key={`${r.canteiroId}-${r.timestamp}-${i}`}>
                        <TableCell className="font-medium">{r.canteiroName}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {format(new Date(r.timestamp), "dd/MM HH:mm", { locale: ptBR })}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">{fmt(r.temperature, "°C")}</TableCell>
                        <TableCell className="text-right tabular-nums">{fmt(r.humidity, "%")}</TableCell>
                        <TableCell className="text-right tabular-nums">{fmt(r.soilMoisture, "%")}</TableCell>
                        <TableCell className="text-right tabular-nums">{fmt(r.lightLevel)}</TableCell>
                        <TableCell>
                          <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${sc.className}`}>
                            {sc.label}
                          </span>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Paginação */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Página {data.page} de {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="gap-1"
              >
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => p + 1)}
                disabled={!data.hasMore}
                className="gap-1"
              >
                Próxima
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
