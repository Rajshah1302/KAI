# Kaivalya Data DAO - Complete Usage Guide

Complete guide for using the deployed Kaivalya Data DAO application.

## Prerequisites

1. **Wallet Setup**
   - Install a Sui wallet (Suiet, Ethos, or Sui Wallet)
   - Fund your wallet with SUI tokens
   - Connect wallet to the application

2. **Network Configuration**
   - Ensure frontend is configured for correct network (testnet/mainnet)
   - Verify contract addresses in `.env.local`

## Getting Started

### 1. Connect Your Wallet

1. Click "Connect Wallet" button in the header
2. Select your installed wallet
3. Approve connection request
4. Your wallet address will appear once connected

### 2. Purchase KAI Tokens (Optional but Recommended)

KAI tokens are needed for:
- Creating proposals
- Voting on proposals
- Participating in governance

**Steps:**
1. Navigate to Finance page (or tokenomics page)
2. Enter amount of SUI to spend
3. Click "Purchase KAI"
4. Approve transaction in wallet
5. You'll receive an AccountCap with KAI balance

**Note**: 1 SUI = 1000 KAI (default rate)

## Using the Application

### Phase 1: Create a Category Proposal

Before submitting data, a category must exist.

**Steps:**
1. Navigate to **Governance** → **Create Proposal**
2. Select "Category Creation"
3. Fill in:
   - Category Name (e.g., "Healthcare Data")
   - Description
   - Reward Amount (KAI to reward contributors)
4. Click "Create Proposal"
5. Wait for DAO members to vote
6. After voting period ends, execute the proposal

**Requirements:**
- Must have AccountCap with KAI balance
- Proposal needs 30% quorum and 70% approval

### Phase 2: Submit Data

Once a category exists, anyone can submit data.

**Steps:**
1. Navigate to **Contribute** → **Upload**
2. Fill in dataset details:
   - **Dataset Name**: Descriptive name
   - **Description**: Detailed description
   - **Category**: Select an active category
   - **File**: Upload your data file (will be stored on Walrus)
3. Click "Submit Dataset Proposal"

**What Happens:**
1. File is uploaded to Walrus decentralized storage
2. DataSubmission object is created on-chain
3. Proposal (Type 2: Data Approval) is automatically created
4. Proposal enters voting period (7 days default)

**Requirements:**
- Wallet must be connected
- Category must be active
- No KAI required to submit (unlike category proposals)

### Phase 3: Vote on Data Submissions

DAO members vote on submitted data.

**Steps:**
1. Navigate to **Governance** page
2. Find active "Dataset Approval" proposals
3. Review submission details
4. Click "Vote Yes" or "Vote No"
5. Approve transaction in wallet

**Voting Power:**
- Based on KAI balance in your AccountCap
- More KAI = more voting power

**Proposal Execution:**
- After voting period ends (7 days)
- If quorum (30%) and threshold (70%) met:
  - Submission is approved
  - Submitter receives KAI reward
  - Data becomes eligible for pricing

### Phase 4: Set Price for Approved Data

Once data is approved, set a price for marketplace listing.

**Steps:**
1. Navigate to **Governance** → **Create Proposal**
2. Select "Set Price" proposal type
3. Enter:
   - Submission ID
   - Proposed Price (in KAI)
4. Click "Create Proposal"
5. DAO votes on price
6. Execute proposal after voting ends

**Result:**
- Data is listed in marketplace
- Price is set
- Available for purchase

### Phase 5: Purchase Data

Buy approved and priced datasets.

**Steps:**
1. Navigate to **Marketplace**
2. Browse available datasets
3. Click on a dataset to view details
4. Click "Purchase"
5. Approve transaction (pays in SUI)
6. Access granted (download from Walrus using blob ID)

**Payment:**
- Payment goes directly to DAO treasury
- Price is set in SUI
- No additional fees

## Workflow Summary

```
1. Purchase KAI → Get AccountCap
2. Create Category Proposal → Vote → Execute
3. Submit Data → Auto-creates Proposal
4. Vote on Data Approval → Execute
5. Set Price Proposal → Vote → Execute
6. Purchase Data → Payment to Treasury
```

## Features

### Wallet Integration

- **Supported Wallets**: Suiet, Ethos, Sui Wallet, Wallet Standard
- **SuiNS Names**: Automatically resolves addresses to SuiNS names
- **Network Switching**: Support for testnet/mainnet/devnet

### Data Storage

- **Walrus Integration**: Files stored on Walrus decentralized storage
- **Metadata**: JSON metadata stored on-chain
- **Retrieval**: Download data using Walrus blob ID

### Governance

- **Proposal Types**:
  1. Category Creation
  2. Data Approval
  3. Price Setting
- **Voting**: Weighted by KAI balance
- **Quorum**: 30% of circulating supply
- **Threshold**: 70% approval required

### Tokenomics

- **KAI Token**: Governance and rewards token
- **SUI**: Treasury currency and payment method
- **Rewards**: Contributors receive KAI from reward pool
- **Redemption**: Burn KAI to redeem SUI from treasury

## Advanced Usage

### Querying On-Chain Data

Use Sui Explorer or CLI to query:

```bash
# Get DAO state
sui client object <DATA_DAO_ID>

# Get all proposals
sui client query --filter StructType '<PACKAGE_ID>::contract::Proposal'

# Get all submissions
sui client query --filter StructType '<PACKAGE_ID>::contract::DataSubmission'

# Get categories
sui client query --filter StructType '<PACKAGE_ID>::contract::DataCategory'
```

### Managing AccountCap

If you have multiple AccountCaps:
1. Check balance: Frontend displays KAI balance
2. Add more KAI: Use "Add KAI" function
3. Burn KAI: Redeem SUI from treasury

### Executing Proposals

Proposals can be executed by anyone after voting period:
1. Navigate to proposal details
2. If voting ended and quorum met
3. Click "Execute Proposal"
4. Approve transaction

**Note**: Only executable once per proposal

## Troubleshooting

### Transaction Fails

**Common Issues:**
- Insufficient gas: Ensure wallet has SUI
- Wrong network: Check wallet and app network match
- Proposal already executed: Check proposal status
- Category inactive: Verify category is active

### Wallet Connection Issues

1. Refresh page
2. Disconnect and reconnect wallet
3. Check wallet extension is enabled
4. Verify network matches

### Data Not Showing

1. Check transaction was successful
2. Wait for block confirmation (may take a few seconds)
3. Refresh page
4. Clear browser cache

### Proposal Creation Fails

1. Ensure you have AccountCap with KAI
2. Check category exists and is active
3. Verify you have enough gas
4. Check proposal data is valid

## Best Practices

1. **Test First**: Use testnet before mainnet
2. **Small Amounts**: Start with small amounts for testing
3. **Verify**: Always verify transactions on Sui Explorer
4. **Backup**: Save important transaction digests
5. **Security**: Never share private keys or mnemonics

## API Reference

### Frontend Hooks

- `useSuiWallet()` - Wallet connection state
- `useDao()` - DAO state and data
- `useAccountCap()` - User's KAI account
- `useCategories()` - Active data categories
- `useProposals()` - List of proposals
- `useSubmitData()` - Submit data function
- `useVote()` - Vote on proposals
- `usePurchaseKai()` - Purchase KAI tokens

### Contract Functions

See `SUI_INTEGRATION.md` for complete contract function reference.

## Support & Resources

- **Documentation**: See `SUI_INTEGRATION.md` and `DEPLOYMENT.md`
- **Sui Explorer**: View transactions and objects
- **Sui Discord**: Community support
- **Contract Source**: `smart-contracts/sources/dao2.move`

## Example Transaction Flow

### Complete Data Submission Flow

1. **User submits data**:
   ```
   submit_data(
     dao: DataDAO,
     category: DataCategory,
     walrus_blob_id: "abc123...",
     metadata: '{"name":"Dataset","description":"..."}',
     clock: Clock
   )
   ```
   - Creates DataSubmission object
   - Creates Proposal (Type 2) automatically
   - Proposal ID returned

2. **DAO members vote**:
   ```
   vote(
     dao: DataDAO,
     account: AccountCap,
     proposal: Proposal,
     clock: Clock
   )
   ```
   - Adds votes to proposal
   - Voting power = KAI balance

3. **Execute proposal** (after 7 days):
   ```
   execute_data_proposal(
     dao: DataDAO,
     proposal: Proposal,
     submission: DataSubmission,
     category: DataCategory,
     clock: Clock
   )
   ```
   - If quorum + threshold met → Approves data
   - Rewards submitter with KAI

4. **Set price** (new proposal):
   ```
   propose_price(
     dao: DataDAO,
     account: AccountCap,
     submission_id: ID,
     price: u64,
     clock: Clock
   )
   ```

5. **Execute price proposal**:
   ```
   execute_price_proposal(...)
   ```
   - Sets price
   - Lists in marketplace

6. **Purchase data**:
   ```
   purchase_data(
     dao: DataDAO,
     submission: DataSubmission,
     payment: Coin<SUI>
   )
   ```
   - Payment goes to treasury
   - Buyer receives access

This completes the full lifecycle of data in the Kaivalya DAO!

