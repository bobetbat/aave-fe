import { Tooltip, Typography } from '@mui/material';
import { ReactNode } from 'react';

import { ListColumn } from '../../../components/lists/ListColumn';
import { ListItem } from '../../../components/lists/ListItem';
import { TokenIcon } from '../../../components/primitives/TokenIcon';
import { DASHBOARD_LIST_COLUMN_WIDTHS } from '../consts';

interface ListItemWrapperProps {
  symbol: string;
  iconSymbol: string;
  name: string;
  children: ReactNode;
  frozen?: boolean;
}

export const ListItemWrapper = ({
  symbol,
  iconSymbol,
  children,
  name,
  frozen,
  ...rest
}: ListItemWrapperProps) => {
  const currentSymbol = symbol;
  const currentIconSymbol = iconSymbol;
  const currentName = name;

  return (
    <ListItem {...rest}>
      <ListColumn maxWidth={DASHBOARD_LIST_COLUMN_WIDTHS.CELL} isRow>
        <TokenIcon symbol={currentIconSymbol} fontSize="large" />
        <Tooltip title={`${currentName} (${currentSymbol})`} arrow placement="top">
          <Typography variant="subheader1" sx={{ ml: 3 }} noWrap data-cy={`assetName`}>
            {currentSymbol}
          </Typography>
        </Tooltip>
      </ListColumn>
      {children}
    </ListItem>
  );
};
