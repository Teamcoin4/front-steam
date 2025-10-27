function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}
function pickFiniteNumber(v: unknown): number | null {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) && n > 0 ? n : null;
}
function extractUserId(resp: unknown): number | null {
  if (!isObject(resp)) return null;

  if ("data" in resp && isObject((resp as { data?: unknown }).data)) {
    const d = (resp as { data?: unknown }).data as Record<string, unknown>;
    return pickFiniteNumber(d.userId ?? d.id);
  }

  return pickFiniteNumber(
    (resp as Record<string, unknown>).userId ??
      (resp as Record<string, unknown>).id
  );
}

export async function resolveInternalUserId(
  steamid: string,
  accessToken?: string | null
): Promise<number | null> {
  const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";
  const tryKeys = ["steamId", "steamid"];

  for (const key of tryKeys) {
    const url = `${base}/api/v1/users/resolve?${key}=${encodeURIComponent(steamid)}`;
    try {
      const r = await fetch(url, {
        method: "GET",
        headers: {
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      if (!r.ok) continue;

      let body: unknown = null;
      try {
        body = await r.json();
      } catch {
        body = null;
      }

      const userId = extractUserId(body);
      if (userId !== null) return userId;
    } catch {}
  }
  return null;
}
