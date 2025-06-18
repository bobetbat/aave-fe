import { useMemo } from 'react';
import { ContentWithTooltip, ContentWithTooltipProps } from 'src/components/ContentWithTooltip';

import { useHints } from './hooks/useHints';

interface HintProps extends Omit<ContentWithTooltipProps, 'tooltipContent'> {
  hintId?: string;
}

export const Hint = ({ hintId, children, ...rest }: HintProps) => {
  const { hints } = useHints();

  const hint = useMemo(() => {
    if (hintId === undefined) return undefined;

    return hints?.find((hint) => hint.name === hintId);
  }, [hintId, hints]);

  if (!hint) return <>{children}</>;

  return (
    <ContentWithTooltip {...rest} tooltipContent={<>{hint?.description}</>}>
      {children}
    </ContentWithTooltip>
  );
};
