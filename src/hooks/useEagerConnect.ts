import { useEffect } from 'react';

import { ConnectorNames } from '@/utils/web3react';

import useAuth, { connectorLocalStorageKey } from './useAuth';

const _harmonyChainListner = async () =>
  new Promise<void>((resolve) =>
    Object.defineProperty(window, 'harmony', {
      get() {
        return this.bsc;
      },
      set(bsc) {
        this.bsc = bsc;

        resolve();
      },
    })
  );

const useEagerConnect = () => {
  console.log('useEagerConnect');
  const { login } = useAuth();

  useEffect(() => {
    const connectorId = window.localStorage.getItem(
      connectorLocalStorageKey
    ) as ConnectorNames;
    console.log(`connectorId found`, connectorId);
    if (connectorId) {
      console.log(`connectorId found`, connectorId);
      const isConnectorBinanceChain = connectorId === ConnectorNames.Metamask;
      const isBinanceChainDefined = Reflect.has(window, 'Onewallet');

      // Currently BSC extension doesn't always inject in time.
      // We must check to see if it exists, and if not, wait for it before proceeding.
      if (isConnectorBinanceChain && !isBinanceChainDefined) {
        _harmonyChainListner().then(() => login(connectorId));

        return;
      }

      login(connectorId);
    }
  }, [login]);
};

export default useEagerConnect;
