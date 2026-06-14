"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { canteiroSchema, emptyCanteiro, type CanteiroFormValues } from "@/lib/validation"
import type { Canteiro } from "@/lib/types"

interface CanteiroFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initial?: Canteiro | null
  onSubmit: (values: CanteiroFormValues) => Promise<void>
}

function toFormValues(c?: Canteiro | null): CanteiroFormValues {
  if (!c) return { ...emptyCanteiro }
  return {
    name: c.name,
    plant: c.plant,
    sensorId: c.sensorId,
    area: c.area,
    idealTempMin: c.idealTempMin,
    idealTempMax: c.idealTempMax,
    idealSoilMoistureMin: c.idealSoilMoistureMin,
    idealHumidityMin: c.idealHumidityMin,
    plantedDate: c.plantedDate,
    estimatedHarvest: c.estimatedHarvest === "Contínuo" ? "" : c.estimatedHarvest,
  }
}

export function CanteiroForm({ open, onOpenChange, initial, onSubmit }: CanteiroFormProps) {
  const [values, setValues] = useState<CanteiroFormValues>(toFormValues(initial))
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  // Re-sincroniza os valores quando o dialog abre com um canteiro diferente
  const [lastKey, setLastKey] = useState<string>("")
  const key = `${open}-${initial?.id ?? "new"}`
  if (key !== lastKey && open) {
    setValues(toFormValues(initial))
    setErrors({})
    setLastKey(key)
  }

  function setField<K extends keyof CanteiroFormValues>(field: K, value: CanteiroFormValues[K]) {
    setValues((v) => ({ ...v, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const result = canteiroSchema.safeParse(values)
    if (!result.success) {
      const fieldErrors: Record<string, string> = {}
      for (const issue of result.error.issues) {
        const path = issue.path[0] as string
        if (!fieldErrors[path]) fieldErrors[path] = issue.message
      }
      setErrors(fieldErrors)
      return
    }
    setErrors({})
    setSubmitting(true)
    try {
      await onSubmit(result.data)
      onOpenChange(false)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{initial ? "Editar canteiro" : "Novo canteiro"}</DialogTitle>
          <DialogDescription>
            {initial ? "Atualize as informações do canteiro." : "Preencha os dados para cadastrar um novo canteiro."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Nome" error={errors.name}>
              <Input value={values.name} onChange={(e) => setField("name", e.target.value)} placeholder="Canteiro A1" />
            </FormField>
            <FormField label="Cultura" error={errors.plant}>
              <Input value={values.plant} onChange={(e) => setField("plant", e.target.value)} placeholder="Tomates" />
            </FormField>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="ID do Sensor" error={errors.sensorId}>
              <Input value={values.sensorId} onChange={(e) => setField("sensorId", e.target.value.toUpperCase())} placeholder="SNS-A1-001" />
            </FormField>
            <FormField label="Área (m²)" error={errors.area}>
              <Input type="number" step="0.1" value={values.area} onChange={(e) => setField("area", e.target.valueAsNumber)} />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Temp. mín ideal (°C)" error={errors.idealTempMin}>
              <Input type="number" value={values.idealTempMin} onChange={(e) => setField("idealTempMin", e.target.valueAsNumber)} />
            </FormField>
            <FormField label="Temp. máx ideal (°C)" error={errors.idealTempMax}>
              <Input type="number" value={values.idealTempMax} onChange={(e) => setField("idealTempMax", e.target.valueAsNumber)} />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Umidade solo mín (%)" error={errors.idealSoilMoistureMin}>
              <Input type="number" value={values.idealSoilMoistureMin} onChange={(e) => setField("idealSoilMoistureMin", e.target.valueAsNumber)} />
            </FormField>
            <FormField label="Umidade ar mín (%)" error={errors.idealHumidityMin}>
              <Input type="number" value={values.idealHumidityMin} onChange={(e) => setField("idealHumidityMin", e.target.valueAsNumber)} />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Data de plantio" error={errors.plantedDate}>
              <Input type="date" value={values.plantedDate} onChange={(e) => setField("plantedDate", e.target.value)} />
            </FormField>
            <FormField label="Colheita estimada" error={errors.estimatedHarvest}>
              <Input type="date" value={values.estimatedHarvest} onChange={(e) => setField("estimatedHarvest", e.target.value)} />
            </FormField>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Salvando..." : initial ? "Salvar alterações" : "Cadastrar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function FormField({
  label,
  error,
  children,
}: {
  label: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm">{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
