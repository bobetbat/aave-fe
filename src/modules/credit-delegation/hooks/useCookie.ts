import Cookies from 'js-cookie';
import { useCallback, useState } from 'react';

export const useCookie = (name: string, defaultValue?: string) => {
  const [value, setValue] = useState(() => {
    const cookie = Cookies.get(name);

    if (cookie) return cookie;

    if (!defaultValue) return null;

    Cookies.set(name, defaultValue);

    return defaultValue;
  });

  const updateCookie = useCallback(
    (newValue: string, options: Cookies.CookieAttributes) => {
      Cookies.set(name, newValue, options);
      setValue(newValue);
    },
    [name]
  );

  const deleteCookie = useCallback(() => {
    Cookies.remove(name);
    setValue(null);
  }, [name]);

  return [value, updateCookie, deleteCookie] as [string, typeof updateCookie, typeof deleteCookie];
};
