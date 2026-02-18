const API_BASE_URL =
  (import.meta.env.VITE_API_URL as string | undefined)?.trim() || "http://127.0.0.1:8000";

export async function apiFetch<T = unknown>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem("access_token");

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers as Record<string, string>),
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    let message = "API error";
    if (typeof error?.detail === "string") {
      message = error.detail;
    } else if (Array.isArray(error?.detail)) {
      const parts = error.detail.map(
        (e: { loc?: unknown[]; msg?: string }) =>
          [e.loc?.filter(Boolean).join("."), e.msg].filter(Boolean).join(": ")
      );
      message = parts.length ? parts.join("; ") : "Validation error";
    }
    throw new Error(message);
  }

  return response.json();
}

export async function getHealth(): Promise<{ status: string }> {
  const res = await fetch(`${API_BASE_URL}/health`);
  if (!res.ok) throw new Error("API error");
  return res.json();
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public data?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  return apiFetch<T>(endpoint, options);
}

export async function testConnection() {
  return fetchApi<{ message: string }>("/");
}

export async function testApiConnection() {
  return getHealth();
}

export async function getProducts() {
  return fetchApi<unknown>("/api/products");
}

export async function generateStore(data: unknown) {
  return fetchApi<unknown>("/api/generate_store", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function connectInstagram(data: unknown) {
  return fetchApi<unknown>("/api/connect_ig", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export const api = {
  testConnection,
  testApiConnection,
  getHealth,
  getProducts,
  generateStore,
  connectInstagram,
};
