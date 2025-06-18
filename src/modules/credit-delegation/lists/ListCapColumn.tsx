import { Box, Link, Tooltip, Typography } from '@mui/material';
import { ReactNode } from 'react';
import { ListColumn, ListColumnProps } from 'src/components/lists/ListColumn';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';

import { SheetPoolStatus } from '../hooks/usePoolSheetConfig';

interface ListCapColumnProps extends ListColumnProps {
  symbol?: string;
  value: string | number;
  capacity?: string | number;
  subValue?: string | number;
  subCapacity?: string | number;
  withTooltip?: boolean;
  capsComponent?: ReactNode;
  disabled?: boolean;
  unlimited?: boolean;
  status?: SheetPoolStatus;
  contactUrl?: string;
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
        <FormattedNumber
          value={value}
          symbol={symbol}
          variant="secondary14"
          sx={{ mb: !withTooltip && !!subValue ? '2px' : 0 }}
          color={disabled ? 'text.disabled' : 'text.main'}
          data-cy={`nativeAmount`}
        />
        {capsComponent}
      </Box>

      {!withTooltip && !!subValue && !disabled && (
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

export const ListCapColumn = ({
  symbol,
  value,
  subValue,
  capacity,
  subCapacity,
  unlimited,
  withTooltip,
  capsComponent,
  disabled,
  status,
  contactUrl,
  ...rest
}: ListCapColumnProps) => {
  return (
    <ListColumn {...rest}>
      <Box display="flex" flexDirection="column" alignItems="center" gap={1}>
        {status !== SheetPoolStatus.REPAID && status !== SheetPoolStatus.SOLD_OUT && (
          <>
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
                    <Box>
                      <FormattedNumber
                        value={subCapacity || 0}
                        symbol="USD"
                        variant="secondary14"
                        sx={{ mb: '2px' }}
                        symbolsColor="common.white"
                        compact={false}
                      />
                    </Box>
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
                      value={capacity ?? '-'}
                      subValue={subCapacity}
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
                value={capacity ?? '-'}
                subValue={subValue}
                capsComponent={capsComponent}
                disabled={disabled}
                withTooltip={withTooltip}
              />
            )}
          </>
        )}

        {status === SheetPoolStatus.SOLD_OUT && (
          <>
            <Typography variant="secondary14" sx={{ textAlign: 'center', mt: 1 }} fontWeight={700}>
              {status}
            </Typography>
            <Link
              href={contactUrl}
              target="_blank"
              fontSize={12}
              color="#5b83fa"
              sx={{
                textDecoration: 'none',
              }}
            >
              Notify me
            </Link>
          </>
        )}

        {status === SheetPoolStatus.REPAID && (
          <>
            <Typography variant="secondary14" sx={{ textAlign: 'center', mt: 1 }} fontWeight={700}>
              {status}
            </Typography>
          </>
        )}
      </Box>
    </ListColumn>
  );
};
