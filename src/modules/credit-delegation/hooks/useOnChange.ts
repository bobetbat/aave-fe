import { useEffect, useRef } from 'react';

export const useOnChange = <T extends string | number | boolean | undefined | null>(
  value: T,
  onChange: (value: T) => void
) => {
  const prevValue = useRef(value);

  useEffect(() => {
    if (prevValue.current !== value) {
      onChange(value);
      prevValue.current = value;
    }
  }, [value, onChange]);
};
