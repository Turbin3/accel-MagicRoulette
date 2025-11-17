# Magic Roulette

Perpetual roulette game for [Turbin3 Accelerated Builders Cohort](https://turbin3.org/).

[Source Repository](https://github.com/Turbin3/accel-MagicRoulette)

## Built With

### Languages

- [![Rust](https://img.shields.io/badge/Rust-f75008?style=for-the-badge&logo=rust)](https://www.rust-lang.org/)
- [![TypeScript](https://img.shields.io/badge/TypeScript-ffffff?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
- [![React](https://img.shields.io/badge/React-23272f?style=for-the-badge&logo=react)](https://react.dev/)

### Test Runner

- [![Bun](https://img.shields.io/badge/Bun-000?style=for-the-badge&logo=bun)](https://bun.sh/)

## Architecture Diagram

### Account Relationship Diagram

![Account Relationship Diagram](./architecture_diagrams/account_relationship_diagram.png)

### Initialize Table

![Initialize Table](./architecture_diagrams/initialize_table.png)

### Place Bet

![Place Bet](./architecture_diagrams/place_bet.png)

### Spin Roulette

![Spin Roulette](./architecture_diagrams/spin_roulette.png)

### Advance Round

![Advance Round](./architecture_diagrams/advance_round.png)

### Claim Winnings

![Claim Winnings](./architecture_diagrams/claim_winnings.png)

### Update Table

![Update Table](./architecture_diagrams/update_table.png)

### Withdraw Vault

![Withdraw Vault](./architecture_diagrams/withdraw_vault.png)

## Getting Started

### Prerequisites

1. Update your Solana CLI, avm and Bun toolkit

```bash
agave-install init 2.1.0
avm use 0.31.1
bun upgrade
```

### Setup

1. Clone repository

```bash
git clone https://github.com/Turbin3/accel-MagicRoulette.git
```

2. Install dependencies

```bash
bun i
```

3. Configure .env file

```bash
cp .env.example .env
```

#### Program

1. Resync your program ID

```bash
anchor keys sync
```

2. Build program

```bash
anchor build
```

#### Deployment

1. Create and fund keypair

```bash
solana-keygen new -o magic-roulette-wallet.json
```

> [!NOTE]  
> About 5 SOL is required for program deployment and funding accounts used in testing, which will be defunded at the end of every test.

2. Deploy program

```bash
bun run deploy
```

3. Optionally initialize IDL

```bash
bun run idl:init
```

#### Testing

Run tests against devnet cluster. Requires program to be first deployed.

```bash
bun run test
```

> [!NOTE]  
> Run `bun run reset; bun run test` to run 'hot-reloading' tests.