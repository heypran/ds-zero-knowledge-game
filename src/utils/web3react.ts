import { InjectedConnector } from "@web3-react/injected-connector";
import Web3 from "web3";

// const POLLING_INTERVAL = 12000
// const rpcUrl = getNodeUrl()
// https://docs.harmony.one/home/network/wallets/browser-extensions-wallets/metamask-wallet
export const chainId = Number(1666700000);
//`0x${Number(chainId + 2)}`.toString(16
const injected = new InjectedConnector({ supportedChainIds: [chainId] });
export enum ConnectorNames {
  Metamask = "metamask",
}

export const connectorsByName: { [connectorName in ConnectorNames]: any } = {
  [ConnectorNames.Metamask]: injected,
};

export const getLibrary = (provider: any): Web3 => {
  return provider;
};
