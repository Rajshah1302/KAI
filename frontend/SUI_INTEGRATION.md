# Sui Integration Guide

This document describes the complete Sui blockchain integration for the Kaivalya Data DAO frontend.

## Overview

The frontend is now fully integrated with Sui blockchain, including:
- **Wallet Integration**: Support for Suiet, Ethos, Sui Wallet, and other standard wallets
- **SuiNS Name Resolution**: ENS-like name resolution for Sui addresses
- **Smart Contract Interaction**: Complete integration with the DAO Move contract
- **Transaction Management**: Gas estimation, simulation, execution, and error handling
- **React Hooks**: Custom hooks for wallet and contract interactions

## Architecture

### File Structure

```
frontend/src/
├── lib/sui/
│   ├── config.ts          # Network configuration, RPC setup, constants
│   ├── suins.ts           # SuiNS name resolution utilities
│   ├── contract.ts        # Contract ABI types and transaction builders
│   └── transactions.ts    # Transaction utilities (gas, simulation, execution)
├── providers/
│   └── sui-wallet-provider.tsx  # Wallet provider wrapper
├── hooks/
│   ├── use-sui-wallet.ts  # Wallet connection hooks
│   └── use-dao.ts         # DAO contract interaction hooks
└── components/wallet/
    └── wallet-connect-button.tsx  # Wallet UI component
```

## Setup

### 1. Install Dependencies

```bash
cd frontend
npm install
```

This will install:
- `@mysten/dapp-kit` - Main Sui dApp kit
- `@mysten/sui.js` - Sui JavaScript SDK
- `@mysten/wallet-kit` - Wallet adapter
- `@tanstack/react-query` - Data fetching (used by dapp-kit)

### 2. Configure Environment Variables

Copy `.env.example` to `.env.local` and fill in your contract addresses:

```bash
cp .env.example .env.local
```

Required variables:
```env
NEXT_PUBLIC_SUI_NETWORK=testnet
NEXT_PUBLIC_SUI_PACKAGE_ID=0x...  # Your deployed package ID
NEXT_PUBLIC_SUI_DATA_DAO_ID=0x...  # Shared DataDAO object ID
NEXT_PUBLIC_SUI_MARKETPLACE_ID=0x...  # Shared Marketplace object ID
```

### 3. Deploy Contracts

Before using the frontend, deploy your Move contracts:

```bash
cd smart-contracts
sui move build
sui client publish --gas-budget 100000000
```

Update the `.env.local` file with the deployed addresses.

## Usage

### Wallet Connection

The wallet provider is automatically set up in `app/layout.tsx`. Users can connect their wallet using:

1. **Header Button**: Click the "Connect Wallet" button in the header
2. **Wallet Connect Page**: Navigate to `/auth/wallet-connect`

The system supports:
- Suiet Wallet
- Ethos Wallet
- Sui Wallet
- Any wallet that implements the Wallet Standard

### SuiNS Name Resolution

SuiNS names are automatically resolved and displayed:

```tsx
import { useSuiWallet } from '@/hooks/use-sui-wallet';

function MyComponent() {
  const { address, displayName } = useSuiWallet();
  // displayName will be the SuiNS name if available, or null
}
```

### Contract Interactions

Use the provided hooks to interact with the DAO contract:

```tsx
import { useDao, useAccountCap, usePurchaseKai } from '@/hooks/use-dao';

function MyComponent() {
  const { dao, isLoading } = useDao();
  const { accountCap } = useAccountCap();
  const { purchaseKai, isLoading: isPurchasing } = usePurchaseKai();

  const handlePurchase = async () => {
    await purchaseKai('1.0'); // Purchase with 1 SUI
  };

  return (
    <div>
      <p>Treasury: {dao?.treasury}</p>
      <p>KAI Balance: {accountCap?.kaiBalance}</p>
      <button onClick={handlePurchase} disabled={isPurchasing}>
        Purchase KAI
      </button>
    </div>
  );
}
```

### Available Hooks

#### Wallet Hooks (`use-sui-wallet.ts`)
- `useSuiWallet()` - Get current wallet state with SuiNS resolution
- `useAvailableWallets()` - Get list of installed/available wallets
- `useSuiNSName(address)` - Resolve address to SuiNS name
- `useFormattedAddress(address)` - Format address with SuiNS fallback

#### DAO Hooks (`use-dao.ts`)
- `useDao(daoId?)` - Get DAO state
- `useAccountCap(daoId?)` - Get user's AccountCap
- `useProposals(daoId?, limit?)` - Get proposals list
- `usePurchaseKai()` - Purchase KAI tokens
- `useVote()` - Vote on proposals
- `useSubmitData()` - Submit data to DAO
- `useProposeCategory()` - Create category proposal

### Transaction Execution

Transactions are automatically handled with:
- **Gas Estimation**: Automatic gas estimation before execution
- **Simulation**: Optional transaction simulation before broadcast
- **Error Handling**: User-friendly error messages
- **Toast Notifications**: Progress and completion feedback

```tsx
import { buildPurchaseKaiTx } from '@/lib/sui/contract';
import { executeTransactionWithFeedback } from '@/lib/sui/transactions';
import { TransactionBlock } from '@mysten/sui.js/transactions';

const txb = new TransactionBlock();
buildPurchaseKaiTx(txb, daoId, '1.0');

const result = await executeTransactionWithFeedback(
  txb,
  wallet.currentWallet,
  {
    simulate: true, // Simulate before executing
    toast: toast, // Show toast notifications
    onSuccess: (result) => {
      console.log('Transaction successful:', result.digest);
    },
  }
);
```

## Contract Functions

All contract functions are available as transaction builders:

### Token Operations
- `buildPurchaseKaiTx()` - Purchase KAI with SUI
- `buildAddKaiTx()` - Add more KAI to existing account
- `buildBurnKaiTx()` - Burn KAI to redeem SUI

### Governance
- `buildProposeCategoryTx()` - Create category proposal
- `buildVoteTx()` - Vote on proposal
- `buildProposePriceTx()` - Propose price for submission

### Data Submission
- `buildSubmitDataTx()` - Submit data to DAO
- `buildPurchaseDataTx()` - Purchase data from marketplace

### Proposal Execution
- `buildExecuteCategoryProposalTx()` - Execute category proposal
- `buildExecuteDataProposalTx()` - Execute data approval proposal
- `buildExecutePriceProposalTx()` - Execute price proposal

## Network Configuration

Networks are configured in `lib/sui/config.ts`:

- **Mainnet**: Production network
- **Testnet**: Testing network (default)
- **Devnet**: Development network
- **Localnet**: Local Sui node

Switch networks by updating `NEXT_PUBLIC_SUI_NETWORK` in `.env.local`.

## SuiNS Integration

SuiNS (Sui Name Service) provides ENS-like name resolution:

1. **Automatic Resolution**: Addresses are automatically resolved to names
2. **Caching**: Resolved names are cached for 5 minutes
3. **API Fallback**: Uses SuiNS API with on-chain fallback
4. **Display**: Names are shown in UI when available

The SuiNS registry addresses are configured per network in `config.ts`.

## Error Handling

All transaction errors are automatically parsed and converted to user-friendly messages:

- Insufficient gas
- Insufficient balance
- Already voted
- Voting ended
- Contract-specific errors

Errors are displayed via toast notifications and can be handled in callbacks.

## Best Practices

1. **Always Simulate**: Enable simulation before executing important transactions
2. **Check Wallet Connection**: Verify wallet is connected before transactions
3. **Handle Loading States**: Use `isLoading` from hooks to show loading UI
4. **Error Boundaries**: Wrap components in error boundaries for production
5. **Cache Management**: SuiNS names are cached automatically; clear cache if needed

## Troubleshooting

### Wallet Not Connecting
- Ensure wallet extension is installed
- Check browser console for errors
- Try refreshing the page

### Transactions Failing
- Check gas balance in wallet
- Verify contract addresses are correct
- Check network matches wallet network

### SuiNS Names Not Resolving
- Names may not exist for the address
- Check network configuration
- Clear cache: `clearSuiNSCache()` from `lib/sui/suins.ts`

## Next Steps

1. Deploy contracts to testnet/mainnet
2. Update `.env.local` with deployed addresses
3. Test all contract interactions
4. Customize UI components as needed
5. Add additional features using the provided hooks

For more information, see:
- [Sui Documentation](https://docs.sui.io/)
- [dApp Kit Documentation](https://github.com/MystenLabs/sui/tree/main/sdk/dapp-kit)
- [Wallet Standard](https://github.com/MystenLabs/sui/tree/main/sdk/wallet-standard)

