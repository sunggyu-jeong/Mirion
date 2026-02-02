import type { HistoryItem } from '@/entities/history/model';
import { config, CONTRACT_ADDRESS, isEmpty } from '@/shared';
import { getPublicClient } from '@wagmi/core';
import { parseAbiItem } from 'viem';


const DEPOSIT_EVENT = parseAbiItem(
  'event Deposit(address indexed user, uint256 amount, uint256 unlockTime)',
);
const WITHDRAW_EVENT = parseAbiItem(
  'event Withdraw(address indexed user, uint256 amount, uint256 fee)',
);

export const fetchUserHistory = async (userAddress: `0x${string}`): Promise<HistoryItem[]> => {
  try {
    const publicClient = getPublicClient(config);
    if (isEmpty(publicClient)) {
      throw new Error('Public client not found');
    }

    const [depositLogs, withdrawLogs] = await Promise.all([
      publicClient.getLogs({
        address: CONTRACT_ADDRESS,
        event: DEPOSIT_EVENT,
        args: { user: userAddress },
        fromBlock: 'earliest',
        toBlock: 'latest',
      }),
      publicClient.getLogs({
        address: CONTRACT_ADDRESS,
        event: WITHDRAW_EVENT,
        args: { user: userAddress },
        fromBlock: 'earliest',
        toBlock: 'latest',
      }),
    ]);

    const blockNumbers = new Set<bigint>();
    depositLogs.forEach(l => blockNumbers.add(l.blockNumber));
    withdrawLogs.forEach(l => blockNumbers.add(l.blockNumber));

    const blockTimeMap = new Map<string, number>();
    await Promise.all(
      Array.from(blockNumbers).map(async bn => {
        const block = await publicClient.getBlock({ blockNumber: bn });
        blockTimeMap.set(bn.toString(), Number(block.timestamp));
      }),
    );

    const formattedDeposit: HistoryItem[] = depositLogs.map(el => ({
      id: `${el.transactionHash}-${el.logIndex}`,
      type: 'DEPOSIT',
      amount: el.args.amount?.toString() || '0',
      unlockTime: el.args.unlockTime?.toString() || '',
      timestamp: blockTimeMap.get(el.blockNumber.toString()) || 0,
      txHash: el.transactionHash,
    }));

    const formattedWithdraw: HistoryItem[] = withdrawLogs.map(el => ({
      id: `${el.transactionHash}-${el.logIndex}`,
      type: 'WITHDRAW',
      amount: el.args.amount?.toString() || '0',
      unlockTime: '',
      timestamp: blockTimeMap.get(el.blockNumber.toString()) || 0,
      txHash: el.transactionHash,
    }));

    return [...formattedDeposit, ...formattedWithdraw].sort((a, b) => b.timestamp - a.timestamp);
  } catch (err) {
    console.error('Fetch history failed:', err);
    throw err;
  }
};
