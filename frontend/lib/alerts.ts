// Geração de alertas a partir do estado dos canteiros.
// Regras determinísticas para que pelo menos um alerta sempre dispare
// (ex.: umidade do solo abaixo de 30%).

import type { Alert, Canteiro } from "./types"

export function generateAlerts(canteiros: Canteiro[]): Alert[] {
  const alerts: Alert[] = []
  const now = Date.now()

  canteiros.forEach((c, idx) => {
    const base = now - idx * 17 * 60 * 1000 // espalha os timestamps

    // Sensor offline
    if (c.status === "offline" || c.currentTemp === null) {
      alerts.push({
        id: `alert-offline-${c.id}`,
        type: "warning",
        category: "sensor_offline",
        title: "Sensor sem comunicação",
        message: `O sensor ${c.sensorId} do ${c.name} (${c.plant}) está offline. Última leitura indisponível.`,
        timestamp: new Date(base - 5 * 60 * 1000).toISOString(),
        canteiroId: c.id,
        canteiroName: c.name,
        acknowledged: false,
      })
      return
    }

    // Umidade do solo crítica (regra principal: < 30%)
    if (c.currentSoilMoisture !== null && c.currentSoilMoisture < 30) {
      alerts.push({
        id: `alert-soil-crit-${c.id}`,
        type: "critical",
        category: "soil_moisture",
        title: "Umidade do solo crítica",
        message: `Umidade do solo em ${c.currentSoilMoisture}% no ${c.name} (${c.plant}), abaixo do limite de 30%. Irrigação recomendada imediatamente.`,
        timestamp: new Date(base).toISOString(),
        canteiroId: c.id,
        canteiroName: c.name,
        acknowledged: false,
      })
    } else if (
      c.currentSoilMoisture !== null &&
      c.currentSoilMoisture < c.idealSoilMoistureMin
    ) {
      alerts.push({
        id: `alert-soil-warn-${c.id}`,
        type: "warning",
        category: "soil_moisture",
        title: "Umidade do solo baixa",
        message: `Umidade do solo em ${c.currentSoilMoisture}% no ${c.name}, abaixo do ideal (${c.idealSoilMoistureMin}%).`,
        timestamp: new Date(base - 3 * 60 * 1000).toISOString(),
        canteiroId: c.id,
        canteiroName: c.name,
        acknowledged: false,
      })
    }

    // Temperatura elevada
    if (c.currentTemp !== null && c.currentTemp > c.idealTempMax) {
      alerts.push({
        id: `alert-temp-${c.id}`,
        type: c.currentTemp > c.idealTempMax + 3 ? "critical" : "warning",
        category: "temperature",
        title: "Temperatura acima do ideal",
        message: `Temperatura em ${c.currentTemp}°C no ${c.name} (${c.plant}), acima do limite de ${c.idealTempMax}°C.`,
        timestamp: new Date(base - 8 * 60 * 1000).toISOString(),
        canteiroId: c.id,
        canteiroName: c.name,
        acknowledged: false,
      })
    }

    // Leitura suspeita detectada no histórico recente
    const suspect = c.readings.slice(-6).find((r) => r.status === "suspect")
    if (suspect) {
      alerts.push({
        id: `alert-suspect-${c.id}`,
        type: "warning",
        category: "suspect_reading",
        title: "Leitura suspeita",
        message: `Valor improvável detectado no ${c.name}: ${suspect.temperature}°C. Verifique o sensor ${c.sensorId}.`,
        timestamp: new Date(base - 12 * 60 * 1000).toISOString(),
        canteiroId: c.id,
        canteiroName: c.name,
        acknowledged: false,
      })
    }

    // Irrigação manual acionada
    const manual = c.readings.slice(-12).find((r) => r.manualIrrigation)
    if (manual) {
      alerts.push({
        id: `alert-irrig-${c.id}`,
        type: "info",
        category: "irrigation",
        title: "Irrigação manual acionada",
        message: `Irrigação manual registrada no ${c.name} (${c.plant}).`,
        timestamp: new Date(base - 20 * 60 * 1000).toISOString(),
        canteiroId: c.id,
        canteiroName: c.name,
        acknowledged: idx % 2 === 0,
      })
    }
  })

  // Alerta geral informativo
  alerts.push({
    id: "alert-weather",
    type: "info",
    category: "irrigation",
    title: "Previsão climática",
    message: "Previsão de chuva para amanhã. A irrigação automática será reduzida em 40%.",
    timestamp: new Date(now - 90 * 60 * 1000).toISOString(),
    canteiroId: null,
    canteiroName: null,
    acknowledged: false,
  })

  return alerts.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  )
}
