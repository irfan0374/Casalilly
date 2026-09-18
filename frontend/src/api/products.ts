import axios from "axios";
import apiClient from "./client";
import type {
  Product,
  ProductInput,
  UploadResponse,
  VideoUploadSignature,
} from "../types";

export async function getProducts(
  category?: string,
  featured?: boolean,
  search?: string,
  skip?: number,
  limit?: number
): Promise<Product[]> {
  const params: Record<string, string | boolean | number> = {};
  if (category) params.category = category;
  if (featured !== undefined) params.featured = featured;
  if (search) params.search = search;
  if (skip !== undefined) params.skip = skip;
  if (limit !== undefined) params.limit = limit;
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
  input: Partial<ProductInput>,
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

export async function getVideoUploadSignature(
  token: string
): Promise<VideoUploadSignature> {
  const { data } = await apiClient.get<VideoUploadSignature>(
    "/admin/uploads/video/signature",
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return data;
}

/** Uploads straight to Cloudinary from the browser using a signature our
 * backend issued — the file's bytes never touch our server, so a large
 * video doesn't tie up Render's request thread/memory relaying it, and
 * doesn't cross the network twice. Deliberately uses a bare `axios` POST
 * (not `apiClient`) since this request is going to Cloudinary's own API,
 * not ours — it must not carry our Authorization header or baseURL. */
export async function uploadVideoDirect(
  file: File,
  sig: VideoUploadSignature,
  onProgress?: (percent: number) => void
): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", sig.api_key);
  formData.append("timestamp", String(sig.timestamp));
  formData.append("signature", sig.signature);
  formData.append("folder", sig.folder);

  const { data } = await axios.post(
    `https://api.cloudinary.com/v1_1/${sig.cloud_name}/video/upload`,
    formData,
    {
      onUploadProgress: (e) => {
        if (onProgress && e.total) {
          onProgress(Math.round((e.loaded / e.total) * 100));
        }
      },
    }
  );
  return { url: data.secure_url, public_id: data.public_id };
}
