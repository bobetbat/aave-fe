import React from 'react';
import { BasicModal } from 'src/components/primitives/BasicModal';
import { ModalWrapper } from 'src/components/transactions/FlowCommons/ModalWrapper';
import { ModalContextType, ModalType, useModalContext } from 'src/hooks/useModal';

import { AtomicaBorrowMarket } from '../../types';
import { LoanApplicationModalContent } from './LoanApplicationModalContent';

export const LoanApplicationModal = () => {
  const { type, close, mainTxState, args } = useModalContext() as ModalContextType<{
    market?: AtomicaBorrowMarket;
  }>;

  return (
    <BasicModal
      open={type === ModalType.LoanApplication}
      setOpen={close}
      contentMaxWidth={mainTxState.success ? undefined : 704}
    >
      <ModalWrapper
        title={<>Apply and request loan</>}
        underlyingAsset={args.market?.asset?.address ?? ''}
        hideTitleSymbol
      >
        {(params) => <LoanApplicationModalContent {...params} market={args.market} />}
      </ModalWrapper>
    </BasicModal>
  );
};
