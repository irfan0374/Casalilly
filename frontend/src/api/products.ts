import apiClient from "./client";
import type { Product, ProductInput, UploadResponse } from "../types";

export async function getProducts(
  category?: string,
  featured?: boolean,
  search?: string
): Promise<Product[]> {
  const params: Record<string, string | boolean> = {};
  if (category) params.category = category;
  if (featured !== undefined) params.featured = featured;
  if (search) params.search = search;
  const { data } = await apiClient.get<Product[]>("/products", { params });
  return data;
}

/** Admin-scoped listing — includes inactive products, unlike the public endpoint. */
export async function adminListProducts(token: string): Promise<Product[]> {
  const { data } = await apiClient.get<Product[]>("/admin/products", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
}

export async function getProduct(id: string | number): Promise<Product> {
  const { data } = await apiClient.get<Product>(`/products/${id}`);
  return data;
}

export async function getCategories(): Promise<string[]> {
  const { data } = await apiClient.get<string[]>("/categories");
  return data;
}

export async function createProduct(
  input: ProductInput,
  token: string
): Promise<Product> {
  const { data } = await apiClient.post<Product>("/admin/products", input, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
}

export async function updateProduct(
  id: string | number,
  input: ProductInput,
  token: string
): Promise<Product> {
  const { data } = await apiClient.put<Product>(
    `/admin/products/${id}`,
    input,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return data;
}

export async function deleteProduct(
  id: string | number,
  token: string
): Promise<void> {
  await apiClient.delete(`/admin/products/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function uploadImage(
  file: File,
  token: string
): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await apiClient.post<UploadResponse>(
    "/admin/uploads",
    formData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return data;
}
