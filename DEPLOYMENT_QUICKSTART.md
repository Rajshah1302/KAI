# Quick Start Deployment Guide

Fast-track guide to deploy and use the Kaivalya Data DAO.

## Prerequisites

```bash
# Install Sui CLI
curl -fsSL https://get.sui.io | sh

# Verify installation
sui --version

# Initialize Sui client
sui client
# Select: testnet (recommended for testing)
```

## Step 1: Get Testnet SUI

```bash
# Get your address
sui client active-address

# Request testnet SUI (replace with your address)
curl -X POST https://faucet.testnet.sui.io/gas \
  -H "Content-Type: application/json" \
  -d '{"FixedAmountRequest":{"recipient":"<YOUR_ADDRESS>"}}'
```

## Step 2: Build the Contract

```bash
cd smart-contracts
sui move build
```

## Step 3: Publish the Contract

```bash
sui client publish --gas-budget 100000000 --json > deployment.json
```

## Step 4: Extract Addresses

```bash
# Package ID
cat deployment.json | jq -r '.packageId'

# DataDAO ID (first created object)
cat deployment.json | jq -r '.created.objects[0].objectId'

# Marketplace ID (second created object)
cat deployment.json | jq -r '.created.objects[1].objectId'
```

**Example output:**
```
Package ID: 0xabc123...
DataDAO ID: 0xdef456...
Marketplace ID: 0x789ghi...
```

## Step 5: Configure Frontend

Create/update `frontend/.env.local`:

```env
NEXT_PUBLIC_SUI_NETWORK=testnet
NEXT_PUBLIC_SUI_PACKAGE_ID=0xabc123...
NEXT_PUBLIC_SUI_DATA_DAO_ID=0xdef456...
NEXT_PUBLIC_SUI_MARKETPLACE_ID=0x789ghi...
```

## Step 6: Install & Run Frontend

```bash
cd frontend
npm install
npm run dev
```

Visit: http://localhost:9002

## Step 7: Verify Deployment

### Check on Sui Explorer

Visit: https://suiexplorer.com/?network=testnet

Search for:
- Package ID: `0xabc123...`
- DataDAO ID: `0xdef456...`
- Marketplace ID: `0x789ghi...`

### Verify via CLI

```bash
# Check DataDAO object
sui client object <DATA_DAO_ID>

# Should show:
# - treasury balance
# - kai_reserve balance
# - reward_pool balance
# - kai_price: 1000
# - quorum: 30
# - threshold: 70
```

## First Steps After Deployment

### 1. Purchase KAI Tokens

1. Open the app in browser
2. Connect your wallet
3. Navigate to Finance/Tokenomics page
4. Enter SUI amount (e.g., 1 SUI)
5. Click "Purchase KAI"
6. Approve transaction
7. Receive AccountCap with 1000 KAI

### 2. Create Your First Category

1. Navigate to **Governance** → **Create Proposal**
2. Select "Category Creation"
3. Fill in:
   - Name: "Test Category"
   - Description: "Test category description"
   - Reward: 1000000 (1 KAI with 6 decimals)
4. Create proposal
5. Vote on your own proposal
6. Wait 7 days (or use time travel in tests)
7. Execute proposal

### 3. Submit Your First Data

1. Navigate to **Contribute** → **Upload**
2. Select the category you created
3. Fill in dataset details
4. Upload a file
5. Click "Submit Dataset Proposal"

**What happens:**
- File uploads to Walrus
- DataSubmission created on-chain
- Proposal automatically created
- Enter voting period

### 4. Vote on Data Submission

1. Navigate to **Governance**
2. Find your data submission proposal
3. Click "Vote Yes"
4. Approve transaction

### 5. Execute Proposal (After Voting Period)

```bash
# Wait 7 days or use sui-test-validator with time travel

# Execute the proposal
sui client call \
  --package <PACKAGE_ID> \
  --module contract \
  --function execute_data_proposal \
  --args <DATA_DAO_ID> <PROPOSAL_ID> <SUBMISSION_ID> <CATEGORY_ID> 0x6 \
  --gas-budget 10000000
```

## Common Commands

### Check Balance

```bash
sui client gas
```

### View AccountCap

```bash
# List your AccountCaps
sui client objects <YOUR_ADDRESS>
```

### Query Proposals

```bash
sui client query --filter StructType '<PACKAGE_ID>::contract::Proposal'
```

### Query Categories

```bash
sui client query --filter StructType '<PACKAGE_ID>::contract::DataCategory'
```

### Query Submissions

```bash
sui client query --filter StructType '<PACKAGE_ID>::contract::DataSubmission'
```

## Troubleshooting

### "Cannot find package"

**Solution**: Package ID incorrect in `.env.local`

```bash
# Verify package exists
sui client object <PACKAGE_ID>
```

### "Cannot find object"

**Solution**: Object ID incorrect or network mismatch

```bash
# Check object
sui client object <OBJECT_ID>

# Verify network
sui client active-env
```

### "Insufficient gas"

**Solution**: Request more testnet SUI

```bash
curl -X POST https://faucet.testnet.sui.io/gas \
  -H "Content-Type: application/json" \
  -d '{"FixedAmountRequest":{"recipient":"<YOUR_ADDRESS>"}}'
```

### Frontend shows "No categories"

**Solution**: Create a category first (see Step 2 above)

### Transaction fails

**Solution**: Check error message
- "Category inactive" → Category was deactivated
- "Already voted" → You already voted on this proposal
- "Voting ended" → Voting period has passed
- "Insufficient balance" → Not enough KAI/SUI

## Next Steps

1. ✅ Contract deployed
2. ✅ Frontend configured
3. ✅ Purchased KAI
4. ✅ Created category
5. ✅ Submitted data
6. ✅ Voted on proposals
7. ✅ Executed proposals
8. ✅ Set prices
9. ✅ Purchased data

## Full Documentation

- **Deployment Details**: See `DEPLOYMENT.md`
- **Usage Guide**: See `USAGE_GUIDE.md`
- **Integration Docs**: See `frontend/SUI_INTEGRATION.md`

## Support

For issues:
1. Check transaction on Sui Explorer
2. Review contract logs
3. Check `.env.local` configuration
4. Verify network matches (testnet/mainnet)

