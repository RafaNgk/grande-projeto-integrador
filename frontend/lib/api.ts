// Camada de acesso a dados ISOLADA e PLUGÁVEL.
//
// Toda a aplicação consome dados exclusivamente por estas funções.
// Hoje elas leem do mock-db em memória simulando latência de rede.
// Para integrar com uma API real, basta reescrever o corpo destas funções
// (ex.: trocar por `fetch(`${API_BASE}/canteiros`)`), mantendo as assinaturas.
//
// As chaves SWR ficam centralizadas em `apiKeys` para facilitar invalidação.

import { db } from "./mock-db";
import { generateAlerts } from "./alerts";
import type {
  Alert,
  Canteiro,
  CanteiroInput,
  HortaAggregates,
  PaginatedReadings,
} from "./types";

// Latência simulada da rede
const LATENCY = 350;

function delay<T>(value: T, ms = LATENCY): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

// Permite simular falhas de rede para testar estados de erro na UI.
// Defina NEXT_PUBLIC_SIMULATE_API_ERRORS=true para ativar falhas aleatórias.
const SIMULATE_ERRORS = process.env.NEXT_PUBLIC_SIMULATE_API_ERRORS === "true";

function maybeFail() {
  if (SIMULATE_ERRORS && Math.random() < 0.25) {
    throw new Error("Falha de comunicação com o servidor. Tente novamente.");
  }
}

export const apiKeys = {
  canteiros: "/api/canteiros",
  canteiro: (id: string) => `/api/canteiros/${id}`,
  alerts: "/api/alerts",
  aggregates: "/api/aggregates",
  readings: "/api/readings",
};

// ---- Canteiros ----

export async function getCanteiros(): Promise<Canteiro[]> {
  maybeFail();
  return delay([...db.getCanteiros()]);
}

export async function getCanteiro(id: string): Promise<Canteiro> {
  maybeFail();
  const found = db.getCanteiro(id);
  if (!found) {
    await delay(null, 200);
    throw new Error("Canteiro não encontrado");
  }
  return delay({ ...found });
}

export async function createCanteiro(input: CanteiroInput): Promise<Canteiro> {
  maybeFail();
  const list = db.getCanteiros();
  const newCanteiro: Canteiro = {
    id: `canteiro-${Date.now()}`,
    ...input,
    status: "healthy",
    currentTemp: input.idealTempMin + 2,
    currentHumidity: input.idealHumidityMin + 5,
    currentSoilMoisture: input.idealSoilMoistureMin + 10,
    currentLight: 400,
    lastWatered: new Date().toISOString(),
    irrigationMode: "auto",
    readings: [],
  };
  db.setCanteiros([...list, newCanteiro]);
  return delay(newCanteiro);
}

export async function updateCanteiro(
  id: string,
  input: CanteiroInput,
): Promise<Canteiro> {
  maybeFail();
  const list = db.getCanteiros();
  const idx = list.findIndex((c) => c.id === id);
  if (idx === -1) throw new Error("Canteiro não encontrado");
  const updated: Canteiro = { ...list[idx], ...input };
  const next = [...list];
  next[idx] = updated;
  db.setCanteiros(next);
  return delay(updated);
}

export async function deleteCanteiro(id: string): Promise<{ id: string }> {
  maybeFail();
  const list = db.getCanteiros();
  db.setCanteiros(list.filter((c) => c.id !== id));
  return delay({ id });
}

// ---- Alertas ----

export async function getAlerts(): Promise<Alert[]> {
  maybeFail();
  return delay(generateAlerts(db.getCanteiros()));
}

// ---- Agregados / Relatório ----
type AggregateReadyCanteiro = Canteiro & {
  currentTemp: number;
  currentHumidity: number;
  currentSoilMoisture: number;
};

function avg(vals: number[]): number | null {
  if (vals.length === 0) return null;

  return Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10;
}

function createRequestId(): string {
  return `req-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function getLatestSensorStatus(canteiro: Canteiro) {
  return canteiro.readings[canteiro.readings.length - 1]?.status ?? null;
}

function getMissingFields(canteiro: Canteiro): string[] {
  const missingFields: string[] = [];

  if (canteiro.currentTemp === null) missingFields.push("currentTemp");
  if (canteiro.currentHumidity === null) missingFields.push("currentHumidity");
  if (canteiro.currentSoilMoisture === null)
    missingFields.push("currentSoilMoisture");

  return missingFields;
}

function isAggregateReady(
  canteiro: Canteiro,
): canteiro is AggregateReadyCanteiro {
  const latestStatus = getLatestSensorStatus(canteiro);

  return (
    canteiro.status !== "offline" &&
    latestStatus !== "offline" &&
    latestStatus !== "partial" &&
    canteiro.currentTemp !== null &&
    canteiro.currentHumidity !== null &&
    canteiro.currentSoilMoisture !== null
  );
}

function logSensorDataIssue(canteiro: Canteiro, requestId: string): void {
  const latestStatus = getLatestSensorStatus(canteiro);
  const missingFields = getMissingFields(canteiro);

  const isOffline = canteiro.status === "offline" || latestStatus === "offline";
  const isPartial = latestStatus === "partial" || missingFields.length > 0;

  if (!isOffline && !isPartial) return;

  console.error(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      event: "fetch_sensor_data_failed",
      requestId,
      source: "getAggregates",
      canteiroId: canteiro.id,
      canteiroName: canteiro.name,
      sensorId: canteiro.sensorId,
      canteiroStatus: canteiro.status,
      latestSensorStatus: latestStatus,
      reason: isOffline ? "offline_sensor_data" : "partial_sensor_data",
      missingFields,
      includedInAggregate: false,
    }),
  );
}

export async function getAggregates(): Promise<HortaAggregates> {
  maybeFail();

  const requestId = createRequestId();
  const canteiros = db.getCanteiros();

  canteiros.forEach((canteiro) => {
    logSensorDataIssue(canteiro, requestId);
  });

  const aggregateReady = canteiros.filter(isAggregateReady);

  console.table(
    aggregateReady.map((c) => ({
      id: c.id,
      name: c.name,
      status: c.status,
      latestStatus: c.readings[c.readings.length - 1]?.status,
      temp: c.currentTemp,
      humidity: c.currentHumidity,
      soil: c.currentSoilMoisture,
    })),
  );

  console.log("Médias corretas:", {
    avgTemperature: avg(aggregateReady.map((c) => c.currentTemp)),
    avgHumidity: avg(aggregateReady.map((c) => c.currentHumidity)),
    avgSoilMoisture: avg(aggregateReady.map((c) => c.currentSoilMoisture)),
  });

  return delay({
    totalCanteiros: canteiros.length,
    canteirosHealthy: canteiros.filter((c) => c.status === "healthy").length,
    canteirosWarning: canteiros.filter((c) => c.status === "warning").length,
    canteirosCritical: canteiros.filter((c) => c.status === "critical").length,
    canteirosOffline: canteiros.filter((c) => c.status === "offline").length,

    avgTemperature: avg(aggregateReady.map((c) => c.currentTemp)),
    avgHumidity: avg(aggregateReady.map((c) => c.currentHumidity)),
    avgSoilMoisture: avg(aggregateReady.map((c) => c.currentSoilMoisture)),

    totalWaterUsedToday: db.weeklyWater[db.weeklyWater.length - 1]?.liters ?? 0,
    waterSavings: 23,
    irrigationsByCanteiro: db.irrigationsByCanteiro(),
    weeklyWater: db.weeklyWater,
  });
}

// ---- Histórico de leituras (paginado) ----

export async function getReadings(params: {
  page: number;
  pageSize: number;
  canteiroId?: string;
}): Promise<PaginatedReadings> {
  maybeFail();
  const { page, pageSize, canteiroId } = params;
  const canteiros = db.getCanteiros();

  // Achata todas as leituras de todos os canteiros num único histórico
  const all = canteiros
    .filter((c) => !canteiroId || c.id === canteiroId)
    .flatMap((c) =>
      c.readings.map((r) => ({
        ...r,
        canteiroId: c.id,
        canteiroName: c.name,
      })),
    )
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );

  const start = (page - 1) * pageSize;
  const items = all.slice(start, start + pageSize);

  return delay({
    items,
    page,
    pageSize,
    total: all.length,
    hasMore: start + pageSize < all.length,
  });
}
