import axios from "axios";
import apiClient from "./client";
import type { Occasion, OccasionInput } from "../types";

export async function getOccasions(): Promise<Occasion[]> {
  const { data } = await apiClient.get<Occasion[]>("/occasions");
  return data;
}
export async function adminListOccasions(token: string): Promise<Occasion[]> {
  const { data } = await apiClient.get<Occasion[]>("/admin/occasions", { headers: { Authorization: `Bearer ${token}` } });
  return data;
}
export async function adminGetOccasion(id: string, token: string): Promise<Occasion> {
  const { data } = await apiClient.get<Occasion>(`/admin/occasions/${id}`, { headers: { Authorization: `Bearer ${token}` } });
  return data;
}
export async function saveOccasion(id: string | number | null, input: OccasionInput, token: string): Promise<Occasion> {
  const config = { headers: { Authorization: `Bearer ${token}` } };
  const { data } = id === null
    ? await apiClient.post<Occasion>("/admin/occasions", input, config)
    : await apiClient.put<Occasion>(`/admin/occasions/${id}`, input, config);
  return data;
}
export async function deleteOccasion(id: string, token: string): Promise<void> {
  await apiClient.delete(`/admin/occasions/${id}`, { headers: { Authorization: `Bearer ${token}` } });
}
export function occasionError(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const detail = error.response?.data?.detail;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail)) return detail.map((item: { msg: string }) => item.msg).join(". ");
  }
  return fallback;
}
