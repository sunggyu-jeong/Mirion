import type { Env } from "../types";
import { withCache } from "../lib/cache";
import { getEthMarketChart } from "../lib/coingecko";

export async function handleEthChart(
  request: Request,
  _env: Env,
): Promise<Response> {
  const period = new URL(request.url).pathname.split("/").pop() ?? "";
  if (!["1D", "1W", "1M"].includes(period)) {
    return Response.json(
      { error: `Invalid period: ${period}` },
      { status: 400 },
    );
  }

  const data = await withCache(`eth-chart:${period}`, 300, () =>
    getEthMarketChart(period),
  );
  return Response.json(data);
}
