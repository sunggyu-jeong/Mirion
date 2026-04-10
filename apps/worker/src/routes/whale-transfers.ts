import type { Env } from "../types";
import { withCache } from "../lib/cache";
import { getWhaleTransfers } from "../lib/alchemy";

export async function handleWhaleTransfers(
  request: Request,
  env: Env,
): Promise<Response> {
  const url = new URL(request.url);
  const address = url.searchParams.get("address");
  const minValueEth = Number(url.searchParams.get("minValueEth") ?? "100");

  if (!address) {
    return Response.json({ error: "address required" }, { status: 400 });
  }

  const cacheKey = `whale-transfers:${address.toLowerCase()}:${minValueEth}`;
  const data = await withCache(env.CACHE, cacheKey, 300, () =>
    getWhaleTransfers(address, minValueEth, env),
  );

  return Response.json(data);
}
