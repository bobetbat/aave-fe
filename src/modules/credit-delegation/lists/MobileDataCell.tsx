import { Box, Typography } from '@mui/material';
import { FC } from 'react';
import { FormattedNumber, FormattedNumberProps } from 'src/components/primitives/FormattedNumber';

import { Hint } from '../Hint';

type MobileDataCellProps = {
  caption: React.ReactNode;
  hintId?: string;
  valueProps?: Omit<FormattedNumberProps, 'value'>;
} & (
  | {
      left?: true;
      right?: never;
    }
  | {
      left?: never;
      right?: never;
    }
  | {
      left?: never;
      right?: true;
    }
) &
  (
    | {
        value: string | number;
        subValue?: string | number;
        children?: never;
      }
    | {
        value?: never;
        subValue?: never;
        children: React.ReactNode;
      }
  );

export const MobileDataCell: FC<MobileDataCellProps> = ({
  caption,
  value,
  subValue,
  hintId,
  children,
  left,
  right,
  valueProps,
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: left ? 'flex-start' : right ? 'flex-end' : 'center',
      }}
    >
      <Hint hintId={hintId}>
        <Typography
          variant="subheader1"
          color="text.secondary"
          sx={{
            mb: 1,
            borderBottom: (theme) =>
              hintId !== undefined ? `1px dashed ${theme.palette.text.secondary}` : 'none',
          }}
          noWrap
        >
          {caption}
        </Typography>
      </Hint>

      {children !== undefined ? (
        <Typography align={left ? 'left' : right ? 'right' : 'center'}>{children}</Typography>
      ) : (
        value !== undefined &&
        (value === 'UNLIMITED' ? (
          <Typography variant="secondary14">UNLIMITED</Typography>
        ) : (
          <>
            <FormattedNumber
              value={value}
              variant="secondary14"
              color="text.primary"
              {...valueProps}
            />
            {subValue !== undefined && (
              <FormattedNumber
                value={subValue}
                symbol="USD"
                variant="secondary12"
                color="text.subtle"
              />
            )}
          </>
        ))
      )}
    </Box>
  );
};
