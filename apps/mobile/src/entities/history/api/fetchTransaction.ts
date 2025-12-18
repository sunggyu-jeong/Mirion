import { parseAbiItem } from "viem";
import { getPublicClient } from '@wagmi/core';
import { config, CONTRACT_ADDRESS, getWagmiConfig, isEmpty } from "@/src/shared";
import { HistoryItem } from "@/src/entities/history/model";

const DEPOSIT_EVENT = parseAbiItem('event Deposit(address indexed user, uint256 amount, uint256 unlockTime)');
const WITHDRAW_EVENT = parseAbiItem('event Withdraw(address indexed user, uint256 amount)');

//FIXME: - 로그 N개 > N번 호출, 추후에 graph로 변경 필요
export const fetchUserHistory = async (userAddress: `0x${string}`): Promise<HistoryItem[]> => {
  try {
    const publicClient = getPublicClient(config);

    if (isEmpty(publicClient)) throw new Error("public client가 존재하지 않습니다.")

    const getBlockTimestamp = async (blockNumber: bigint) => {
      const block = await publicClient.getBlock({ blockNumber });
      return Number(block.timestamp);
    };

    const depositLogs = await publicClient.getLogs({ 
      address: CONTRACT_ADDRESS,
      event: DEPOSIT_EVENT,
      args: { user: userAddress },
      fromBlock: 'earliest',
      toBlock: 'latest', 
    })

    const withdrawLogs = await publicClient.getLogs({ 
      address: CONTRACT_ADDRESS,
      event: WITHDRAW_EVENT,
      args: { user: userAddress },
      fromBlock: 'earliest',
      toBlock: 'latest', 
    })

    const formattedDeposit = await Promise.all(
      depositLogs.map(async (el) => ({
        id: `${el.transactionHash}-${el.logIndex}`,
        type: 'DEPOSIT' as const,
        amount: el.args.amount?.toString() || '0',
        unlockTime: el.args.unlockTime?.toString() || '',
        timestamp: await getBlockTimestamp(el.blockNumber!), 
        txHash: el.transactionHash
      }))
    );

    const formattedWithdraw = await Promise.all(
      withdrawLogs.map(async (el) => ({
        id: `${el.transactionHash}-${el.logIndex}`,
        type: 'WITHDRAW' as const,
        amount: el.args.amount?.toString() || '0',
        timestamp: await getBlockTimestamp(el.blockNumber!),
        txHash: el.transactionHash
      }))
    );

    const allHistory = [...formattedDeposit, ...formattedWithdraw].sort(
      (a, b) => b.timestamp - a.timestamp
    );
    return allHistory
  } catch(err) {
    console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>> failed to fetch history", err);
    throw err;
  }
}