"use client"

// Hooks de dados baseados em SWR. Os componentes usam estes hooks e nunca
// chamam a camada api.ts diretamente, mantendo a UI desacoplada.

import useSWR from "swr"
import {
  apiKeys,
  getAggregates,
  getAlerts,
  getCanteiro,
  getCanteiros,
  getReadings,
} from "./api"

export function useCanteiros() {
  return useSWR(apiKeys.canteiros, getCanteiros, {
    revalidateOnFocus: false,
  })
}

export function useCanteiro(id: string | null) {
  return useSWR(id ? apiKeys.canteiro(id) : null, () => getCanteiro(id as string), {
    revalidateOnFocus: false,
  })
}

export function useAlerts() {
  return useSWR(apiKeys.alerts, getAlerts, {
    revalidateOnFocus: false,
  })
}

export function useAggregates() {
  return useSWR(apiKeys.aggregates, getAggregates, {
    revalidateOnFocus: false,
  })
}

export function useReadings(params: { page: number; pageSize: number; canteiroId?: string }) {
  return useSWR(
    [apiKeys.readings, params.page, params.pageSize, params.canteiroId ?? "all"],
    () => getReadings(params),
    { revalidateOnFocus: false, keepPreviousData: true },
  )
}
