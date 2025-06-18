import { Box, Typography } from '@mui/material';
import { ConnectWalletPaper } from 'src/components/ConnectWalletPaper';
import { ContentContainer } from 'src/components/ContentContainer';
import StyledToggleButton from 'src/components/StyledToggleButton';
import StyledToggleButtonGroup from 'src/components/StyledToggleButtonGroup';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';

import { Tabs, useCreditDelegationContext } from './CreditDelegationContext';
import { CreditDelegationTopPanel } from './CreditDelegationTopPanel';
import { useAdminAccess } from './hooks/useAdminAccess';
import { AssetsToBorrowList } from './lists/AssetsToBorrow/AssetsToBorrowList';
import { AssetsToLendList } from './lists/AssetsToLend/AssetsToLendList';
import { LendingPositionsList } from './lists/LendingPositionsList/LendingPositionsList';
import { LoansList } from './lists/LoansList/LoansList';
import { MarketsList } from './lists/MarketsList/MarketsList';
import { PoolsList } from './lists/PoolsList/PoolsList';
import { ApproveLoanModal } from './modals/ApproveLoan/ApproveLoanModal';
import { CreditDelegationModal } from './modals/CreditDelegation/CreditDelegationModal';
import { LoanApplicationModal } from './modals/LoanApplication/LoanApplicationModal';
import { RepayLoanModal } from './modals/RepayLoan/RepayLoanModal';
import { ManageVaultModal } from './modals/WithdrawPool/ManageVaultModal';

export const CreditDelegationContent = () => {
  const { currentAccount } = useWeb3Context();

  const { activeTab, setActiveTab } = useCreditDelegationContext();
  const isAdmin = useAdminAccess();
  return (
    <ContentContainer>
      <Box
        sx={{
          justifyContent: 'space-between',
          alignItems: 'center',
          display: 'flex',
          flexWrap: {
            xs: 'wrap',
            md: 'nowrap',
          },
          mt: { xs: '16px', md: '48px', lg: '62px', xl: '60px', xxl: '64px' },
          overflow: 'hidden',
        }}
      >
        <StyledToggleButtonGroup
          color="primary"
          value={activeTab}
          exclusive
          onChange={(_, value) => setActiveTab(value)}
          sx={{
            minWidth: { xs: '100%', md: 'unset' },
            mb: { xs: 4, md: 0 },
            overflowX: 'auto',
          }}
        >
          <StyledToggleButton value="overview" disabled={activeTab === Tabs.OVERVIEW}>
            <Typography variant="subheader1">Overview</Typography>
          </StyledToggleButton>
          <StyledToggleButton value="delegate" disabled={activeTab === Tabs.DELEGATE}>
            <Typography variant="subheader1">Lend</Typography>
          </StyledToggleButton>
          <StyledToggleButton value="borrow" disabled={activeTab === Tabs.BORROW}>
            <Typography variant="subheader1">Borrow</Typography>
          </StyledToggleButton>
          <StyledToggleButton value="portfolio" disabled={activeTab === Tabs.PORTFOLIO}>
            <Typography variant="subheader1">Portfolio</Typography>
          </StyledToggleButton>
          {isAdmin && (
            <StyledToggleButton value="admin" disabled={activeTab === Tabs.ADMIN}>
              <Typography variant="subheader1">Admin</Typography>
            </StyledToggleButton>
          )}
        </StyledToggleButtonGroup>
      </Box>

      <Box
        sx={{
          display: 'block',
          maxWidth: '100%',
          overflow: 'hidden',
        }}
      >
        {activeTab === Tabs.OVERVIEW && (
          <Box>
            <CreditDelegationTopPanel />
            <Box
              sx={{
                display: 'flex',
                alignItems: {
                  xs: 'stretch',
                  lg: 'flex-start',
                },
                justifyContent: 'stretch',
                gap: '16px',
                width: '100%',
                flexWrap: {
                  xs: 'wrap',
                  lg: 'nowrap',
                },
              }}
            >
              <AssetsToLendList />
              <AssetsToBorrowList />
            </Box>
          </Box>
        )}
        {activeTab === Tabs.DELEGATE && (
          <Box>
            <PoolsList />
          </Box>
        )}

        {activeTab === Tabs.BORROW && (
          <Box>
            <MarketsList />
          </Box>
        )}

        {activeTab === Tabs.PORTFOLIO &&
          (currentAccount ? (
            <Box>
              <LendingPositionsList type="non-earning" />
              <LendingPositionsList type="earning" />
              <LoansList />
            </Box>
          ) : (
            <ConnectWalletPaper />
          ))}
        {activeTab === Tabs.ADMIN &&
          (currentAccount ? (
            <Box>
              <LoansList admin />
            </Box>
          ) : (
            <ConnectWalletPaper />
          ))}
      </Box>
      <LoanApplicationModal />
      <CreditDelegationModal />
      <ApproveLoanModal />
      <RepayLoanModal />
      <ManageVaultModal />
    </ContentContainer>
  );
};
