[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/Rajshah1302/KAI)
# KAI Data DAO

A decentralized autonomous organization for data sovereignty built on Sui Network. KAI enables cryptographic data ownership, community governance, and direct creator compensation through Seal encryption, Walrus storage, and on-chain voting mechanisms.

## Overview

KAI transforms user-generated data from an exploited resource into a governed digital asset. Data creators encrypt their contributions with Seal, store them on Walrus, and submit references on-chain. The DAO community votes on data approval, categorization, and pricing. Approved contributors receive KAI token rewards directly from the protocol.

### Core Components

- **Sui Smart Contracts**: Move-based contracts managing governance, tokens, and marketplace
- **Seal Encryption**: Client-side encryption ensuring data privacy
- **Walrus Storage**: Decentralized storage for encrypted data blobs
- **KAI Token**: Governance token enabling voting and rewards (1M total supply)

## Architecture

```
User → Seal Encryption → Walrus Upload → On-Chain Submission
                                              ↓
                                         Auto-Proposal
                                              ↓
                                    DAO Voting (7 days)
                                              ↓
                                    Approval + Reward → Marketplace
```

### Smart Contract Structure

**DataDAO**: Central contract managing treasury, token reserves, and governance parameters

**AccountCap**: User account objects holding KAI balances and DAO membership

**DataSubmission**: On-chain references to encrypted data with approval and pricing status

**DataCategory**: Community-defined categories with reward specifications

**Proposal**: Governance proposals for categories, data approval, and pricing

**Marketplace**: Trading interface for approved data with SUI payments

## Token Economics

| Allocation | Amount | Purpose |
|------------|--------|---------|
| Purchase Reserve | 300,000 KAI (30%) | Available for user purchase with SUI |
| Reward Pool | 700,000 KAI (70%) | Distributed to approved data contributors |

**Initial Exchange Rate**: 1 SUI = 1,000 KAI

**Voting Power**: Linear with KAI holdings

**Rewards**: Category-specific amounts distributed upon approval

## Governance

### Parameters

- **Quorum**: 30% of circulating KAI supply must participate
- **Threshold**: 70% of votes cast must approve
- **Voting Period**: 7 days (604,800,000 milliseconds)

### Proposal Types

**Type 1 - Category Creation**: Define new data categories with names, descriptions, and reward amounts

**Type 2 - Data Approval**: Automatically created on submission, determines if data meets standards

**Type 3 - Pricing**: Set SUI prices for approved data in marketplace

### Voting Process

1. User creates proposal (requires KAI account)
2. Community votes during 7-day period (weight = KAI balance)
3. Proposal evaluated for quorum and threshold
4. Automatic execution if approved

## Installation

### Prerequisites

- Sui CLI (v1.0.0+)
- Rust (v1.70.0+)
- Node.js (v18.0.0+) for frontend integration

### Contract Deployment

```bash
# Clone repository
git clone https://github.com/kai-dao/kai-contracts
cd kai-contracts

# Build contracts
sui move build

# Run tests
sui move test

# Deploy to testnet
sui client publish --gas-budget 100000000

# Deploy to mainnet
sui client publish --gas-budget 100000000 --network mainnet
```

## Usage

### Purchase KAI Tokens

```bash
sui client call --package <PACKAGE_ID> \
  --module kai \
  --function purchase_kai \
  --args <DAO_OBJECT_ID> <SUI_COIN_OBJECT_ID> \
  --gas-budget 10000000
```

### Submit Data

```bash
# 1. Encrypt data with Seal (off-chain)
seal encrypt --input data.json --output encrypted.blob

# 2. Upload to Walrus (off-chain)
walrus upload encrypted.blob
# Returns: blob_id

# 3. Submit on-chain
sui client call --package <PACKAGE_ID> \
  --module kai \
  --function submit_data \
  --args <DAO_OBJECT_ID> <CATEGORY_OBJECT_ID> <BLOB_ID> <METADATA> <CLOCK_OBJECT_ID> \
  --gas-budget 10000000
```

### Vote on Proposal

```bash
sui client call --package <PACKAGE_ID> \
  --module kai \
  --function vote \
  --args <DAO_OBJECT_ID> <ACCOUNT_CAP_OBJECT_ID> <PROPOSAL_OBJECT_ID> <CLOCK_OBJECT_ID> \
  --gas-budget 10000000
```

### Execute Approved Proposal

```bash
# For data approval proposals
sui client call --package <PACKAGE_ID> \
  --module kai \
  --function execute_data_proposal \
  --args <DAO_OBJECT_ID> <PROPOSAL_OBJECT_ID> <SUBMISSION_OBJECT_ID> <CATEGORY_OBJECT_ID> <CLOCK_OBJECT_ID> \
  --gas-budget 10000000
```

### Purchase Data from Marketplace

```bash
sui client call --package <PACKAGE_ID> \
  --module kai \
  --function purchase_data \
  --args <DAO_OBJECT_ID> <SUBMISSION_OBJECT_ID> <SUI_PAYMENT_OBJECT_ID> \
  --gas-budget 10000000
```

## Testing

The contract includes comprehensive test coverage:

```bash
# Run all tests
sui move test

# Run specific test
sui move test test_01_init_and_purchase_kai

# Test with coverage
sui move test --coverage
```

### Test Scenarios

- `test_01`: Initialize DAO and purchase KAI tokens
- `test_02`: Add KAI to existing account
- `test_03`: Burn KAI to redeem SUI
- `test_04`: Create and execute category proposal
- `test_05`: Submit data and receive approval reward
- `test_06`: Set price and purchase data from marketplace
- `test_07`: Prevent double voting (failure test)
- `test_08`: Prevent voting after deadline (failure test)

## API Reference

### Core Functions

#### `purchase_kai(dao: &mut DataDAO, payment: Coin<SUI>) -> AccountCap`
Exchange SUI for KAI tokens from reserve. Returns new AccountCap with KAI balance.

#### `submit_data(dao: &mut DataDAO, category: &DataCategory, walrus_blob_id: vector<u8>, metadata: vector<u8>, clock: &Clock)`
Submit encrypted data reference. Automatically creates approval proposal.

#### `vote(dao: &mut DataDAO, account: &AccountCap, proposal: &mut Proposal, clock: &Clock)`
Cast vote on active proposal. Weight equals KAI balance.

#### `execute_data_proposal(dao: &mut DataDAO, proposal: &mut Proposal, submission: &mut DataSubmission, category: &DataCategory, clock: &Clock)`
Execute approved data submission proposal. Distributes rewards to submitter.

#### `purchase_data(dao: &mut DataDAO, submission: &DataSubmission, payment: Coin<SUI>)`
Purchase marketplace-listed data. Payment goes to DAO treasury.

### Getter Functions

```move
get_kai_balance(account: &AccountCap): u64
get_treasury(dao: &DataDAO): u64
get_reward_pool(dao: &DataDAO): u64
get_submission_submitter(submission: &DataSubmission): address
is_submission_approved(submission: &DataSubmission): bool
get_proposal_votes(proposal: &Proposal): u64
```

## Security Considerations

### Cryptographic Properties

- Data encrypted client-side before upload (Seal)
- Encrypted blobs stored on decentralized Walrus network
- Decryption keys distributed off-chain to authorized buyers only
- On-chain references contain no raw data

### Governance Protections

- Double-voting prevented through on-chain voter tracking
- Time locks prevent premature proposal execution
- Quorum requirements prevent low-turnout decisions
- Immutable vote records ensure transparency

### Economic Security

- Move resource types prevent KAI duplication
- Treasury balances protected by contract logic
- Linear voting prevents flash-loan attacks
- 70% reward allocation ensures contributor sustainability

## Error Codes

```
EInsufficientKAI = 1          // Account lacks required KAI balance
ENoKAIAvailable = 2           // Reserve depleted
EWrongDAO = 3                 // AccountCap belongs to different DAO
EAlreadyVoted = 4             // Address already voted on proposal
EVotingEnded = 5              // Voting period expired
EVotingNotEnded = 6           // Cannot execute during active voting
ENotListed = 7                // Data not available in marketplace
EInsufficientPayment = 8      // Payment below required price
ECategoryInactive = 9         // Category not accepting submissions
ECategoryNotFound = 10        // Invalid category reference
EInvalidData = 11             // Empty blob ID or metadata
```

## Roadmap

### Phase 1: Foundation (Q1-Q2 2025)
- Mainnet deployment of core contracts
- Seal and Walrus integration
- Initial category proposals
- Community onboarding

### Phase 2: Marketplace (Q3-Q4 2025)
- Enhanced discovery and search
- Quality standards implementation
- Partner integrations
- Mobile submission interface

### Phase 3: Expansion (2026)
- Delegation mechanisms
- Cross-chain bridges
- Zero-knowledge proofs
- Enterprise APIs

### Phase 4: Autonomy (2027+)
- Full protocol governance
- Decentralized identity integration
- Multi-chain interoperability
- AI-powered quality assessment

## Contributing

We welcome contributions from the community. Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/improvement`)
3. Write tests for new functionality
4. Ensure all tests pass (`sui move test`)
5. Submit pull request with clear description

### Development Setup

```bash
# Install Sui CLI
cargo install --locked --git https://github.com/MystenLabs/sui.git --branch mainnet sui

# Clone and build
git clone https://github.com/kai-dao/kai-contracts
cd kai-contracts
sui move build

# Run development node
sui start
```
