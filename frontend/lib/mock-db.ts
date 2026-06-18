// Banco de dados mockado em memória com dados realistas e casos de borda.
// Esta é a "fonte de verdade" simulada — a camada api.ts é a única que acessa
// estes dados, de forma que trocar por uma API real só exige reescrever api.ts.

import type { Canteiro, SensorReading, SensorStatus } from "./types";

// Gera timestamps em intervalos de 1h terminando em "agora"
function generateTimestamps(count: number): string[] {
  const now = new Date();
  // arredonda para a hora cheia
  now.setMinutes(0, 0, 0);
  const timestamps: string[] = [];
  for (let i = count - 1; i >= 0; i--) {
    timestamps.push(new Date(now.getTime() - i * 60 * 60 * 1000).toISOString());
  }
  return timestamps;
}

interface ReadingOptions {
  baseTemp: number;
  baseHumidity: number;
  baseSoilMoisture: number;
  baseLight: number;
  // Probabilidade de cada caso de borda (0-1)
  offlineChance?: number;
  partialChance?: number;
  suspectChance?: number;
  // Horas em que houve irrigação manual
  manualIrrigationHours?: number[];
  // Tendência de queda da umidade do solo (simula secagem)
  soilDrain?: number;
}

function round(n: number, decimals = 1): number {
  const f = Math.pow(10, decimals);
  return Math.round(n * f) / f;
}

function generateReadings(
  count: number,
  opts: ReadingOptions,
): SensorReading[] {
  const timestamps = generateTimestamps(count);
  const {
    baseTemp,
    baseHumidity,
    baseSoilMoisture,
    baseLight,
    offlineChance = 0,
    partialChance = 0,
    suspectChance = 0,
    manualIrrigationHours = [],
    soilDrain = 0.4,
  } = opts;

  return timestamps.map((timestamp, index) => {
    const hour = new Date(timestamp).getHours();
    const tempVariation = Math.sin(((hour - 6) * Math.PI) / 12) * 5;
    const lightVariation =
      hour >= 6 && hour <= 18 ? Math.sin(((hour - 6) * Math.PI) / 12) * 600 : 0;

    let status: SensorStatus = "ok";
    let temperature: number | null = round(
      baseTemp + tempVariation + (Math.random() - 0.5) * 2,
    );
    let humidity: number | null = Math.round(
      Math.min(100, Math.max(25, baseHumidity + (Math.random() - 0.5) * 10)),
    );
    let soilMoisture: number | null = Math.round(
      Math.min(
        100,
        Math.max(
          15,
          baseSoilMoisture - index * soilDrain + (Math.random() - 0.5) * 5,
        ),
      ),
    );
    let lightLevel: number | null = Math.round(
      Math.max(0, baseLight + lightVariation + (Math.random() - 0.5) * 100),
    );

    const roll = Math.random();
    const manualIrrigation = manualIrrigationHours.includes(hour);

    // Caso de borda: sensor offline (sem nenhum dado)
    if (roll < offlineChance) {
      status = "offline";
      temperature = null;
      humidity = null;
      soilMoisture = null;
      lightLevel = null;
    } else if (roll < offlineChance + partialChance) {
      // Caso de borda: dado parcial (alguns campos faltando)
      status = "partial";
      humidity = null;
      lightLevel = null;
    } else if (roll < offlineChance + partialChance + suspectChance) {
      // Caso de borda: leitura suspeita (valor fisicamente improvável)
      status = "suspect";
      temperature = round(58 + Math.random() * 10); // pico absurdo de temperatura
    }

    return {
      timestamp,
      temperature,
      humidity,
      soilMoisture,
      lightLevel,
      status,
      manualIrrigation,
    };
  });
}

// Pega o último valor não-nulo de uma leitura
function lastValid(
  readings: SensorReading[],
  key: keyof SensorReading,
): number | null {
  for (let i = readings.length - 1; i >= 0; i--) {
    const v = readings[i][key];
    if (typeof v === "number") return v;
  }
  return null;
}

function buildCanteiro(
  partial: Omit<
    Canteiro,
    | "readings"
    | "currentTemp"
    | "currentHumidity"
    | "currentSoilMoisture"
    | "currentLight"
    | "status"
  > & {
    forcedStatus?: Canteiro["status"];
  },
  readingOpts: ReadingOptions,
  readingCount = 48,
): Canteiro {
  const readings = generateReadings(readingCount, readingOpts);
  const last = readings[readings.length - 1];

  const currentTemp = last.status === "offline" ? null : last.temperature;
  const currentHumidity = last.humidity ?? lastValid(readings, "humidity");
  const currentSoilMoisture =
    last.soilMoisture ?? lastValid(readings, "soilMoisture");
  const currentLight = last.lightLevel ?? lastValid(readings, "lightLevel");

  // Determina status automaticamente se não forçado
  let status: Canteiro["status"];
  if (partial.forcedStatus) {
    status = partial.forcedStatus;
  } else if (last.status === "offline") {
    status = "offline";
  } else if (
    (currentSoilMoisture !== null &&
      currentSoilMoisture < partial.idealSoilMoistureMin) ||
    (currentTemp !== null && currentTemp > partial.idealTempMax)
  ) {
    status = "critical";
  } else if (currentTemp !== null && currentTemp > partial.idealTempMax - 2) {
    status = "warning";
  } else {
    status = "healthy";
  }

  const { forcedStatus, ...rest } = partial;
  return {
    ...rest,
    status,
    currentTemp,
    currentHumidity,
    currentSoilMoisture,
    currentLight,
    readings,
  };
}

// Armazenamento em memória (mutável para suportar CRUD)
let canteiros: Canteiro[] = [
  buildCanteiro(
    {
      id: "canteiro-1",
      name: "Canteiro A1",
      plant: "Tomates",
      idealTempMin: 18,
      idealTempMax: 28,
      idealSoilMoistureMin: 50,
      idealHumidityMin: 55,
      area: 12,
      sensorId: "SNS-A1-001",
      lastWatered: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
      irrigationMode: "auto",
      plantedDate: "2026-03-15",
      estimatedHarvest: "2026-06-20",
    },
    {
      baseTemp: 24,
      baseHumidity: 65,
      baseSoilMoisture: 75,
      baseLight: 400,
      manualIrrigationHours: [6],
    },
  ),
  buildCanteiro(
    {
      id: "canteiro-2",
      name: "Canteiro A2",
      plant: "Alface",
      idealTempMin: 15,
      idealTempMax: 24,
      idealSoilMoistureMin: 55,
      idealHumidityMin: 60,
      area: 8,
      sensorId: "SNS-A2-002",
      lastWatered: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
      irrigationMode: "auto",
      plantedDate: "2026-04-20",
      estimatedHarvest: "2026-05-25",
    },
    {
      baseTemp: 22,
      baseHumidity: 72,
      baseSoilMoisture: 70,
      baseLight: 350,
      partialChance: 0.08,
    },
  ),
  buildCanteiro(
    {
      id: "canteiro-3",
      name: "Canteiro B1",
      plant: "Cenouras",
      idealTempMin: 16,
      idealTempMax: 24,
      idealSoilMoistureMin: 50,
      idealHumidityMin: 55,
      area: 10,
      sensorId: "SNS-B1-003",
      lastWatered: new Date(Date.now() - 14 * 3600 * 1000).toISOString(),
      irrigationMode: "auto",
      plantedDate: "2026-02-10",
      estimatedHarvest: "2026-05-30",
      forcedStatus: "warning",
    },
    {
      baseTemp: 25,
      baseHumidity: 55,
      baseSoilMoisture: 52,
      baseLight: 450,
      suspectChance: 0.06,
    },
  ),
  buildCanteiro(
    {
      id: "canteiro-4",
      name: "Canteiro B2",
      plant: "Pimentões",
      idealTempMin: 18,
      idealTempMax: 30,
      idealSoilMoistureMin: 45,
      idealHumidityMin: 50,
      area: 14,
      sensorId: "SNS-B2-004",
      lastWatered: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
      irrigationMode: "manual",
      plantedDate: "2026-03-01",
      estimatedHarvest: "2026-06-15",
    },
    {
      baseTemp: 25,
      baseHumidity: 60,
      baseSoilMoisture: 68,
      baseLight: 420,
      manualIrrigationHours: [5, 16],
    },
  ),
  buildCanteiro(
    {
      id: "canteiro-5",
      name: "Canteiro C1",
      plant: "Morangos",
      idealTempMin: 15,
      idealTempMax: 26,
      idealSoilMoistureMin: 50,
      idealHumidityMin: 60,
      area: 9,
      sensorId: "SNS-C1-005",
      lastWatered: new Date(Date.now() - 30 * 3600 * 1000).toISOString(),
      irrigationMode: "auto",
      plantedDate: "2026-01-20",
      estimatedHarvest: "2026-05-22",
      forcedStatus: "critical",
    },
    // Solo bem seco -> dispara alerta de umidade < 30%
    {
      baseTemp: 28,
      baseHumidity: 45,
      baseSoilMoisture: 28,
      baseLight: 500,
      soilDrain: 0.2,
    },
  ),
  buildCanteiro(
    {
      id: "canteiro-6",
      name: "Canteiro C2",
      plant: "Manjericão",
      idealTempMin: 18,
      idealTempMax: 28,
      idealSoilMoistureMin: 55,
      idealHumidityMin: 60,
      area: 6,
      sensorId: "SNS-C2-006",
      lastWatered: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
      irrigationMode: "auto",
      plantedDate: "2026-04-05",
      estimatedHarvest: "Contínuo",
    },
    { baseTemp: 23, baseHumidity: 68, baseSoilMoisture: 80, baseLight: 320 },
  ),
  buildCanteiro(
    {
      id: "canteiro-7",
      name: "Canteiro D1",
      plant: "Couve",
      idealTempMin: 15,
      idealTempMax: 25,
      idealSoilMoistureMin: 50,
      idealHumidityMin: 55,
      area: 11,
      sensorId: "SNS-D1-007",
      lastWatered: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
      irrigationMode: "auto",
      plantedDate: "2026-03-28",
      estimatedHarvest: "2026-06-10",
      forcedStatus: "offline",
    },
    // Sensor com alta taxa de falha -> offline
    {
      baseTemp: 23,
      baseHumidity: 62,
      baseSoilMoisture: 60,
      baseLight: 380,
      offlineChance: 0.85,
    },
  ),
  buildCanteiro(
    {
      id: "canteiro-8",
      name: "Canteiro R1",
      plant: "Soja Boa",
      idealTempMin: 15,
      idealTempMax: 25,
      idealSoilMoistureMin: 50,
      idealHumidityMin: 55,
      area: 11,
      sensorId: "SNS-R1-007",
      lastWatered: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
      irrigationMode: "auto",
      plantedDate: "2026-03-28",
      estimatedHarvest: "2026-06-10",
      forcedStatus: "healthy",
    },
    {
      baseTemp: 23,
      baseHumidity: 62,
      baseSoilMoisture: 60,
      baseLight: 380,
    },
  ),
];

let partialTestCanteiro = canteiros.find((c) => c.id === "canteiro-8");

if (partialTestCanteiro) {
  partialTestCanteiro.status = "healthy";

  partialTestCanteiro.currentTemp = 30;
  partialTestCanteiro.currentHumidity = null;
  partialTestCanteiro.currentSoilMoisture = 90;

  const lastReadingIndex = partialTestCanteiro.readings.length - 1;
  const lastReading = partialTestCanteiro.readings[lastReadingIndex];

  if (lastReading) {
    partialTestCanteiro.readings[lastReadingIndex] = {
      ...lastReading,
      temperature: 30,
      humidity: null,
      soilMoisture: 90,
      status: "partial",
    };
  }
}

partialTestCanteiro = canteiros.find((c) => c.id === "canteiro-3");

if (partialTestCanteiro) {
  partialTestCanteiro.status = "healthy";

  partialTestCanteiro.currentTemp = 30;
  partialTestCanteiro.currentHumidity = 54;
  partialTestCanteiro.currentSoilMoisture = null;

  const lastReadingIndex = partialTestCanteiro.readings.length - 1;
  const lastReading = partialTestCanteiro.readings[lastReadingIndex];

  if (lastReading) {
    partialTestCanteiro.readings[lastReadingIndex] = {
      ...lastReading,
      temperature: 30,
      humidity: 54,
      soilMoisture: null,
      status: "partial",
    };
  }
}

// Histórico semanal de irrigação (litros por dia)
const weeklyWater = (() => {
  const days: { date: string; liters: number }[] = [];
  const base = [52.3, 48.7, 55.2, 41.8, 49.5, 44.2, 47.5];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push({
      date: d.toISOString().split("T")[0],
      liters: base[6 - i],
    });
  }
  return days;
})();

// Contagem de irrigações por canteiro (relatório agregado)
function irrigationsByCanteiro() {
  return canteiros.map((c) => ({
    canteiroId: c.id,
    canteiroName: c.name,
    count:
      c.readings.filter((r) => r.manualIrrigation).length +
      (c.irrigationMode === "auto" ? 14 : 6),
  }));
}

export const db = {
  getCanteiros: () => canteiros,
  getCanteiro: (id: string) => canteiros.find((c) => c.id === id),
  setCanteiros: (next: Canteiro[]) => {
    canteiros = next;
  },
  weeklyWater,
  irrigationsByCanteiro,
};
