declare module 'react-native-config' {
  const Config: {
    TIMELOCK_CONTRACT_ADDRESS?: string;
    RPC_URL?: string;
    CHAIN_ID?: string;
    WORKER_URL?: string;
    [key: string]: string | undefined;
  };
  export = Config;
}
