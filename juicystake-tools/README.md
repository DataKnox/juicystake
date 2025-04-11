# JuicyStake Tools

A standalone version of the JuicyStake tools page for managing Solana stake accounts.

## Prerequisites

- Node.js 18 or later
- Docker (optional, for containerized deployment)

## Local Development

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

The application will be available at http://localhost:3000

## Docker Deployment

1. Build the Docker image:
```bash
docker build -t juicystake-tools .
```

2. Run the container:
```bash
docker run -p 80:80 juicystake-tools
```

The application will be available at http://localhost

## Features

- Connect Solana wallet
- View stake accounts
- Stake SOL
- Unstake SOL
- Merge stake accounts
- Split stake accounts
- Transfer stake accounts
- Instant unstake

## Environment Variables

The following environment variables can be configured:

- `REACT_APP_SOLANA_RPC_ENDPOINT`: Solana RPC endpoint (default: https://cherise-ldxzh0-fast-mainnet.helius-rpc.com) 