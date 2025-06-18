import { useEffect, useState } from 'react';

import { useConfig } from '../../config/ConfigContext';
import { AtomicaSubgraphMarketEntity, AtomicaSubgraphProductEntity } from '../../types';

export const useEntities = () => {
  const [config, setConfig] = useState<AtomicaSubgraphMarketEntity[]>();
  const [entites, setEntities] = useState<AtomicaSubgraphProductEntity[]>();
  const { atomicaApiUrl } = useConfig();

  useEffect(() => {
    (async function () {
      if (!atomicaApiUrl) return;
      const url = `${atomicaApiUrl}/v1/deployments/all/products/all/entity/`;

      try {
        const response = await fetch(url);

        if (response.ok) {
          const json: AtomicaSubgraphProductEntity[] = await response.json();

          setEntities(json);
        }
      } catch {}
    })();
  }, [atomicaApiUrl]);

  useEffect(() => {
    (async function () {
      if (!atomicaApiUrl) return;
      const url = `${atomicaApiUrl}/v1/product/config/all/MarketEntities`;

      try {
        const response = await fetch(url);

        if (response.ok) {
          const json = await response.json();

          setConfig(
            json.map((item: { Config: string }) => ({ ...item, Config: JSON.parse(item.Config) }))
          );
        }
      } catch {}
    })();
  }, [atomicaApiUrl]);

  return [entites, config] as [
    AtomicaSubgraphProductEntity[] | undefined,
    AtomicaSubgraphMarketEntity[] | undefined
  ];
};
