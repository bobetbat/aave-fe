import { ApolloClient, ApolloLink, HttpLink, InMemoryCache } from '@apollo/client';
// import { networkConfig } from './consts';
import { marketsData } from 'src/ui-config/marketsConfig';

export enum ClientName {
  Pools = 'pools',
  Markets = 'markets',
  Vaults = 'vaults',
}

/**
 * Build subgraphLinksMap by iterating over networkConfig dynamically.
 */
const subgraphLinksMap: {
  [chainId: number]: Partial<Record<ClientName, HttpLink>>;
} = Object.values(marketsData).reduce((acc, config) => {
  const chainId = Number(config.chainId);

  if (!config.secondaryMarket) {
    return acc; // skip if secondaryMarket is not defined
  }

  acc[chainId] = {
    [ClientName.Pools]: new HttpLink({ uri: config.secondaryMarket.poolsSubgraphUrl }),
    [ClientName.Markets]: new HttpLink({ uri: config.secondaryMarket.marketsSubgraphUrl }),
    [ClientName.Vaults]: new HttpLink({ uri: config.secondaryMarket.vaultsSubgraphUrl }),
  };

  return acc;
}, {} as { [chainId: number]: Partial<Record<ClientName, HttpLink>> });

/**
 * Custom ApolloLink that picks the right subgraph link based on:
 * - chainId from the store
 * - clientName from operation context
 */
const multiNetworkLink = new ApolloLink((operation, forward) => {
  const { clientName, chainId } = operation.getContext() as {
    clientName?: ClientName;
    chainId: number;
  };
  const safeClientName = clientName ?? ClientName.Markets;

  // Pick the required HttpLink
  const link = subgraphLinksMap[chainId]?.[safeClientName];
  if (!link) {
    return null;
    // throw new Error(
    //   `No subgraph link found for chainId=${chainId} and clientName=${safeClientName}`
    // );
  }

  return link.request(operation, forward);
});

export const client = new ApolloClient({
  link: multiNetworkLink,
  cache: new InMemoryCache(),
});
