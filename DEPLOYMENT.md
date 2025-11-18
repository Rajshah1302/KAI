# Smart Contract Deployment Guide

Complete guide for deploying the Kaivalya Data DAO smart contracts to Sui blockchain.

## Prerequisites

1. **Install Sui CLI**
   ```bash
   cargo install --locked --git https://github.com/MystenLabs/sui.git --branch devnet sui
   ```

   Or use the install script:
   ```bash
   curl -fsSL https://get.sui.io | sh
   ```

2. **Verify Installation**
   ```bash
   sui --version
   ```

3. **Set Up Sui Client**
   ```bash
   sui client
   # Select network: testnet (for testing) or mainnet (for production)
   ```

## Deployment Steps

### 1. Configure Network

Edit `smart-contracts/Move.toml` to ensure correct network settings:

```toml
[addresses]
dao = "0x0"  # Will be replaced on deployment
```

### 2. Build the Contract

```bash
cd smart-contracts
sui move build
```

This will:
- Compile your Move modules
- Generate build artifacts in `build/` directory
- Validate the contract code

### 3. Test the Contract (Optional but Recommended)

```bash
sui move test
```

Run all tests to ensure everything works correctly before deployment.

### 4. Publish the Contract

#### For Testnet:
```bash
sui client publish --gas-budget 100000000
```

#### For Mainnet:
```bash
sui client publish --gas-budget 100000000 --json
```

**Expected Output:**
```json
{
  "packageId": "0x...",
  "transactionDigest": "...",
  "created": {
    "objects": [
      {
        "type": "0x...::contract::DataDAO",
        "owner": "Shared",
        "objectId": "0x..."
      },
      {
        "type": "0x...::contract::Marketplace",
        "owner": "Shared",
        "objectId": "0x..."
      }
    ]
  }
}
```

### 5. Extract Contract Addresses

After deployment, extract the following addresses:

```bash
# Get package ID
sui client publish --gas-budget 100000000 --json | jq '.packageId'

# Get shared object IDs
sui client object <OBJECT_ID> --json
```

**Important IDs to extract:**
- **Package ID**: The deployed package address
- **DataDAO ID**: Shared DataDAO object ID
- **Marketplace ID**: Shared Marketplace object ID

### 6. Initialize the Contract

The contract automatically initializes on first deployment via the `init` function:
- Creates KAI token (1,000,000 supply)
- Creates DataDAO shared object
- Creates Marketplace shared object
- Sets up reward pool (70%) and reserve (30%)

No manual initialization needed!

### 7. Update Frontend Configuration

Update `.env.local` in the frontend directory:

```env
NEXT_PUBLIC_SUI_NETWORK=testnet
NEXT_PUBLIC_SUI_PACKAGE_ID=0x<YOUR_PACKAGE_ID>
NEXT_PUBLIC_SUI_DATA_DAO_ID=0x<YOUR_DATA_DAO_ID>
NEXT_PUBLIC_SUI_MARKETPLACE_ID=0x<YOUR_MARKETPLACE_ID>
```

## Verification Steps

### 1. Verify Package Published

```bash
sui client object <PACKAGE_ID> --json
```

### 2. Verify DataDAO Object

```bash
sui client object <DATA_DAO_ID> --json
```

### 3. Verify Marketplace Object

```bash
sui client object <MARKETPLACE_ID> --json
```

### 4. Check Initial State

Query the DataDAO state:
```bash
sui client call \
  --package <PACKAGE_ID> \
  --module contract \
  --function get_treasury \
  --args <DATA_DAO_ID>
```

## Network-Specific Instructions

### Testnet Deployment

1. **Get Testnet SUI:**
   ```bash
   curl -X POST https://faucet.testnet.sui.io/gas \
     -H "Content-Type: application/json" \
     -d '{"FixedAmountRequest":{"recipient":"<YOUR_ADDRESS>"}}'
   ```

2. **Switch to Testnet:**
   ```bash
   sui client switch --env testnet
   ```

3. **Deploy:**
   ```bash
   sui client publish --gas-budget 100000000
   ```

### Mainnet Deployment

1. **Ensure Sufficient Gas:**
   - Mainnet requires real SUI tokens
   - Recommended: 10-20 SUI for deployment

2. **Switch to Mainnet:**
   ```bash
   sui client switch --env mainnet
   ```

3. **Deploy:**
   ```bash
   sui client publish --gas-budget 100000000
   ```

4. **Verify Deployment:**
   - Check on Sui Explorer
   - Verify all objects are shared correctly

## Post-Deployment Checklist

- [ ] Contract published successfully
- [ ] Package ID extracted and saved
- [ ] DataDAO object ID extracted and saved
- [ ] Marketplace object ID extracted and saved
- [ ] Frontend `.env.local` updated
- [ ] Contract verified on Sui Explorer
- [ ] Initial state checked (treasury, reward pool, etc.)

## Interacting with Deployed Contract

### Purchase KAI Tokens

```bash
sui client call \
  --package <PACKAGE_ID> \
  --module contract \
  --function purchase_kai \
  --args <DATA_DAO_ID> <PAYMENT_COIN> \
  --gas-budget 10000000
```

### Submit Data

```bash
sui client call \
  --package <PACKAGE_ID> \
  --module contract \
  --function submit_data \
  --args <DATA_DAO_ID> <CATEGORY_ID> "walrus_blob_id" "metadata_json" <CLOCK_ID> \
  --gas-budget 10000000
```

### Vote on Proposal

```bash
sui client call \
  --package <PACKAGE_ID> \
  --module contract \
  --function vote \
  --args <DATA_DAO_ID> <ACCOUNT_CAP_ID> <PROPOSAL_ID> <CLOCK_ID> \
  --gas-budget 10000000
```

## Troubleshooting

### Build Errors

If you get build errors:
```bash
# Clean build artifacts
rm -rf build/

# Rebuild
sui move build
```

### Gas Errors

If you run out of gas:
1. Request more testnet SUI from faucet
2. Increase `--gas-budget` parameter
3. Check your wallet balance: `sui client gas`

### Object Not Found

If objects aren't found after deployment:
1. Check transaction digest: `sui client tx <DIGEST>`
2. Verify network matches (testnet/mainnet)
3. Ensure you're using the correct object IDs

### Frontend Connection Issues

If frontend can't connect:
1. Verify `.env.local` has correct addresses
2. Check network matches (NEXT_PUBLIC_SUI_NETWORK)
3. Clear browser cache
4. Restart dev server: `npm run dev`

## Security Considerations

1. **Private Keys**: Never commit private keys or mnemonics
2. **Mainnet**: Always test on testnet first
3. **Verification**: Verify contract code on Sui Explorer after deployment
4. **Access Control**: Review shared object access patterns
5. **Upgrades**: Plan for contract upgrades if needed

## Upgrading Contracts

Sui supports package upgrades:

```bash
sui client upgrade \
  --upgrade-capability <UPGRADE_CAP_ID> \
  --gas-budget 100000000
```

**Note**: Original publisher retains upgrade authority.

## Resources

- [Sui Documentation](https://docs.sui.io/)
- [Sui Explorer](https://suiexplorer.com/)
- [Move Language Reference](https://move-language.github.io/move/)
- [Sui CLI Reference](https://docs.sui.io/build/cli)

## Support

For issues or questions:
1. Check Sui Discord: https://discord.gg/sui
2. Review contract logs: `sui client object <ID> --json`
3. Check transaction details: `sui client tx <DIGEST>`

