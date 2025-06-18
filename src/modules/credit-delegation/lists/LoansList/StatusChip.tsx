import { Chip } from '@mui/material';
import { FC } from 'react';

import { LoanStatus } from '../../types';

interface StatusProps {
  status: LoanStatus;
}

const getChipColor = (status: LoanStatus) => {
  switch (status) {
    case LoanStatus.Active:
      return 'success';
    case LoanStatus.Pending:
      return 'warning';
    case LoanStatus.Declined:
      return 'error';
  }
};

export const StatusChip: FC<StatusProps> = ({ status }) => {
  return <Chip label={status} color={getChipColor(status)} />;
};
