import { describe, it, expect, vi, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useSearch } from "./useSearch";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("useSearch", () => {
  it("inicia com estado vazio", () => {
    const { result } = renderHook(() => useSearch());

    expect(result.current.query).toBe("");
    expect(result.current.results).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.hasSearched).toBe(false);
  });

  it("não dispara busca com menos de 2 caracteres", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => useSearch());

    act(() => {
      result.current.setQuery("a");
    });

    // aguarda além do debounce
    await new Promise((resolve) => setTimeout(resolve, 400));

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("busca produtos após o debounce para um termo válido", async () => {
    const mockData = [{ id: 1, name: "Camiseta conforto" }];
    const fetchMock = vi
      .fn()
      .mockResolvedValue({ ok: true, json: async () => mockData });
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => useSearch());

    act(() => {
      result.current.setQuery("camiseta");
    });

    await waitFor(() => {
      expect(result.current.results).toEqual(mockData);
    });

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("q=camiseta"),
      expect.any(Object)
    );
    expect(result.current.hasResults).toBe(true);
  });

  it("clear() reseta o estado da busca", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue({ ok: true, json: async () => [{ id: 1 }] });
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => useSearch());

    act(() => {
      result.current.setQuery("camiseta");
    });

    await waitFor(() => {
      expect(result.current.hasResults).toBe(true);
    });

    act(() => {
      result.current.clear();
    });

    expect(result.current.query).toBe("");
    expect(result.current.results).toEqual([]);
    expect(result.current.hasSearched).toBe(false);
  });
});
