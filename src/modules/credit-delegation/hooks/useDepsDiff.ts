import { useEffect, useRef } from 'react';

export const useDepsDiff = (deps: Record<string, unknown>) => {
  const prevDeps = useRef<Record<string, unknown>>({});

  useEffect(() => {
    const keys = Object.keys(deps);
    const changes = keys.reduce((acc, key) => {
      if (deps[key] !== prevDeps.current[key]) {
        acc[key] = deps[key];
      }
      return acc;
    }, {} as Record<string, unknown>);

    if (Object.keys(changes).length) {
      console.log({
        changes: Object.keys(changes).reduce((acc, key) => {
          acc[key] = {
            prev: prevDeps.current[key],
            next: deps[key],
          };
          return acc;
        }, {} as Record<string, unknown>),
      });
    }

    prevDeps.current = deps;
  }, [deps]);
};
