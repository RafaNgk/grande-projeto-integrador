import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { getAggregates } from "./api";
import { db } from "./mock-db";
import type { Canteiro, SensorStatus } from "./types";

const originalCanteiros = db.getCanteiros();

function buildCanteiro(
  overrides: Partial<Canteiro> & Pick<Canteiro, "id" | "name">,
): Canteiro {
  const latestStatus: SensorStatus =
    overrides.readings?.[overrides.readings.length - 1]?.status ?? "ok";

  return {
    id: overrides.id,
    name: overrides.name,
    plant: "Alface",
    idealTempMin: 18,
    idealTempMax: 28,
    idealSoilMoistureMin: 50,
    idealHumidityMin: 55,
    area: 10,
    sensorId: `sensor-${overrides.id}`,
    status: "healthy",
    currentTemp: 20,
    currentHumidity: 60,
    currentSoilMoisture: 70,
    currentLight: 400,
    lastWatered: "2026-06-18T10:00:00.000Z",
    irrigationMode: "auto",
    plantedDate: "2026-01-01",
    estimatedHarvest: "2026-07-01",
    readings: [
      {
        timestamp: "2026-06-18T10:00:00.000Z",
        temperature: 20,
        humidity: 60,
        soilMoisture: 70,
        lightLevel: 400,
        status: latestStatus,
      },
    ],
    ...overrides,
  };
}

describe("getAggregates", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(console, "table").mockImplementation(() => {});
    vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    db.setCanteiros(originalCanteiros);
    vi.restoreAllMocks();
  });

  it("exclui canteiro parcial das tres medias e emite log estruturado", async () => {
    db.setCanteiros([
      buildCanteiro({
        id: "saudavel-1",
        name: "Saudavel 1",
        currentTemp: 20,
        currentHumidity: 60,
        currentSoilMoisture: 80,
      }),
      buildCanteiro({
        id: "saudavel-2",
        name: "Saudavel 2",
        currentTemp: 24,
        currentHumidity: 80,
        currentSoilMoisture: 40,
      }),
      buildCanteiro({
        id: "parcial-temp-ok",
        name: "Parcial temp ok",
        currentTemp: 100,
        currentHumidity: null,
        currentSoilMoisture: 100,
        readings: [
          {
            timestamp: "2026-06-18T10:00:00.000Z",
            temperature: 100,
            humidity: null,
            soilMoisture: 100,
            lightLevel: 400,
            status: "partial",
          },
        ],
      }),
    ]);

    const result = await getAggregates();

    expect(result.totalCanteiros).toBe(3);
    expect(result.canteirosHealthy).toBe(3);
    expect(result.avgTemperature).toBe(22);
    expect(result.avgHumidity).toBe(70);
    expect(result.avgSoilMoisture).toBe(60);

    expect(console.error).toHaveBeenCalledTimes(1);

    const [structuredLog] = vi.mocked(console.error).mock.calls[0];
    expect(JSON.parse(String(structuredLog))).toMatchObject({
      event: "fetch_sensor_data_failed",
      source: "getAggregates",
      canteiroId: "parcial-temp-ok",
      canteiroName: "Parcial temp ok",
      sensorId: "sensor-parcial-temp-ok",
      canteiroStatus: "healthy",
      latestSensorStatus: "partial",
      reason: "partial_sensor_data",
      missingFields: ["currentHumidity"],
      includedInAggregate: false,
    });
  });

  it("mantem medias sem regressao quando todos os canteiros estao saudaveis", async () => {
    db.setCanteiros([
      buildCanteiro({
        id: "saudavel-1",
        name: "Saudavel 1",
        currentTemp: 18,
        currentHumidity: 50,
        currentSoilMoisture: 65,
      }),
      buildCanteiro({
        id: "saudavel-2",
        name: "Saudavel 2",
        currentTemp: 24,
        currentHumidity: 70,
        currentSoilMoisture: 75,
      }),
      buildCanteiro({
        id: "saudavel-3",
        name: "Saudavel 3",
        currentTemp: 30,
        currentHumidity: 80,
        currentSoilMoisture: 85,
      }),
    ]);

    const result = await getAggregates();

    expect(result.totalCanteiros).toBe(3);
    expect(result.canteirosHealthy).toBe(3);
    expect(result.canteirosWarning).toBe(0);
    expect(result.canteirosCritical).toBe(0);
    expect(result.canteirosOffline).toBe(0);
    expect(result.avgTemperature).toBe(24);
    expect(result.avgHumidity).toBe(66.7);
    expect(result.avgSoilMoisture).toBe(75);
    expect(console.error).not.toHaveBeenCalled();
  });
});
