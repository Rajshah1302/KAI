# Kaivalya: A Decentralized Data DAO

Kaivalya is a decentralized autonomous organization (DAO) built on modern web and blockchain principles to create a transparent and equitable data marketplace. It empowers individuals with true ownership of their data, allowing them to contribute to a community-governed ecosystem and get compensated fairly for their contributions.

## ✨ Core Features

- **Decentralized Data Marketplace**: Browse, purchase, and download datasets contributed by the community.
- **Secure Data Contributions**: Users can encrypt and upload data to the decentralized [Walrus Network](https://www.walrus.space/), which then undergoes a DAO approval process.
- **DAO Governance**: KAI token holders can create and vote on proposals, including creating new data categories, approving datasets, and setting prices.
- **Transparent Tokenomics**: A dual-token system featuring **KAI** for governance and rewards, and **SUI** for the core treasury.
- **Contributor Dashboard**: A personalized dashboard for users to track their data contributions, earnings, and proposal history.
- **Wallet Integration**: Seamlessly connect with Web3 wallets to interact with the DAO's features.
- **Modern, Interactive UI**: A beautiful and responsive interface built with a pastel theme and subtle on-scroll animations.

## 🥞 Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **UI Components**: [ShadCN UI](https://ui.shadcn.com/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Decentralized Storage**: [Walrus Protocol](https://www.walrus.space/)
- **State Management**: React Hooks (`useState`, `useEffect`, custom hooks)
- **Animations**: [Framer Motion](https://www.framer.com/motion/) & [GSAP](https://gsap.com/)

## ⚙️ Core DAO Flow

The Kaivalya DAO operates on a structured, five-phase model that governs the entire lifecycle of data from contribution to consumption.

### Phase 1: Initialization

1.  **DAO Creation**: The DAO is established with a treasury funded by SUI.
2.  **Token Minting**: A fixed supply of the native governance token, KAI, is minted.
3.  **Founder Airdrop**: Initial founders receive an airdrop of KAI tokens.
4.  **Reward Pool**: A portion of the KAI supply is locked into a reward pool within the DAO to incentivize data contributors.

### Phase 2: Category Creation (Proposal Type 1)

1.  A DAO member proposes a new data category (e.g., "Healthcare," "Environment").
2.  The proposal includes a suggested reward amount in KAI for valid contributions to this category.
3.  The DAO votes on the proposal. A 30% quorum and 70% approval are required.
4.  If passed, the new category becomes active and is added to the marketplace.

### Phase 3: Data Submission (Proposal Type 2)

1.  A user uploads an encrypted dataset to the Walrus network and submits it to an active category.
2.  This action automatically creates a "Dataset Approval" proposal. No KAI is required to submit.
3.  The DAO (KAI token holders) votes to approve or reject the dataset based on its validity and relevance.
4.  **If approved**: The contributor receives KAI tokens from the reward pool, and the dataset is listed in the marketplace (pending a price).
5.  **If rejected**: The dataset is not listed, and no rewards are distributed.

### Phase 4: Data Pricing (Proposal Type 3)

1.  Once a dataset is approved, any DAO member can create a "Pricing" proposal to set its price in KAI.
2.  The DAO votes on the proposed price.
3.  If passed, the price is set, and the dataset becomes available for purchase on the marketplace.

### Phase 5: Trading & Redemption

1.  **Buying Data**: A buyer purchases a dataset from the marketplace using SUI. The SUI is transferred directly to the DAO's treasury.
2.  **Redeeming SUI**: KAI token holders can burn their KAI tokens to redeem a proportional share of the SUI held in the DAO treasury, reflecting the underlying value backing the KAI token.

## 🚀 Getting Started

To run this project locally:

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Run the development server:**
    ```bash
    npm run dev
    ```

Open [http://localhost:9002](http://localhost:9002) with your browser to see the result.
