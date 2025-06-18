import { MutableRefObject } from 'react';

const refMap: Record<string, MutableRefObject<unknown>> = {};

const createRef = <T>(name: string, initialValue: T): MutableRefObject<T> => {
  refMap[name] = {
    current: initialValue,
  };

  return refMap[name] as MutableRefObject<T>;
};

export const useGlobalRef = <T>(name: string, initialValue: T) => {
  if (refMap[name]) {
    return refMap[name] as MutableRefObject<T>;
  }

  return createRef<T>(name, initialValue);
};
