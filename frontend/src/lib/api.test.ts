import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError, apiFetch, clearToken, getToken, setToken } from "./api";

describe("token storage", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("returns null when no token is stored", () => {
    expect(getToken()).toBeNull();
  });

  it("round-trips a token through localStorage", () => {
    setToken("abc.def.ghi");
    expect(getToken()).toBe("abc.def.ghi");
    clearToken();
    expect(getToken()).toBeNull();
  });
});

describe("apiFetch", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it("sends Authorization header when a token is stored", async () => {
    setToken("my-token");
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "content-type": "application/json" },
      })
    );
    global.fetch = fetchMock as unknown as typeof fetch;

    await apiFetch("/api/v1/auth/me");

    const [, init] = fetchMock.mock.calls[0];
    expect(init.headers.Authorization).toBe("Bearer my-token");
  });

  it("omits Authorization header without a token", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({}), {
        status: 200,
        headers: { "content-type": "application/json" },
      })
    );
    global.fetch = fetchMock as unknown as typeof fetch;

    await apiFetch("/api/v1/health");

    const [, init] = fetchMock.mock.calls[0];
    expect(init.headers.Authorization).toBeUndefined();
  });

  it("serializes the json option as request body", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({}), {
        status: 200,
        headers: { "content-type": "application/json" },
      })
    );
    global.fetch = fetchMock as unknown as typeof fetch;

    await apiFetch("/api/v1/books", {
      method: "POST",
      json: { title: "Foo", status: "unread" },
    });

    const [, init] = fetchMock.mock.calls[0];
    expect(init.method).toBe("POST");
    expect(init.body).toBe(JSON.stringify({ title: "Foo", status: "unread" }));
  });

  it("returns null on 204 No Content", async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValue(new Response(null, { status: 204 })) as unknown as typeof fetch;

    const result = await apiFetch("/api/v1/auth/logout", { method: "DELETE" });
    expect(result).toBeNull();
  });

  it("throws ApiError with status and message on 4xx", async () => {
    global.fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "content-type": "application/json" },
      })
    ) as unknown as typeof fetch;

    await expect(apiFetch("/api/v1/auth/me")).rejects.toMatchObject({
      status: 401,
      message: "Unauthorized",
    });
  });

  it("flattens errors array into the ApiError message", async () => {
    global.fetch = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({ errors: ["Title can't be blank", "Status is invalid"] }),
        {
          status: 422,
          headers: { "content-type": "application/json" },
        }
      )
    ) as unknown as typeof fetch;

    try {
      await apiFetch("/api/v1/books", { method: "POST", json: {} });
      expect.fail("expected ApiError");
    } catch (e) {
      expect(e).toBeInstanceOf(ApiError);
      expect((e as ApiError).status).toBe(422);
      expect((e as Error).message).toContain("Title can't be blank");
    }
  });
});
