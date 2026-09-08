import apiClient from "./client";
import type { SiteSettings, SiteSettingsInput } from "../types";

export async function getSettings(): Promise<SiteSettings> {
  const { data } = await apiClient.get<SiteSettings>("/settings");
  return data;
}

export async function updateSettings(
  input: SiteSettingsInput,
  token: string
): Promise<SiteSettings> {
  const { data } = await apiClient.put<SiteSettings>(
    "/admin/settings",
    input,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return data;
}
