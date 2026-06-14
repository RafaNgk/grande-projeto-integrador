"use client"

import { useState } from "react"
import { useSWRConfig } from "swr"
import { useCanteiros } from "@/lib/hooks"
import { apiKeys, createCanteiro, deleteCanteiro, updateCanteiro } from "@/lib/api"
import { PageHeader } from "@/components/page-header"
import { ErrorState, EmptyState, LoadingBlock } from "@/components/data-states"
import { CanteiroForm } from "@/components/canteiro-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { statusConfig } from "@/lib/status"
import type { Canteiro } from "@/lib/types"
import type { CanteiroFormValues } from "@/lib/validation"
import { Plus, Pencil, Trash2, Thermometer, Droplets, Leaf } from "lucide-react"
import { toast } from "sonner"

export default function CanteirosPage() {
  const { data: canteiros, error, isLoading, mutate } = useCanteiros()
  const { mutate: globalMutate } = useSWRConfig()

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Canteiro | null>(null)
  const [deleting, setDeleting] = useState<Canteiro | null>(null)
  const [deletingBusy, setDeletingBusy] = useState(false)

  function revalidateRelated() {
    mutate()
    globalMutate(apiKeys.aggregates)
    globalMutate(apiKeys.alerts)
  }

  function openCreate() {
    setEditing(null)
    setFormOpen(true)
  }

  function openEdit(c: Canteiro) {
    setEditing(c)
    setFormOpen(true)
  }

  async function handleSubmit(values: CanteiroFormValues) {
    try {
      const payload = { ...values, estimatedHarvest: values.estimatedHarvest || "Contínuo" }
      if (editing) {
        await updateCanteiro(editing.id, payload)
        toast.success("Canteiro atualizado")
      } else {
        await createCanteiro(payload)
        toast.success("Canteiro cadastrado")
      }
      revalidateRelated()
    } catch (e) {
      toast.error((e as Error).message || "Erro ao salvar")
      throw e
    }
  }

  async function handleDelete() {
    if (!deleting) return
    setDeletingBusy(true)
    try {
      await deleteCanteiro(deleting.id)
      toast.success("Canteiro removido")
      revalidateRelated()
      setDeleting(null)
    } catch (e) {
      toast.error((e as Error).message || "Erro ao remover")
    } finally {
      setDeletingBusy(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Cadastro de Canteiros" description="Gerencie os canteiros e suas faixas ideais de cultivo">
        <Button size="sm" onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Novo canteiro
        </Button>
      </PageHeader>

      {isLoading ? (
        <LoadingBlock className="h-96" />
      ) : error ? (
        <ErrorState message={(error as Error).message} onRetry={() => mutate()} />
      ) : !canteiros || canteiros.length === 0 ? (
        <EmptyState
          title="Nenhum canteiro cadastrado"
          message="Comece cadastrando seu primeiro canteiro."
          action={
            <Button size="sm" onClick={openCreate} className="gap-2">
              <Plus className="h-4 w-4" />
              Novo canteiro
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {canteiros.map((c) => {
            const cfg = statusConfig[c.status]
            return (
              <Card key={c.id} className="bg-card">
                <CardContent className="space-y-4 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{c.name}</p>
                      <p className="truncate text-sm text-muted-foreground">{c.plant}</p>
                    </div>
                    <span className={`flex shrink-0 items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium ${cfg.badge}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
                      {cfg.label}
                    </span>
                  </div>

                  <dl className="grid grid-cols-2 gap-2 text-sm">
                    <Detail label="Sensor" value={c.sensorId} />
                    <Detail label="Área" value={`${c.area} m²`} />
                  </dl>

                  <div className="grid grid-cols-3 gap-2 rounded-lg bg-muted/50 p-2 text-xs">
                    <Range icon={<Thermometer className="h-3 w-3 text-chart-4" />} value={`${c.idealTempMin}–${c.idealTempMax}°`} />
                    <Range icon={<Leaf className="h-3 w-3 text-primary" />} value={`≥${c.idealSoilMoistureMin}%`} />
                    <Range icon={<Droplets className="h-3 w-3 text-chart-2" />} value={`≥${c.idealHumidityMin}%`} />
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1 gap-1.5" onClick={() => openEdit(c)}>
                      <Pencil className="h-3.5 w-3.5" />
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5 text-destructive hover:text-destructive"
                      onClick={() => setDeleting(c)}
                      aria-label={`Remover ${c.name}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <CanteiroForm open={formOpen} onOpenChange={setFormOpen} initial={editing} onSubmit={handleSubmit} />

      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover canteiro?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleting && `Esta ação removerá "${deleting.name}" (${deleting.plant}) e não pode ser desfeita.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletingBusy}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                handleDelete()
              }}
              disabled={deletingBusy}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deletingBusy ? "Removendo..." : "Remover"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="truncate font-medium">{value}</dd>
    </div>
  )
}

function Range({ icon, value }: { icon: React.ReactNode; value: string }) {
  return (
    <div className="flex items-center gap-1">
      {icon}
      <span className="tabular-nums">{value}</span>
    </div>
  )
}
