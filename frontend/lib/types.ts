// Tipos compartilhados do sistema de monitoramento da horta

export type SensorStatus = "ok" | "offline" | "partial" | "suspect"

export type CanteiroStatus = "healthy" | "warning" | "critical" | "offline"

export type IrrigationMode = "auto" | "manual"

export interface SensorReading {
  timestamp: string
  // Valores podem ser null quando o sensor está offline ou enviou dado parcial
  temperature: number | null
  humidity: number | null
  soilMoisture: number | null
  lightLevel: number | null
  // Estado da leitura para cobrir casos de borda
  status: SensorStatus
  // true quando a irrigação foi acionada manualmente
  manualIrrigation?: boolean
}

export interface Canteiro {
  id: string
  name: string
  plant: string
  // Faixas ideais configuradas para gerar alertas
  idealTempMin: number
  idealTempMax: number
  idealSoilMoistureMin: number
  idealHumidityMin: number
  area: number // m²
  sensorId: string
  status: CanteiroStatus
  // Valores atuais (null = sensor offline / sem dado)
  currentTemp: number | null
  currentHumidity: number | null
  currentSoilMoisture: number | null
  currentLight: number | null
  lastWatered: string
  irrigationMode: IrrigationMode
  plantedDate: string
  estimatedHarvest: string
  readings: SensorReading[]
}

export type AlertType = "critical" | "warning" | "info"

export type AlertCategory =
  | "soil_moisture"
  | "temperature"
  | "humidity"
  | "sensor_offline"
  | "suspect_reading"
  | "irrigation"

export interface Alert {
  id: string
  type: AlertType
  category: AlertCategory
  title: string
  message: string
  timestamp: string
  canteiroId: string | null
  canteiroName: string | null
  acknowledged: boolean
}

export interface HortaAggregates {
  totalCanteiros: number
  canteirosHealthy: number
  canteirosWarning: number
  canteirosCritical: number
  canteirosOffline: number
  avgTemperature: number | null
  avgHumidity: number | null
  avgSoilMoisture: number | null
  totalWaterUsedToday: number
  waterSavings: number
  irrigationsByCanteiro: { canteiroId: string; canteiroName: string; count: number }[]
  weeklyWater: { date: string; liters: number }[]
}

export interface PaginatedReadings {
  items: (SensorReading & { canteiroId: string; canteiroName: string })[]
  page: number
  pageSize: number
  total: number
  hasMore: boolean
}

export interface CanteiroInput {
  name: string
  plant: string
  area: number
  sensorId: string
  idealTempMin: number
  idealTempMax: number
  idealSoilMoistureMin: number
  idealHumidityMin: number
  plantedDate: string
  estimatedHarvest: string
}
