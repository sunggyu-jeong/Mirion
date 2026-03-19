import { configure, initiateHandshake, resetSession } from '@coinbase/wallet-mobile-sdk';

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
    const [, account] = await initiateHandshake([{ method: 'eth_requestAccounts', params: [] }]);
    const address = account?.address;
    if (!address) throw new Error('Coinbase 연결 실패: 계정을 가져올 수 없습니다');
    await secureKey.store(WALLET_KEY_ID, address);
    setSession(address, 'coinbase');
    return address;
  };

  const disconnectWallet = () => {
    resetSession();
    secureKey.delete(WALLET_KEY_ID);
    clearSession();
  };

  return { connectWallet, disconnectWallet };
}
