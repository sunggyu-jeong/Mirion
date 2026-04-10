import type { Env } from "./types";
import { handleEthChart } from "./routes/eth-chart";
import { handleEthMarket } from "./routes/eth-market";
import { handleWhaleProfile } from "./routes/whale-profile";
import { handleWhaleTransfers } from "./routes/whale-transfers";
import { handleGetWhales } from "./routes/whales";
import { setCoinGeckoApiKey } from "./lib/coingecko";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function withCors(res: Response): Response {
  const headers = new Headers(res.headers);
  Object.entries(CORS).forEach(([k, v]) => headers.set(k, v));
  return new Response(res.body, { status: res.status, headers });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (env.COINGECKO_API_KEY) setCoinGeckoApiKey(env.COINGECKO_API_KEY);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS });
    }

    if (request.method !== "GET") {
      return new Response("Method Not Allowed", { status: 405, headers: CORS });
    }

    const { pathname } = new URL(request.url);

    try {
      let res: Response;

      if (pathname === "/api/whale-transfers") {
        res = await handleWhaleTransfers(request, env);
      } else if (pathname === "/api/whale-profile") {
        res = await handleWhaleProfile(request, env);
      } else if (pathname === "/api/whales") {
        res = await handleGetWhales(request, env);
      } else if (pathname === "/api/eth-market") {
        res = await handleEthMarket(request, env);
      } else if (pathname.startsWith("/api/eth-chart/")) {
        res = await handleEthChart(request, env);
      } else {
        res = Response.json({ error: "Not Found" }, { status: 404 });
      }

      return withCors(res);
    } catch (err) {
      return Response.json(
        { error: (err as Error).message },
        { status: 500, headers: CORS },
      );
    }
  },
} satisfies ExportedHandler<Env>;
