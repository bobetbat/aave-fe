import { BasicModal } from 'src/components/primitives/BasicModal';
import { ModalWrapper } from 'src/components/transactions/FlowCommons/ModalWrapper';
import { ModalContextType, ModalType, useModalContext } from 'src/hooks/useModal';

import { useCreditDelegationContext } from '../../CreditDelegationContext';
import { AtomicaDelegationPool } from '../../types';
import { ManageVaultModalContent } from './ManageVaultModalContent';

export const ManageVaultModal = () => {
  const { type, close, args } = useModalContext() as ModalContextType<{
    poolId: string;
  }>;
  const { pools } = useCreditDelegationContext();

  const pool = pools.find((pool) => pool.id === args.poolId) as AtomicaDelegationPool;

  return (
    <BasicModal open={type === ModalType.ManageVault} setOpen={close}>
      <ModalWrapper
        title={<>Withdraw</>}
        hideTitleSymbol
        underlyingAsset={pool?.capitalToken?.address || ''}
      >
        {(params) => <ManageVaultModalContent {...(pool as AtomicaDelegationPool)} {...params} />}
      </ModalWrapper>
    </BasicModal>
  );
};
