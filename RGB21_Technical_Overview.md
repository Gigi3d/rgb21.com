# RGB21: Unique Digital Asset (UDA) Technical Overview

**RGB21** is the official standard for **Unique Digital Assets (UDAs)** on the RGB protocol. Unlike traditional NFTs (e.g., ERC-721 on Ethereum), RGB21 leverages **Client-Side Validation** and **Single-Use Seals** to provide high privacy, scalability, and security anchored directly to the Bitcoin blockchain.

## 1. Core Concepts

### Single-Use Seals & Bitcoin Anchoring
Every RGB21 asset is "bound" to a specific Bitcoin UTXO. To transfer the asset, the owner must spend that UTXO, creating a "witness" on the Bitcoin blockchain. The asset logic itself lives off-chain, but its ownership is secured by the strongest consensus mechanism in existence.

### Client-Side Validation
Instead of every node on the network validating every NFT (like in Ethereum), only the parties involved in a transaction validate the history of the asset. This ensures:
- **Scalability**: No global state bloat.
- **Privacy**: Asset details are only known to the owners and their chosen recipients.

### Unique Digital Asset (UDA) Schema
RGB21 is defined under the UDA schema, which is designed for assets that are unique and non-fungible.

## 2. Technical Structure (Schema & Global State)

The RGB21 standard defines a structured "Global State" that contains the metadata for the asset and its individual tokens.

### A. Asset Specification (`spec`)
Defines the high-level identity of the asset class.
- **Ticker**: A short identifier (e.g., "BAYC").
- **Name**: The full name of the NFT collection.
- **Precision**: Always 0 for true NFTs, but the schema allows for fractional NFTs.

### B. Contract Terms (`terms`)
Logical or legal conditions associated with the asset.
- **Ricardian Contract**: Human-readable text that describes the rights and obligations of the owner.
- **Media**: Optional legalese or logical data in binary form.

### C. Token Data (`tokens`)
This is where the individual NFT data lives.
- **Index**: A unique `u32` identifier (Token ID).
- **Name/Ticker**: Individual tokens can have their own names.
- **Preview**: A small "embedded" thumbnail (usually < 64KB) for fast UI rendering.
- **Media**: A hash/digest (e.g., SHA-256) of the full-resolution asset file.
- **Attachments**: A map of additional files (e.g., 3D models, high-res versions, metadata JSONs).

## 3. Implementation in Bitmask (`src/rgb/issue.rs`)

In this codebase, RGB21 assets are handled via the `issue_uda_asset` function.

### Metadata Handling
Bitmask supports complex media structures:
- **Embedded Media**: Previews are base64 decoded and embedded directly into the contract as a SmallBlob.
- **Proxied Media**: For large files, Bitmask uses a proxy server. The file is uploaded, and its digest (hash) and content type are stored in the contract's Attachment or Media fields.

### Ownership State
The `assetOwner` state links a specific `TokenIndex` to a `BuilderSeal` (a Bitcoin UTXO).

## 4. Key Advantages of RGB21

| Feature | RGB21 (Bitcoin) | ERC-721 (Ethereum) |
| :--- | :--- | :--- |
| **Validation** | Client-side (Local) | Global (All nodes) |
| **Privacy** | High (Off-chain history) | Low (Public ledger) |
| **Cost** | Low (Bitcoin transaction only) | High (Gas fees) |
| **Storage** | Hybrid (On-chain anchoring, off-chain data) | On-chain (often just a URI) |
| **Security** | Bitcoin PoW | Ethereum PoS |

### 4.1 RGB21 vs. Ordinals (Digital Artifacts)

While Ordinals have brought significant attention to Bitcoin NFTs, RGB21 offers several distinct technical advantages for institutional and privacy-conscious users.

| Feature | RGB21 (UDA) | Ordinals / Inscriptions |
| :--- | :--- | :--- |
| **Data Storage** | Off-chain (Client-side) | On-chain (Witness data) |
| **Privacy** | High (Private ownership) | None (Publicly visible) |
| **Scalability** | Unlimited (Off-chain data) | Limited (Block space constraints) |
| **Fees** | Minimal (Payment for anchor only) | High (Payment for data bytes) |
| **Programmability** | Advanced (Smart contracts) | Basic (Static inscriptions) |
| **Impact on Network** | None (Zero UTXO bloat) | High (Permanent chain bloat) |

### Advantages of RGB21 Over Ordinals:
- **Scalability**: RGB21 does not consume Bitcoin block space for media storage. You can have a 1GB NFT with the same on-chain footprint as a 1KB one.
- **Privacy**: In Ordinals, every image is public. In RGB21, you only share the asset data with those you choose.
- **Cost**: Since data is not stored on-chain, users don't pay "per byte" fees to Bitcoin miners for the media content.
- **No Chain Bloat**: RGB21 avoids the "dust" and UTXO set growth associated with massive on-chain inscriptions.

## 6. Cross-Contract Composability & Atomic Swaps

One of the most powerful features of the RGB protocol, as implemented in Bitmask, is the ability to perform **Cross-Contract Atomic Swaps**. This allows users to trade different types of assets (e.g., selling an NFT for a fungible token) in a single, atomic Bitcoin transaction.

### A. Atomicity via "Extra Shards"
Bitmask utilizes an "Extra Shards" mechanism to bundle multiple RGB contracts into a single swap offer.
- **Primary Asset**: The asset being offered by the seller.
- **Counterparty Asset**: The asset requested in exchange (e.g., an RGB20 token).
- **Fascia Generation**: During the swap, a "fascia" (a bundle of state transitions) is generated that encompasses all involved contracts. This ensures that the swap is all-or-nothing.

### B. Supported Swap Pairs
The Bitmask implementation explicitly supports and tests the following atomic swap pairs:
- **RGB21 ↔ Bitcoin (Sats)**: Buying/selling NFTs for BTC.
- **RGB20 ↔ Bitcoin (Sats)**: Buying/selling fungible tokens for BTC.
- **RGB20 ↔ RGB20**: Trading one type of fungible token for another.
- **RGB21 ↔ RGB21**: Trading one NFT for another.
- **RGB20 ↔ RGB21**: Buying/selling an NFT using a custom fungible token (e.g., a project's utility token).

### C. Technical Foundation: Anchor Sharding
The composability is rooted in **Anchor Sharding**. A single Bitcoin transaction can act as a container for multiple "shards" of data. Each shard belongs to a different RGB contract. This allows Bitmask to:
- Anchor independent state changes for 10+ different assets in one transaction.
- Scale beyond a 1:1 asset-to-transaction ratio.
- Enable complex multi-asset trades without increasing on-chain fees.

### D. Technical Workflow for Cross-Contract Swaps
1. **Offer Creation**: The seller creates an `RgbOfferRequest` specifying the `contract_id` they are selling and a `OrderValue::Contract` as the `counter_party`.
2. **Consignment Bundling**: The offer includes the necessary off-chain data (consigments) for both assets.
3. **Atomic Witness**: The swap is finalized when a single Bitcoin transaction spending the seals (UTXOs) for both assets is mined. The Tapret commitment in that transaction anchors the state transitions for all involved RGB contracts simultaneously.

## 7. Summary of Workflow

1. **Issue**: Define the collection (spec) and tokens (metadata, media).
2. **Anchor**: Commit the genesis to a Bitcoin UTXO.
3. **Transfer**: Spend the UTXO and provide the recipient with the "consignment" (the off-chain proof of history).
4. **Validate**: The recipient verifies the proof locally against their Bitcoin node.

## 8. RGB21 and ARK

### 1. How RGB Works with Other Bitcoin Layers
RGB is designed to layer on top of Bitcoin and Lightning without altering Bitcoin’s base protocol. It can function over the Lightning Network to gain speed and low cost, and also interoperates with other off-chain infrastructures.
In that context, **Ark** — a Bitcoin Layer-2 scaling system built around VTXOs (Virtual Transaction Outputs) — could also serve as a settlement or execution layer for RGB assets:
- **Ark** uses VTXOs to represent value off-chain while preserving the ability for users to unilaterally exit back to Bitcoin’s base layer.
- **RGB** assets are anchored to Bitcoin UTXOs and validated on clients rather than on-chain, preserving privacy and scalability.

If RGB21 assets were issued or transferred using Ark’s VTXO infrastructure, the combined system could benefit from both RGB’s asset programmability and Ark’s scalable off-chain execution.

### 2. Benefits of Deploying RGB-21 on Top of Ark
Here’s how combining these technologies can be powerful:

#### 🚀 Scalability & Performance
- **Ark’s VTXOs** allow fast off-chain execution of transactions, batching them efficiently so individual operations don’t congest Bitcoin’s main chain.
- **RGB’s client-side smart contracts** still verify asset state without broadcasting every update on-chain.
- **Result**: High-throughput transfers of tokenized assets or UDAs without on-chain fees for every operation.

#### 💸 Lower Costs
- **Ark** reduces on-chain fees by batching many off-chain actions into compact settlement transactions.
- **RGB’s** model avoids unnecessary on-chain metadata, putting asset data off-chain.
- **Result**: Economic asset issuance & transfers, suitable for micro-transactions or collectibles.

#### 🔐 Security Through Bitcoin
- Both RGB and Ark rely on Bitcoin’s base layer for final settlement and security without requiring changes to Bitcoin’s protocol. Users can always claim assets or value back on Bitcoin if needed.
- **Result**: Strong security guarantees with minimal trust assumptions.

#### 👤 Self-Custody & Privacy
- **RGB** uses client-side validation, meaning asset owners validate contract state locally without broadcasting it publicly, increasing privacy.
- **Ark** users keep control of their VTXOs and retain exit paths to Bitcoin at any time.
- **Result**: User control and privacy for asset ownership and transfer data, unlike many traditional smart contract systems.

#### 🌀 Programmability + Fast UX
By combining **RGB’s programmability** (rich asset logic) with **Ark’s fast off-chain transaction layer**, developers could build apps that work similarly to Ethereum DApps but settle on Bitcoin’s price-secure and censorship-resistant base layer with much lower costs and better privacy.

### 3. What This Enables in Practice
If you deploy RGB21 assets on Ark’s infrastructure:
- **UDA Ecosystems on Bitcoin**: Create and trade UDAs with near-instant transfers using Ark’s off-chain layer but backed by RGB’s smart-asset rules.
- **Digital Asset Markets**: Build decentralized marketplaces, auctions, or fractional ownership systems that interact with Bitcoin liquidity.
- **Cross-Layer Integration**: Move tokens between Lightning, Ark, and Bitcoin L1 with reduced friction.
- **New Financial Products**: Issue tokenized real-world assets, event tickets, collectibles, or digital rights all secured by Bitcoin and moved efficiently off-chain.

### 4. Challenges to Be Aware Of
While the synergy is promising, it’s still early technology:
- **Tooling & Adoption**: Tooling for RGB and Ark is evolving. Wallets and platforms must support both standards.
- **Client-Side Validation**: Requires good local software, which differs from global state models.
- **Data Availability**: Interoperability across layers is a nuanced engineering challenge as protocols mature.

### 5. Summary
| Feature | RGB-21 on Bitcoin Alone | RGB-21 on Ark VTXO Layer |
| :--- | :--- | :--- |
| **Scalability** | Off-chain smart assets but limited by Lightning or own layer | Fast VTXO-based settlement |
| **Cost** | Reduced on-chain fees | Even lower due to batching |
| **Security** | Bitcoin base layer | Bitcoin base layer + exit guarantees |
| **Privacy** | Client-side validation | Preserved, plus fewer public proofs |
| **UX** | Depends on Lightning support | Native off-chain Ark execution |

## 10. Conclusion: Entering Bitcoin Season 3

### The Evolution of Bitcoin
**Bitcoin Season 1** established the asset as the world's premier store of value—Digital Gold.
**Bitcoin Season 2** introduced the Lightning Network, Ordinals Inscription, and meta protocols.
**Bitcoin Season 3** is the **Programmable Economy**.

### The Programmable Economy
RGB21 is more than just an NFT standard; it is a primitive for a completely new financial system. By combining valid technical privacy (Client-Side Validation) with unlimited scalability (Off-chain data) and robust security (Bitcoin L1 anchoring), we have unlocked the Holy Grail of digital assets.

### The Vision
We are moving from "Digital Gold" to "Digital Matter". Assets that are liquid, programmable, and sovereign, living directly on the most secure network in history.

### The Foundation
This infrastructure—powered by RGB, implemented by BitMask, and accessible via DIBA—lays the groundwork for the next billion users to interact with Bitcoin not just as a currency, but as the ultimate platform for truth and value. This is the future we are building. This is Bitcoin Season 3.
