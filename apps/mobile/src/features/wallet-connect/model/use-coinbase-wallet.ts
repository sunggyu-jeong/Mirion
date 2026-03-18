import { configure, initiateHandshake, disconnect } from '@coinbase/wallet-mobile-sdk';

import { secureKey, useWalletStore } from '@entities/wallet';

const WALLET_KEY_ID = 'cb-session-key';

configure({
  callbackURL: new URL('lockfi://'),
  hostURL: new URL('https://wallet.coinbase.com/wsegue'),
  hostPackageName: 'org.toshi',
});

export function useCoinbaseWallet() {
  const setSession = useWalletStore(s => s.setSession);
  const clearSession = useWalletStore(s => s.clearSession);

  const connectWallet = async () => {
    const results = await initiateHandshake([{ method: 'eth_requestAccounts', params: [] }]);
    const accounts = results[0]?.result as string[] | undefined;
    const account = accounts?.[0];
    if (!account) throw new Error('Coinbase 연결 실패: 계정을 가져올 수 없습니다');
    await secureKey.store(WALLET_KEY_ID, account);
    setSession(account, 'coinbase');
    return account;
  };

  const disconnectWallet = () => {
    disconnect();
    secureKey.delete(WALLET_KEY_ID);
    clearSession();
  };

  return { connectWallet, disconnectWallet };
}
