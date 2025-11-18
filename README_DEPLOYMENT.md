# Complete Deployment & Usage Guide

Quick reference guide for deploying and using the Kaivalya Data DAO.

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Deployment Steps](#deployment-steps)
3. [Frontend Configuration](#frontend-configuration)
4. [First Use](#first-use)
5. [Complete Workflow](#complete-workflow)

## 🚀 Quick Start

### Prerequisites

```bash
# Install Sui CLI
curl -fsSL https://get.sui.io | sh

# Verify installation
sui --version
```

### Deploy Contract

```bash
cd smart-contracts

# Build
sui move build

# Publish (testnet)
sui client publish --gas-budget 100000000 --json > deployment.json

# Extract addresses
cat deployment.json | jq -r '.packageId'        # Package ID
cat deployment.json | jq -r '.created.objects[0].objectId'  # DataDAO ID
cat deployment.json | jq -r '.created.objects[1].objectId'  # Marketplace ID
```

### Configure Frontend

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_SUI_NETWORK=testnet
NEXT_PUBLIC_SUI_PACKAGE_ID=0x<PACKAGE_ID>
NEXT_PUBLIC_SUI_DATA_DAO_ID=0x<DATA_DAO_ID>
NEXT_PUBLIC_SUI_MARKETPLACE_ID=0x<MARKETPLACE_ID>
```

### Run Frontend

```bash
cd frontend
npm install
npm run dev
```

Visit: http://localhost:9002

## 📖 Complete Deployment Steps

### Step 1: Install Dependencies

```bash
# Sui CLI
curl -fsSL https://get.sui.io | sh

# Verify
sui --version
sui client --version
```

### Step 2: Set Up Sui Client

```bash
# Initialize (if first time)
sui client

# Select network
# Choose: testnet (for testing) or mainnet (for production)

# Get testnet SUI (if using testnet)
curl -X POST https://faucet.testnet.sui.io/gas \
  -H "Content-Type: application/json" \
  -d '{"FixedAmountRequest":{"recipient":"<YOUR_ADDRESS>"}}'

# Check address
sui client active-address

# Check balance
sui client gas
```

### Step 3: Build & Test Contract

```bash
cd smart-contracts

# Build
sui move build

# Run tests (optional)
sui move test
```

### Step 4: Publish Contract

#### For Testnet:

```bash
sui client publish --gas-budget 100000000 --json > deployment.json
```

#### For Mainnet:

```bash
# Ensure you have sufficient SUI (10-20 SUI recommended)
sui client gas

# Publish
sui client publish --gas-budget 100000000 --json > deployment.json
```

### Step 5: Extract Contract Addresses

After deployment, extract the addresses from `deployment.json`:

```bash
# Package ID
PACKAGE_ID=$(cat deployment.json | jq -r '.packageId')
echo "Package ID: $PACKAGE_ID"

# DataDAO ID (first created object)
DAO_ID=$(cat deployment.json | jq -r '.created.objects[0].objectId')
echo "DataDAO ID: $DAO_ID"

# Marketplace ID (second created object)
MARKETPLACE_ID=$(cat deployment.json | jq -r '.created.objects[1].objectId')
echo "Marketplace ID: $MARKETPLACE_ID"
```

**Important**: Save these addresses - you'll need them for frontend configuration.

### Step 6: Verify Deployment

```bash
# Check package
sui client object $PACKAGE_ID

# Check DataDAO
sui client object $DAO_ID

# Check Marketplace
sui client object $MARKETPLACE_ID
```

Or view on Sui Explorer:
- Testnet: https://suiexplorer.com/?network=testnet
- Mainnet: https://suiexplorer.com

## ⚙️ Frontend Configuration

### Step 1: Install Dependencies

```bash
cd frontend
npm install
```

### Step 2: Create Environment File

Create `frontend/.env.local`:

```env
# Network (testnet, mainnet, devnet)
NEXT_PUBLIC_SUI_NETWORK=testnet

# Contract Addresses (from deployment)
NEXT_PUBLIC_SUI_PACKAGE_ID=0x<YOUR_PACKAGE_ID>
NEXT_PUBLIC_SUI_DATA_DAO_ID=0x<YOUR_DATA_DAO_ID>
NEXT_PUBLIC_SUI_MARKETPLACE_ID=0x<YOUR_MARKETPLACE_ID>
```

### Step 3: Start Development Server

```bash
npm run dev
```

The app will be available at: http://localhost:9002

## 🎯 First Use

### 1. Connect Wallet

1. Click "Connect Wallet" in header
2. Select your wallet (Suiet, Ethos, etc.)
3. Approve connection
4. Your address should appear

### 2. Purchase KAI Tokens

1. Navigate to **Finance** or **Tokenomics** page
2. Enter amount of SUI (e.g., 1 SUI = 1000 KAI)
3. Click "Purchase KAI"
4. Approve transaction
5. You'll receive AccountCap with KAI balance

### 3. Create First Category

1. Navigate to **Governance** → **Create Proposal**
2. Select "Category Creation"
3. Fill in:
   - **Name**: e.g., "Healthcare Data"
   - **Description**: Description of category
   - **Reward Amount**: KAI to reward contributors (e.g., 1000000 = 1 KAI)
4. Click "Create Proposal"
5. Wait for voting period (or vote yourself)
6. Execute proposal after voting ends

### 4. Submit Data

1. Navigate to **Contribute** → **Upload**
2. Fill in:
   - **Dataset Name**: Name your dataset
   - **Description**: Describe the data
   - **Category**: Select an active category
   - **File**: Upload your data file
3. Click "Submit Dataset Proposal"

**What happens:**
- File uploads to Walrus
- DataSubmission created on-chain
- Proposal (Type 2) automatically created
- Enters 7-day voting period

### 5. Vote on Data

1. Navigate to **Governance**
2. Find data approval proposal
3. Click "Vote Yes" or "Vote No"
4. Approve transaction

### 6. Execute Proposal

After voting period ends:

1. Navigate to proposal details
2. Click "Execute Proposal" (if quorum met)
3. Approve transaction
4. Data is approved (if threshold met)
5. Submitter receives reward

### 7. Set Price

1. Navigate to **Governance** → **Create Proposal**
2. Select "Set Price"
3. Enter submission ID and price
4. Create proposal
5. Vote and execute

### 8. Purchase Data

1. Navigate to **Marketplace**
2. Browse approved datasets
3. Click on dataset
4. Click "Purchase"
5. Pay with SUI
6. Access granted

## 📚 Complete Workflow

```
┌─────────────────┐
│ Purchase KAI    │ → Get AccountCap with KAI balance
└─────────────────┘
         ↓
┌─────────────────┐
│ Create Category │ → Propose → Vote → Execute → Category Active
└─────────────────┘
         ↓
┌─────────────────┐
│ Submit Data     │ → Upload to Walrus → Auto-creates Proposal
└─────────────────┘
         ↓
┌─────────────────┐
│ Vote on Data    │ → Vote Yes/No → Wait for period to end
└─────────────────┘
         ↓
┌─────────────────┐
│ Execute         │ → If approved → Data approved + Reward
└─────────────────┘
         ↓
┌─────────────────┐
│ Set Price       │ → Propose → Vote → Execute → Listed
└─────────────────┘
         ↓
┌─────────────────┐
│ Purchase Data   │ → Pay SUI → Access granted
└─────────────────┘
```

## 🔧 Contract Functions Reference

### User Functions

- `purchase_kai()` - Purchase KAI tokens with SUI
- `add_kai()` - Add more KAI to existing account
- `burn_kai()` - Burn KAI to redeem SUI from treasury
- `submit_data()` - Submit data (auto-creates proposal)
- `vote()` - Vote on proposal
- `propose_category()` - Create category proposal
- `propose_price()` - Create price proposal

### Execution Functions

- `execute_category_proposal()` - Execute category proposal
- `execute_data_proposal()` - Execute data approval proposal
- `execute_price_proposal()` - Execute price proposal

### Purchase Functions

- `purchase_data()` - Purchase data from marketplace

## 📊 Contract State

After initialization:
- **KAI Supply**: 1,000,000 KAI (fixed)
- **KAI Reserve**: 300,000 KAI (30%)
- **Reward Pool**: 700,000 KAI (70%)
- **KAI Price**: 1000 KAI per 1 SUI
- **Quorum**: 30% of circulating supply
- **Threshold**: 70% approval required
- **Vote Time**: 7 days (604,800,000 ms)

## 🐛 Troubleshooting

### Deployment Issues

**"Cannot publish package"**
- Ensure you have enough SUI for gas
- Check network matches (testnet/mainnet)
- Verify Move.toml configuration

**"Object not found after deployment"**
- Wait a few seconds for block confirmation
- Check transaction digest: `sui client tx <DIGEST>`
- Verify on Sui Explorer

### Frontend Issues

**"Wallet not connecting"**
- Ensure wallet extension is installed
- Check browser console for errors
- Try refreshing page

**"Categories not loading"**
- Verify contract is deployed
- Check package ID in `.env.local`
- Ensure categories exist (create one first)

**"Transaction fails"**
- Check wallet has sufficient SUI for gas
- Verify network matches
- Check error message for specific issue

### Contract Issues

**"Category inactive"**
- Category must be active to submit data
- Create a new category if needed
- Execute category proposal first

**"Insufficient KAI"**
- Purchase more KAI tokens
- Check your AccountCap balance
- Ensure you have enough for voting

## 📝 Testing

### Test Contract Locally

```bash
cd smart-contracts
sui move test
```

### Test Frontend

```bash
cd frontend
npm run dev
# Open http://localhost:9002
```

### Manual Testing Flow

1. Deploy contract
2. Connect wallet
3. Purchase KAI
4. Create category
5. Submit data
6. Vote on proposal
7. Execute proposal
8. Set price
9. Purchase data

## 📖 Additional Documentation

- **Deployment Details**: See `DEPLOYMENT.md`
- **Quick Start**: See `DEPLOYMENT_QUICKSTART.md`
- **Usage Guide**: See `USAGE_GUIDE.md`
- **Integration**: See `frontend/SUI_INTEGRATION.md`

## 🔗 Useful Links

- [Sui Explorer](https://suiexplorer.com/)
- [Sui Documentation](https://docs.sui.io/)
- [Sui Discord](https://discord.gg/sui)
- [Move Language](https://move-language.github.io/move/)

## ✅ Deployment Checklist

Before going live:

- [ ] Contract tested on testnet
- [ ] All contract addresses extracted
- [ ] Frontend `.env.local` configured
- [ ] Wallet connection working
- [ ] Categories can be created
- [ ] Data submission works
- [ ] Voting works
- [ ] Proposals can be executed
- [ ] Data can be purchased
- [ ] All error cases handled

## 🎉 You're Ready!

Once deployed and configured, your Kaivalya Data DAO is ready to use!

1. Users can connect wallets
2. Purchase KAI tokens
3. Create categories
4. Submit data
5. Vote on proposals
6. Execute proposals
7. Set prices
8. Purchase data

For detailed usage instructions, see `USAGE_GUIDE.md`.

