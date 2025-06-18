import { Box, Tooltip, Typography } from '@mui/material';
import { ReactNode } from 'react';
import { ListColumn, ListColumnProps } from 'src/components/lists/ListColumn';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';

import { SheetPoolStatus } from '../hooks/usePoolSheetConfig';

interface ListCapColumnProps extends ListColumnProps {
  symbol?: string;
  value: string | number;
  subValue?: string | number;
  withTooltip?: boolean;
  capsComponent?: ReactNode;
  disabled?: boolean;
  unlimited?: boolean;
  status?: SheetPoolStatus;
}

const Content = ({
  value,
  withTooltip,
  subValue,
  disabled,
  capsComponent,
  symbol,
}: ListCapColumnProps) => {
  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        {value === 0 ? (
          <Typography variant="secondary14">UNLIMITED</Typography>
        ) : (
          <FormattedNumber
            value={value}
            symbol={symbol}
            variant="secondary14"
            sx={{ mb: !withTooltip && !!subValue ? '2px' : 0 }}
            color={disabled ? 'text.disabled' : 'text.main'}
            data-cy={`nativeAmount`}
          />
        )}
        {capsComponent}
      </Box>

      {!withTooltip && !!subValue && !disabled && value !== 0 && (
        <FormattedNumber
          value={subValue}
          symbol="USD"
          variant="secondary12"
          color="text.secondary"
        />
      )}
    </>
  );
};

export const ListCapitalRequirementColumn = ({
  symbol,
  value,
  subValue,
  unlimited,
  withTooltip,
  capsComponent,
  disabled,
  status,
  ...rest
}: ListCapColumnProps) => {
  return (
    <ListColumn {...rest}>
      <Box display="flex" flexDirection="column" alignItems="center" gap={1}>
        {withTooltip ? (
          <Tooltip
            title={
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {value !== 0 ? (
                  <FormattedNumber
                    value={subValue || 0}
                    symbol="USD"
                    variant="secondary14"
                    sx={{ mb: '2px' }}
                    symbolsColor="common.white"
                    compact={false}
                  />
                ) : (
                  <Typography variant="secondary14">UNLIMITED</Typography>
                )}
              </Box>
            }
            arrow
            placement="top"
          >
            <Box>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Content
                  symbol={symbol}
                  value={value}
                  subValue={subValue}
                  disabled={disabled}
                  withTooltip={withTooltip}
                  capsComponent={capsComponent}
                />
              </Box>
            </Box>
          </Tooltip>
        ) : (
          <Content
            symbol={symbol}
            value={value}
            subValue={subValue}
            capsComponent={capsComponent}
            disabled={disabled}
            withTooltip={withTooltip}
          />
        )}
      </Box>
    </ListColumn>
  );
};
