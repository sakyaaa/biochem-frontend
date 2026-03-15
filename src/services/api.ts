const API_URL =
  (typeof import.meta !== "undefined" && import.meta.env?.PUBLIC_API_URL) ||
  process.env.PUBLIC_API_URL ||
  "http://localhost/api";

// --- Token helpers (клиентская сторона) ---
export const getToken = (): string | null =>
  typeof localStorage !== "undefined" ? localStorage.getItem("jwt_token") : null;

export const setToken = (token: string): void =>
  localStorage.setItem("jwt_token", token);

export const clearToken = (): void =>
  localStorage.removeItem("jwt_token");

// --- Types ---
export interface Author {
  id:   number;
  name: string;
}

export interface SectionRef {
  id:   number;
  name: string;
  slug: string;
}

export interface TagRef {
  id:   number;
  name: string;
}

export interface Article {
  id:          number;
  title:       string;
  content:     string;
  status:      "draft" | "published";
  views_count: number;
  created_at:  string;
  updated_at:  string;
  author:      Author;
  section:     SectionRef | null;
  tags:        TagRef[];
}

export interface Section {
  id:             number;
  name:           string;
  description:    string;
  slug:           string;
  articles_count: number;
}

export interface Comment {
  id:         number;
  body:       string;
  created_at: string;
  user:       Author;
}

export interface PaginationMeta {
  current_page: number;
  total_pages:  number;
  total_count:  number;
  per_page:     number;
}

export interface ListResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

// --- Fetch helper ---
async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  serverToken?: string
): Promise<T> {
  const token = serverToken ?? getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string>),
  };

  const response = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error((err as { error?: string }).error ?? "API Error");
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

// --- API ---
export const api = {
  articles: {
    list: (params: { page?: number; q?: string; section_id?: number; per_page?: number } = {}) => {
      const qs = new URLSearchParams(
        Object.fromEntries(
          Object.entries(params)
            .filter(([, v]) => v !== undefined)
            .map(([k, v]) => [k, String(v)])
        )
      ).toString();
      return apiFetch<ListResponse<Article>>(`/articles${qs ? "?" + qs : ""}`);
    },

    get: (id: number) =>
      apiFetch<{ data: Article }>(`/articles/${id}`),

    create: (body: Partial<Article>, token: string) =>
      apiFetch<{ data: Article }>("/articles", {
        method: "POST",
        body: JSON.stringify({ article: body }),
      }, token),

    update: (id: number, body: Partial<Article>, token: string) =>
      apiFetch<{ data: Article }>(`/articles/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ article: body }),
      }, token),

    delete: (id: number, token: string) =>
      apiFetch<void>(`/articles/${id}`, { method: "DELETE" }, token),
  },

  sections: {
    list: () => apiFetch<{ data: Section[] }>("/sections"),
    get:  (slug: string) => apiFetch<{ data: Section }>(`/sections/${slug}`),
  },

  comments: {
    list:   (articleId: number) => apiFetch<{ data: Comment[] }>(`/articles/${articleId}/comments`),
    create: (articleId: number, body: string, token: string) =>
      apiFetch<{ data: Comment }>(`/articles/${articleId}/comments`, {
        method: "POST",
        body: JSON.stringify({ comment: { body } }),
      }, token),
  },

  auth: {
    signIn: (email: string, password: string) =>
      apiFetch<{ data: { id: number; name: string; role: string }; message: string }>(
        "/auth/sign_in", { method: "POST", body: JSON.stringify({ user: { email, password } }) }
      ),
    signUp: (name: string, email: string, password: string) =>
      apiFetch<{ data: { id: number; name: string; role: string }; message: string }>(
        "/auth/sign_up", { method: "POST", body: JSON.stringify({ user: { name, email, password } }) }
      ),
  },

  reports: {
    popular: (params: { from?: string; to?: string } = {}) => {
      const qs = new URLSearchParams(params as Record<string, string>).toString();
      return apiFetch<{ data: Array<Article & { period_views: number }> }>(`/reports/popular${qs ? "?" + qs : ""}`);
    },
  },
};
