import { ChainId } from '@aave/contract-helpers';

import { NetworkConstConfig } from './types';

export const STAGING_ENV = process.env.NEXT_PUBLIC_ENV === 'staging';
export const PROD_ENV = !process.env.NEXT_PUBLIC_ENV || process.env.NEXT_PUBLIC_ENV === 'prod';
export const ENABLE_TESTNET =
  PROD_ENV && global?.window?.localStorage.getItem('testnetsEnabled') === 'true';

export const networkConfig: Record<number, NetworkConstConfig> = {
  [ChainId.arbitrum_one]: {
    atomicaApiUrl: `${process.env.NEXT_PUBLIC_ATOMICA_API_URL}`,
    poolsSubgraphUrl: `${process.env.NEXT_PUBLIC_ATOMICA_API_URL}/v1/deployments/prod-arbitrum-v2/poolsV2/graph`,
    marketsSubgraphUrl: `${process.env.NEXT_PUBLIC_ATOMICA_API_URL}/v1/deployments/prod-arbitrum-v2/marketsV2/graph`,
    vaultsSubgraphUrl: '',
    defaultCapitalToken: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
    baseTokenAddress: '0x82af49447d8a07e3bd95bd0d56f35241523fbab1',
    baseAssetSymbol: 'ETH',
  },

  [ChainId.sepolia]: {
    atomicaApiUrl: `${process.env.NEXT_PUBLIC_ATOMICA_DEV_API_URL}`,
    poolsSubgraphUrl: `${process.env.NEXT_PUBLIC_ATOMICA_DEV_API_URL}/v1/deployments/dev-sepolia-v2/poolsV2/graph`,
    marketsSubgraphUrl: `${process.env.NEXT_PUBLIC_ATOMICA_DEV_API_URL}/v1/deployments/dev-sepolia-v2/marketsV2/graph`,
    vaultsSubgraphUrl:
      'https://api.studio.thegraph.com/query/46833/credit-arena-sepolia-vaults/version/latest',
    defaultCapitalToken: '0x7647562C86172fA2F7462Ac5A69A0555Dbc4762A',
    baseTokenAddress: '0xdd13E55209Fd76AfE204dBda4007C227904f0a81',
    baseAssetSymbol: 'ETH',
  },

  //  [somniaTestnet.id]: {
  //   atomicaApiUrl: `${process.env.NEXT_PUBLIC_ATOMICA_DEV_API_URL}`,
  //   poolsSubgraphUrl: `${process.env.NEXT_PUBLIC_ATOMICA_DEV_API_URL}/v1/deployments/dev-somnia-v2/poolsV2/graph`,
  //   marketsSubgraphUrl: `${process.env.NEXT_PUBLIC_ATOMICA_DEV_API_URL}/v1/deployments/dev-somnia-v2/marketsV2/graph`,
  //   vaultsSubgraphUrl: '0x',
  //   defaultCapitalToken: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
  //   baseTokenAddress: '0x82af49447d8a07e3bd95bd0d56f35241523fbab1',
  //   baseAssetSymbol: 'ETH',
  // },
};

export const NEXT_PUBLIC_ZAPPER_API_KEY = `${process.env.NEXT_PUBLIC_ZAPPER_API_KEY}`;

export const MAX_UINT256 = '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';
export const DEFAULT_LOGO = 'https://etherscan.io/images/main/empty-token.png';
export const WEI_DECIMALS = 18;

export const POLLING_INTERVAL = 5 * 60 * 1000;

export const TIME_INTERVALS_IN_SEC = {
  year: 2592000 * 12,
  month: 2592000,
  week: 7 * 86400,
  day: 86400,
  hour: 3600,
  minute: 60,
};

export const DASHBOARD_LIST_COLUMN_WIDTHS = {
  ASSET: 110,
  BUTTONS: 160,
  CELL: 110,
};
