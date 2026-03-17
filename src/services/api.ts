const API_URL = import.meta.env.PUBLIC_API_URL ?? "http://localhost/api";

// Токен хранится в httpOnly cookie — JS не имеет к нему доступа.
// Браузер отправляет его автоматически при credentials: "include".

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
  tags:           TagRef[];
  comments_count: number;
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

export interface UserProfile {
  id:    number;
  name:  string;
  email: string;
  role:  string;
}

export interface Bookmark {
  id:         number;
  created_at: string;
  article:    Article;
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
  options: RequestInit = {}
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    credentials: "include",
  });

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
    list: (params: { page?: number; q?: string; section_id?: number; per_page?: number; tag_id?: number; author_id?: number; sort?: string } = {}) => {
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

    create: (body: Partial<Article>) =>
      apiFetch<{ data: Article }>("/articles", {
        method: "POST",
        body: JSON.stringify({ article: body }),
      }),

    update: (id: number, body: Partial<Article>) =>
      apiFetch<{ data: Article }>(`/articles/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ article: body }),
      }),

    delete: (id: number) =>
      apiFetch<void>(`/articles/${id}`, { method: "DELETE" }),
  },

  sections: {
    list: () => apiFetch<{ data: Section[] }>("/sections"),
    get:  (slug: string) => apiFetch<{ data: Section }>(`/sections/${slug}`),
  },

  tags: {
    get: (id: number) => apiFetch<{ data: { id: number; name: string } }>(`/tags/${id}`),
  },

  comments: {
    list:   (articleId: number) => apiFetch<{ data: Comment[] }>(`/articles/${articleId}/comments`),
    create: (articleId: number, body: string) =>
      apiFetch<{ data: Comment }>(`/articles/${articleId}/comments`, {
        method: "POST",
        body: JSON.stringify({ comment: { body } }),
      }),
  },

  auth: {
    signIn: (email: string, password: string) =>
      apiFetch<{ data: { id: number; name: string; role: string }; message: string }>(
        "/auth/sign_in", { method: "POST", body: JSON.stringify({ api_user: { email, password } }) }
      ),
    signUp: (name: string, email: string, password: string) =>
      apiFetch<{ data: { id: number; name: string; role: string }; message: string }>(
        "/auth/sign_up", {
          method: "POST",
          body: JSON.stringify({ api_user: { name, email, password, password_confirmation: password } }),
        }
      ),
  },

  profile: {
    show: () => apiFetch<{ data: UserProfile }>("/profile"),
    update: (body: Partial<Pick<UserProfile, "name" | "email"> & { password?: string }>) =>
      apiFetch<{ data: UserProfile }>("/profile", {
        method: "PATCH",
        body: JSON.stringify({ user: body }),
      }),
  },

  bookmarks: {
    list:   () => apiFetch<{ data: Bookmark[] }>("/bookmarks"),
    create: (articleId: number) =>
      apiFetch<{ data: Bookmark }>("/bookmarks", {
        method: "POST",
        body: JSON.stringify({ bookmark: { article_id: articleId } }),
      }),
    delete: (id: number) => apiFetch<void>(`/bookmarks/${id}`, { method: "DELETE" }),
  },

  authors: {
    show: (id: number) => apiFetch<{ data: { id: number; name: string; role: string } }>(`/authors/${id}`),
  },

  reports: {
    popular: (params: { from?: string; to?: string } = {}) => {
      const qs = new URLSearchParams(params as Record<string, string>).toString();
      return apiFetch<{ data: Array<Article & { period_views: number }> }>(`/reports/popular${qs ? "?" + qs : ""}`);
    },
  },
};
