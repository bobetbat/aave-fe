import React from 'react';
import { BasicModal } from 'src/components/primitives/BasicModal';
import { ModalWrapper } from 'src/components/transactions/FlowCommons/ModalWrapper';
import { ModalContextType, ModalType, useModalContext } from 'src/hooks/useModal';

import { CreditDelegationModalContent } from './CreditDelegationModalContent';

export const CreditDelegationModal = () => {
  const { type, close, args } = useModalContext() as ModalContextType<{
    poolId: string;
    underlyingAsset: string;
  }>;

  return (
    <BasicModal open={type === ModalType.CreditDelegation} setOpen={close}>
      <ModalWrapper
        title={<>Lend to pool</>}
        underlyingAsset={args.underlyingAsset}
        hideTitleSymbol
      >
        {(params) => <CreditDelegationModalContent {...params} poolId={args.poolId} />}
      </ModalWrapper>
    </BasicModal>
  );
};
