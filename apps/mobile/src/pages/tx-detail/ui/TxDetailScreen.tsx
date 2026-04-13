import type { WhaleTxType } from '@entities/whale-tx';
import { getMagnitudeInfo } from '@entities/whale-tx';
import { formatRelativeTime, formatUsd } from '@shared/lib/format';
import { useAppNavigation } from '@shared/lib/navigation';
import {
  ArrowDownLeft,
  ArrowLeft,
  ArrowUpRight,
  ChevronRight,
  Copy,
  ExternalLink,
  RefreshCw,
} from 'lucide-react-native';
import React, { useCallback } from 'react';
import { Clipboard, Linking, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export type TxDetailParams = {
  txHash: string;
  type: WhaleTxType;
  amountNative: number;
  amountUsd: number;
  fromAddress: string;
  toAddress: string;
  timestampMs: number;
  blockNumber: string;
  isLarge: boolean;
  asset: string;
  chain: string;
};

const TYPE_CONFIG = {
  send: { label: '대규모 전송', Icon: ArrowUpRight, color: '#fb2c36', bg: '#fff1f2' },
  receive: { label: '대규모 수신', Icon: ArrowDownLeft, color: '#22c55e', bg: '#f0fdf4' },
  swap: { label: '대규모 스왑', Icon: RefreshCw, color: '#f97316', bg: '#fff7ed' },
} as const;

const EXPLORER_BASE: Record<string, string> = {
  ETH: 'https://etherscan.io/tx/',
  BTC: 'https://blockstream.info/tx/',
  SOL: 'https://solscan.io/tx/',
  BNB: 'https://bscscan.com/tx/',
  XRP: 'https://xrpscan.com/tx/',
  TRX: 'https://tronscan.org/#/transaction/',
};

const EXPLORER_LABEL: Record<string, string> = {
  ETH: 'Etherscan',
  BTC: 'Blockstream',
  SOL: 'Solscan',
  BNB: 'BscScan',
  XRP: 'XRPScan',
  TRX: 'Tronscan',
};

const CHAIN_COLOR: Record<string, string> = {
  ETH: '#627eea',
  BTC: '#f7931a',
  SOL: '#9945ff',
  BNB: '#f0b90b',
  XRP: '#346aa9',
  TRX: '#e50914',
};

function formatAbsoluteTime(ms: number): string {
  const d = new Date(ms);
  return d.toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

function shortenHash(hash: string): string {
  return `${hash.slice(0, 10)}...${hash.slice(-8)}`;
}

function CopyRow({ label, value, short }: { label: string; value: string; short?: string }) {
  const handleCopy = useCallback(() => {
    Clipboard.setString(value);
  }, [value]);

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
      }}
    >
      <Text style={{ fontSize: 13, color: '#64748b', fontWeight: '500', width: 80 }}>{label}</Text>
      <View
        style={{
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
          justifyContent: 'flex-end',
        }}
      >
        <Text
          style={{
            fontSize: 13,
            color: '#0f172b',
            fontWeight: '500',
            fontFamily: 'monospace',
            flexShrink: 1,
          }}
          numberOfLines={1}
        >
          {short ?? value}
        </Text>
        <Pressable
          onPress={handleCopy}
          hitSlop={8}
          style={{ padding: 4 }}
        >
          <Copy
            size={14}
            color="#94a3b8"
            strokeWidth={2}
          />
        </Pressable>
      </View>
    </View>
  );
}

function InfoRow({
  label,
  value,
  valueColor,
}: {
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
      }}
    >
      <Text style={{ fontSize: 13, color: '#64748b', fontWeight: '500' }}>{label}</Text>
      <Text style={{ fontSize: 13, color: valueColor ?? '#0f172b', fontWeight: '600' }}>
        {value}
      </Text>
    </View>
  );
}

interface Props {
  route: { params: TxDetailParams };
}

export function TxDetailScreen({ route }: Props) {
  const tx = route.params;
  const { goBack } = useAppNavigation();
  const config = TYPE_CONFIG[tx.type];
  const { Icon } = config;
  const magnitude = getMagnitudeInfo(tx.amountNative);
  const chainColor = CHAIN_COLOR[tx.chain] ?? '#94a3b8';
  const explorerBase = EXPLORER_BASE[tx.chain] ?? EXPLORER_BASE.ETH;
  const explorerLabel = EXPLORER_LABEL[tx.chain] ?? 'Explorer';

  const handleOpenExplorer = useCallback(() => {
    Linking.openURL(`${explorerBase}${tx.txHash}`);
  }, [explorerBase, tx.txHash]);

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: 'white' }}
      edges={['top', 'bottom']}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 20,
          paddingVertical: 14,
          borderBottomWidth: 1,
          borderBottomColor: '#f1f5f9',
        }}
      >
        <Pressable
          onPress={goBack}
          hitSlop={8}
          style={{ marginRight: 12 }}
        >
          <ArrowLeft
            size={22}
            color="#0f172b"
            strokeWidth={2}
          />
        </Pressable>
        <Text style={{ fontSize: 17, fontWeight: '700', color: '#0f172b', letterSpacing: -0.3 }}>
          거래 상세
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 24, paddingBottom: 48 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ alignItems: 'center', gap: 12, marginBottom: 28 }}>
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: 20,
              backgroundColor: config.bg,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon
              size={28}
              color={config.color}
              strokeWidth={2}
            />
          </View>
          <View style={{ alignItems: 'center', gap: 6 }}>
            <Text
              style={{ fontSize: 18, fontWeight: '700', color: '#0f172b', letterSpacing: -0.4 }}
            >
              {config.label}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <View
                style={{
                  backgroundColor: magnitude.bg,
                  borderRadius: 6,
                  paddingHorizontal: 8,
                  paddingVertical: 3,
                }}
              >
                <Text style={{ fontSize: 12, fontWeight: '700', color: magnitude.color }}>
                  {magnitude.label}
                </Text>
              </View>
              <View
                style={{
                  backgroundColor: chainColor + '18',
                  borderRadius: 6,
                  paddingHorizontal: 8,
                  paddingVertical: 3,
                }}
              >
                <Text style={{ fontSize: 12, fontWeight: '700', color: chainColor }}>
                  {tx.chain}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View
          style={{
            backgroundColor: '#f8fafc',
            borderRadius: 18,
            padding: 20,
            alignItems: 'center',
            gap: 4,
            marginBottom: 20,
            borderWidth: 1,
            borderColor: '#f1f5f9',
          }}
        >
          <Text
            style={{ fontSize: 32, fontWeight: '800', color: config.color, letterSpacing: -0.8 }}
          >
            {tx.amountNative.toFixed(2)} {tx.asset}
          </Text>
          <Text style={{ fontSize: 16, fontWeight: '500', color: '#64748b' }}>
            {formatUsd(tx.amountUsd)}
          </Text>
        </View>

        <View
          style={{
            backgroundColor: '#f8fafc',
            borderRadius: 16,
            paddingHorizontal: 16,
            marginBottom: 16,
            borderWidth: 1,
            borderColor: '#f1f5f9',
          }}
        >
          <InfoRow
            label="시간"
            value={`${formatAbsoluteTime(tx.timestampMs)} · ${formatRelativeTime(tx.timestampMs)}`}
          />
          <InfoRow
            label="블록"
            value={`#${BigInt(tx.blockNumber).toLocaleString()}`}
          />
          <InfoRow
            label="상태"
            value="확인됨"
            valueColor="#22c55e"
          />
        </View>

        <View
          style={{
            backgroundColor: '#f8fafc',
            borderRadius: 16,
            paddingHorizontal: 16,
            marginBottom: 16,
            borderWidth: 1,
            borderColor: '#f1f5f9',
          }}
        >
          <CopyRow
            label="Tx Hash"
            value={tx.txHash}
            short={shortenHash(tx.txHash)}
          />
          <CopyRow
            label="보낸 주소"
            value={tx.fromAddress}
            short={`${tx.fromAddress.slice(0, 8)}...${tx.fromAddress.slice(-6)}`}
          />
          <View style={{ paddingVertical: 10, alignItems: 'center' }}>
            <ChevronRight
              size={16}
              color="#cbd5e1"
              strokeWidth={2}
              style={{ transform: [{ rotate: '90deg' }] }}
            />
          </View>
          <CopyRow
            label="받은 주소"
            value={tx.toAddress}
            short={`${tx.toAddress.slice(0, 8)}...${tx.toAddress.slice(-6)}`}
          />
        </View>

        <Pressable
          onPress={handleOpenExplorer}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            paddingVertical: 14,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: '#e2e8f0',
            backgroundColor: 'white',
          }}
        >
          <ExternalLink
            size={15}
            color="#64748b"
            strokeWidth={2}
          />
          <Text style={{ fontSize: 14, fontWeight: '500', color: '#64748b' }}>
            {explorerLabel}에서 보기
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
