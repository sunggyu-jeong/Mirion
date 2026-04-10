import type {
  AlchemyAssetTransfersResponse,
  AlchemyJsonRpcResponse,
  AlchemyTokenBalancesResponse,
  AlchemyTransferRaw,
  Env,
  WhaleTxDTO,
  WhaleProfileDTO,
} from "../types";

const WEI_PER_ETH = 1_000_000_000_000_000_000n;

async function alchemyRequest<T>(
  method: string,
  params: unknown[],
  env: Env,
): Promise<T> {
  const url = `https://${env.ALCHEMY_NETWORK}.g.alchemy.com/v2/${env.ALCHEMY_API_KEY}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: 1, jsonrpc: "2.0", method, params }),
  });

  if (!res.ok) throw new Error(`Alchemy HTTP ${res.status}`);

  const json = (await res.json()) as AlchemyJsonRpcResponse<T>;
  if (json.error) throw new Error(json.error.message);
  return json.result as T;
}

function resolveType(
  raw: AlchemyTransferRaw,
  address: string,
): WhaleTxDTO["type"] {
  return raw.from.toLowerCase() === address.toLowerCase() ? "send" : "receive";
}

export async function getWhaleTransfers(
  address: string,
  minValueEth: number,
  env: Env,
): Promise<WhaleTxDTO[]> {
  const maxCount = "0x14";
  const base = {
    category: ["external", "internal", "erc20"],
    withMetadata: true,
    excludeZeroValue: true,
    maxCount,
  };

  const [outgoing, incoming] = await Promise.all([
    alchemyRequest<AlchemyAssetTransfersResponse>(
      "alchemy_getAssetTransfers",
      [{ ...base, fromAddress: address }],
      env,
    ),
    alchemyRequest<AlchemyAssetTransfersResponse>(
      "alchemy_getAssetTransfers",
      [{ ...base, toAddress: address }],
      env,
    ),
  ]);

  const merged = new Map<string, AlchemyTransferRaw>();
  for (const t of [...outgoing.transfers, ...incoming.transfers]) {
    merged.set(t.hash, t);
  }

  return [...merged.values()]
    .filter((t) => (t.value ?? 0) >= minValueEth)
    .map((raw) => ({
      txHash: raw.hash,
      type: resolveType(raw, address),
      amountEth: raw.value ?? 0,
      amountUsd: 0,
      fromAddress: raw.from,
      toAddress: raw.to ?? "",
      timestampMs: new Date(raw.metadata.blockTimestamp).getTime(),
      blockNumber: raw.blockNum,
      isLarge: (raw.value ?? 0) >= minValueEth,
      asset: raw.asset ?? "ETH",
    }));
}

export async function getWhaleProfile(
  address: string,
  ethPriceUsd: number,
  env: Env,
): Promise<WhaleProfileDTO> {
  const [balanceHex, tokenData] = await Promise.all([
    alchemyRequest<string>("eth_getBalance", [address, "latest"], env),
    alchemyRequest<AlchemyTokenBalancesResponse>(
      "alchemy_getTokenBalances",
      [address, "erc20"],
      env,
    ),
  ]);

  const ethBalance = BigInt(balanceHex);
  const ethAmount = Number(ethBalance) / Number(WEI_PER_ETH);

  return {
    ethBalance: balanceHex,
    totalValueUsd: ethAmount * ethPriceUsd,
    tokens: tokenData.tokenBalances
      .filter((t) => BigInt(t.tokenBalance) !== 0n)
      .map((t) => ({
        contractAddress: t.contractAddress,
        rawBalance: t.tokenBalance,
      })),
  };
}
