import { BasicModal } from 'src/components/primitives/BasicModal';
import { ModalWrapper } from 'src/components/transactions/FlowCommons/ModalWrapper';
import { ModalContextType, ModalType, useModalContext } from 'src/hooks/useModal';

import { AtomicaLoan } from '../../types';
import { ApproveLoanModalContent } from './ApproveLoanModalContent';

export const ApproveLoanModal = () => {
  const { type, close, args } = useModalContext() as ModalContextType<{
    loan: AtomicaLoan;
  }>;

  return (
    <BasicModal open={type === ModalType.ApproveLoan} setOpen={close}>
      <ModalWrapper
        title={<>Approve loan</>}
        hideTitleSymbol
        underlyingAsset={args.loan?.premiumAsset?.address || ''}
      >
        {(params) => <ApproveLoanModalContent {...args.loan} {...params} />}
      </ModalWrapper>
    </BasicModal>
  );
};
