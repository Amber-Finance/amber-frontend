# Bitcoin Outpost Monorepo

This is a Turborepo monorepo containing the Bitcoin Outpost applications.

## What's inside?

This Turborepo includes the following apps:

### Apps

- `app`: The main Bitcoin Outpost application (Next.js) - Bitcoin DeFi lending and borrowing platform
- `landing`: Landing page for Bitcoin Outpost (Next.js) - Marketing and information site
- `docs`: Documentation site using Nextra (Next.js + Nextra) - User guides and API documentation

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm

### Installation

```bash
# Install dependencies
pnpm install
```

### Development

```bash
# Start all apps in development mode
pnpm dev

# Start a specific app
pnpm dev --filter=@bitcoin-outpost/app
pnpm dev --filter=@bitcoin-outpost/landing
pnpm dev --filter=@bitcoin-outpost/docs
```

### Build

```bash
# Build all apps
pnpm build

# Build a specific app
pnpm build --filter=@bitcoin-outpost/app
```

### Other Commands

```bash
# Lint all apps
pnpm lint

# Type check all apps
pnpm type-check

# Clean all build artifacts
pnpm clean
```

## App URLs

When running in development mode:

- Main App: http://localhost:3000
- Landing Page: http://localhost:3001
- Documentation: http://localhost:3002

## Learn More

To learn more about Turborepo, take a look at the following resources:

- [Turborepo Documentation](https://turbo.build/repo/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Nextra Documentation](https://nextra.site/)
