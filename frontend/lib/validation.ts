import { z } from "zod"

// Schema de validação para cadastro/edição de canteiros
export const canteiroSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Nome deve ter ao menos 2 caracteres")
      .max(40, "Nome muito longo"),
    plant: z
      .string()
      .trim()
      .min(2, "Informe a cultura plantada")
      .max(40, "Nome muito longo"),
    sensorId: z
      .string()
      .trim()
      .regex(/^SNS-[A-Z0-9]{2,}-\d{3}$/, "Formato esperado: SNS-XX-000"),
    area: z
      .number({ invalid_type_error: "Informe um número" })
      .positive("Área deve ser maior que zero")
      .max(1000, "Área muito grande"),
    idealTempMin: z
      .number({ invalid_type_error: "Informe um número" })
      .min(-10, "Valor inválido")
      .max(50, "Valor inválido"),
    idealTempMax: z
      .number({ invalid_type_error: "Informe um número" })
      .min(-10, "Valor inválido")
      .max(60, "Valor inválido"),
    idealSoilMoistureMin: z
      .number({ invalid_type_error: "Informe um número" })
      .min(0, "Mínimo 0%")
      .max(100, "Máximo 100%"),
    idealHumidityMin: z
      .number({ invalid_type_error: "Informe um número" })
      .min(0, "Mínimo 0%")
      .max(100, "Máximo 100%"),
    plantedDate: z.string().min(1, "Informe a data de plantio"),
    estimatedHarvest: z.string().min(1, "Informe a colheita estimada"),
  })
  .refine((d) => d.idealTempMax > d.idealTempMin, {
    message: "A temperatura máxima deve ser maior que a mínima",
    path: ["idealTempMax"],
  })

export type CanteiroFormValues = z.infer<typeof canteiroSchema>

export const emptyCanteiro: CanteiroFormValues = {
  name: "",
  plant: "",
  sensorId: "",
  area: 10,
  idealTempMin: 18,
  idealTempMax: 28,
  idealSoilMoistureMin: 50,
  idealHumidityMin: 55,
  plantedDate: new Date().toISOString().split("T")[0],
  estimatedHarvest: "",
}
