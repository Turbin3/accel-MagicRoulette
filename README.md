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

#### Program

1. Resync your program id

```bash
anchor keys sync
```

2. Build program

```bash
anchor build
```

3. Run tests

```bash
bun test
```

5. Deploy program

```bash
anchor deploy
```

6. Optionally initialize IDL

```bash
anchor idl init -f target/idl/magic-roulette.json <PROGRAM_ID>
```