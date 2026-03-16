import { describe, it, expect, vi, beforeEach } from "vitest";
import { api } from "./api";

const BASE = "http://localhost/api";

// Helper to build a mock Response
function mockResponse(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? "OK" : "Error",
    json: () => Promise.resolve(body),
  } as unknown as Response;
}

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

beforeEach(() => {
  mockFetch.mockReset();
});

// --- apiFetch общие свойства ---

describe("apiFetch", () => {
  it("всегда передаёт credentials: include", async () => {
    mockFetch.mockResolvedValue(mockResponse({ data: [] }));
    await api.sections.list();
    const [, options] = mockFetch.mock.calls[0];
    expect(options.credentials).toBe("include");
  });

  it("всегда передаёт Content-Type: application/json", async () => {
    mockFetch.mockResolvedValue(mockResponse({ data: [] }));
    await api.sections.list();
    const [, options] = mockFetch.mock.calls[0];
    expect(options.headers["Content-Type"]).toBe("application/json");
  });
});

// --- api.articles ---

describe("api.articles.list()", () => {
  const mockList = {
    data: [{ id: 1, title: "Test" }],
    meta: { current_page: 1, total_pages: 1, total_count: 1, per_page: 20 },
  };

  it("вызывает правильный URL без параметров", async () => {
    mockFetch.mockResolvedValue(mockResponse(mockList));
    await api.articles.list();
    expect(mockFetch).toHaveBeenCalledWith(`${BASE}/articles`, expect.any(Object));
  });

  it("возвращает объект { data, meta }", async () => {
    mockFetch.mockResolvedValue(mockResponse(mockList));
    const result = await api.articles.list();
    expect(result.data).toHaveLength(1);
    expect(result.meta.total_count).toBe(1);
  });

  it("передаёт параметры page и q в строке запроса", async () => {
    mockFetch.mockResolvedValue(mockResponse(mockList));
    await api.articles.list({ page: 2, q: "биохимия" });
    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain("page=2");
    expect(url).toContain("q=%D0%B1%D0%B8%D0%BE%D1%85%D0%B8%D0%BC%D0%B8%D1%8F");
  });

  it("передаёт section_id в строке запроса", async () => {
    mockFetch.mockResolvedValue(mockResponse(mockList));
    await api.articles.list({ section_id: 5 });
    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain("section_id=5");
  });
});

describe("api.articles.get(id)", () => {
  it("строит URL /articles/1", async () => {
    mockFetch.mockResolvedValue(mockResponse({ data: { id: 1 } }));
    await api.articles.get(1);
    expect(mockFetch).toHaveBeenCalledWith(`${BASE}/articles/1`, expect.any(Object));
  });

  it("бросает ошибку при 404", async () => {
    mockFetch.mockResolvedValue(mockResponse({ error: "Запись не найдена" }, 404));
    await expect(api.articles.get(999)).rejects.toThrow("Запись не найдена");
  });
});

describe("api.articles.create(body)", () => {
  it("отправляет POST с корректным body", async () => {
    const article = { id: 1, title: "Новая" };
    mockFetch.mockResolvedValue(mockResponse({ data: article }, 201));
    const result = await api.articles.create({ title: "Новая", content: "..." });
    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toBe(`${BASE}/articles`);
    expect(options.method).toBe("POST");
    expect(JSON.parse(options.body)).toMatchObject({ article: { title: "Новая" } });
    expect(result.data.title).toBe("Новая");
  });
});

describe("api.articles.update(id, body)", () => {
  it("отправляет PATCH с корректным body", async () => {
    mockFetch.mockResolvedValue(mockResponse({ data: { id: 1, title: "Изменено" } }));
    await api.articles.update(1, { title: "Изменено" });
    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toBe(`${BASE}/articles/1`);
    expect(options.method).toBe("PATCH");
    expect(JSON.parse(options.body)).toMatchObject({ article: { title: "Изменено" } });
  });
});

describe("api.articles.delete(id)", () => {
  it("отправляет DELETE и возвращает undefined при 204", async () => {
    mockFetch.mockResolvedValue(mockResponse(null, 204));
    const result = await api.articles.delete(1);
    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toBe(`${BASE}/articles/1`);
    expect(options.method).toBe("DELETE");
    expect(result).toBeUndefined();
  });
});

// --- api.sections ---

describe("api.sections.list()", () => {
  it("делает GET /sections", async () => {
    mockFetch.mockResolvedValue(mockResponse({ data: [] }));
    await api.sections.list();
    expect(mockFetch).toHaveBeenCalledWith(`${BASE}/sections`, expect.any(Object));
  });
});

describe("api.sections.get(slug)", () => {
  it("делает GET /sections/biomechanics", async () => {
    mockFetch.mockResolvedValue(mockResponse({ data: { slug: "biomechanics" } }));
    await api.sections.get("biomechanics");
    expect(mockFetch).toHaveBeenCalledWith(`${BASE}/sections/biomechanics`, expect.any(Object));
  });
});

// --- api.comments ---

describe("api.comments.list(articleId)", () => {
  it("делает GET /articles/1/comments", async () => {
    mockFetch.mockResolvedValue(mockResponse({ data: [] }));
    await api.comments.list(1);
    expect(mockFetch).toHaveBeenCalledWith(`${BASE}/articles/1/comments`, expect.any(Object));
  });
});

describe("api.comments.create(articleId, body)", () => {
  it("отправляет POST с body", async () => {
    mockFetch.mockResolvedValue(mockResponse({ data: { id: 10 } }, 201));
    await api.comments.create(1, "Отличная статья!");
    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toBe(`${BASE}/articles/1/comments`);
    expect(options.method).toBe("POST");
    expect(JSON.parse(options.body)).toMatchObject({ comment: { body: "Отличная статья!" } });
  });
});

// --- api.auth ---

describe("api.auth.signIn(email, password)", () => {
  it("отправляет POST /auth/sign_in", async () => {
    mockFetch.mockResolvedValue(
      mockResponse({ data: { id: 1, name: "Иван", role: "member" }, message: "OK" })
    );
    await api.auth.signIn("user@example.com", "password");
    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toBe(`${BASE}/auth/sign_in`);
    expect(options.method).toBe("POST");
    expect(JSON.parse(options.body)).toMatchObject({ user: { email: "user@example.com" } });
  });

  it("бросает ошибку при 401", async () => {
    mockFetch.mockResolvedValue(mockResponse({ error: "Неверные данные" }, 401));
    await expect(api.auth.signIn("x@x.com", "wrong")).rejects.toThrow("Неверные данные");
  });
});

describe("api.auth.signUp(name, email, password)", () => {
  it("отправляет POST /auth/sign_up", async () => {
    mockFetch.mockResolvedValue(
      mockResponse({ data: { id: 2, name: "Новый", role: "guest" }, message: "OK" }, 201)
    );
    await api.auth.signUp("Новый", "new@example.com", "Password123!");
    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toBe(`${BASE}/auth/sign_up`);
    expect(options.method).toBe("POST");
    expect(JSON.parse(options.body)).toMatchObject({
      user: { name: "Новый", email: "new@example.com" },
    });
  });
});

// --- api.reports ---

describe("api.reports.popular()", () => {
  it("делает GET /reports/popular без параметров", async () => {
    mockFetch.mockResolvedValue(mockResponse({ data: [] }));
    await api.reports.popular();
    expect(mockFetch).toHaveBeenCalledWith(`${BASE}/reports/popular`, expect.any(Object));
  });

  it("передаёт from и to в строке запроса", async () => {
    mockFetch.mockResolvedValue(mockResponse({ data: [] }));
    await api.reports.popular({ from: "2026-01-01", to: "2026-01-31" });
    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain("from=2026-01-01");
    expect(url).toContain("to=2026-01-31");
  });
});
