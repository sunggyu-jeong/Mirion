import { TIME_LOCK_ABI } from "@/shared/config/abis/TimeLockABI";

export const CONTRACT_ADDRESS = process.env
  .EXPO_PUBLIC_CONTRACT_ADDRESS as `0x${string}`;

export const timeLockContract = {
  address: CONTRACT_ADDRESS,
  abi: TIME_LOCK_ABI,
} as const;
