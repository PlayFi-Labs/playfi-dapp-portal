import { fallback, http } from "@wagmi/core";
import { zkSync, type Chain, zkSyncSepoliaTestnet, zkSyncTestnet } from "@wagmi/core/chains";
import { defaultWagmiConfig } from "@web3modal/wagmi";

import { chainList, type ZkSyncNetwork } from "@/data/networks";

const metadata = {
  name: "LIFT Portal",
  description: "LIFT Portal - view balances, transfer and bridge tokens",
  url: process.env.APP_DOMAIN || "",
  icons: [`${process.env.APP_DOMAIN || ""}/icon.svg`],
};

if (!process.env.WALLET_CONNECT_PROJECT_ID) {
  throw new Error("WALLET_CONNECT_PROJECT_ID is not set. Please set it in .env file");
}

const useExistingEraChain = (network: ZkSyncNetwork) => {
  const existingNetworks = [zkSync, zkSyncSepoliaTestnet, zkSyncTestnet];
  return existingNetworks.find((existingNetwork) => existingNetwork.id === network.id);
};
const createEraChain = (network: ZkSyncNetwork) => {
  return {
    id: network.id,
    name: network.name,
    network: network.key,
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    rpcUrls: {
      default: { http: [network.rpcUrl] },
      public: { http: [network.rpcUrl] },
    },
  };
};
const getAllChains = () => {
  const chains: Chain[] = [];
  const addUniqueChain = (chain: Chain) => {
    if (!chains.some((existingChain) => existingChain.id === chain.id)) {
      chains.push(chain);
    }
  };
  for (const network of chainList) {
    if (network.l1Network) {
      addUniqueChain(network.l1Network);
    }
    addUniqueChain(useExistingEraChain(network) ?? createEraChain(network));
  }

  return chains;
};

const chains = getAllChains();
export const wagmiConfig = defaultWagmiConfig({
  chains: getAllChains() as any,
  transports: Object.fromEntries(
    chains.map((chain) => [chain.id, fallback(chain.rpcUrls.default.http.map((e) => http(e)))])
  ),
  projectId: process.env.WALLET_CONNECT_PROJECT_ID,
  metadata,
  enableCoinbase: false,
});
