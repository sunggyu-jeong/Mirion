
import timeLockAbi from './abis/TimeLock.json';

export const CONTRACT_ADDRESS = process.env.EXPO_PUBLIC_CONTRACT_ADDRESS as `0x${string}`;

export const timeLockContract = {
    address: CONTRACT_ADDRESS,
    abi: timeLockAbi
} as const;