import apiClient from "./client";
import type { HeroSlide, HeroSlideInput } from "../types";

export async function getHeroSlides(): Promise<HeroSlide[]> {
  const { data } = await apiClient.get<HeroSlide[]>("/hero-slides");
  return data;
}

export async function adminListHeroSlides(token: string): Promise<HeroSlide[]> {
  const { data } = await apiClient.get<HeroSlide[]>("/admin/hero-slides", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
}

export async function adminGetHeroSlide(
  id: number | string,
  token: string
): Promise<HeroSlide> {
  const { data } = await apiClient.get<HeroSlide>(`/admin/hero-slides/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
}

export async function createHeroSlide(
  input: HeroSlideInput,
  token: string
): Promise<HeroSlide> {
  const { data } = await apiClient.post<HeroSlide>("/admin/hero-slides", input, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
}

export async function updateHeroSlide(
  id: number,
  input: Partial<HeroSlideInput>,
  token: string
): Promise<HeroSlide> {
  const { data } = await apiClient.put<HeroSlide>(
    `/admin/hero-slides/${id}`,
    input,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return data;
}

export async function deleteHeroSlide(id: number, token: string): Promise<void> {
  await apiClient.delete(`/admin/hero-slides/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}
