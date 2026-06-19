# DhreamPay

A secure web-based Visa Card and VIP Transaction Reconciliation and Settlement System for banking operations.

## Tech Stack

- **Frontend**: Next.js 14 (App Router)
- **Backend**: Node.js with Express
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS
- **Deployment**: Railway

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
cp .env.example .env
```

4. Run database migrations:

```bash
npx prisma migrate dev
```

5. Start the development server:

```bash
npm run dev
```

## Project Structure

```
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Authentication pages (login)
│   ├── (dashboard)/       # Protected dashboard pages
│   └── api/               # API route handlers
├── components/             # Reusable React components
│   ├── ui/               # Generic UI elements
│   ├── layout/           # Navbar, sidebar, header
│   ├── reconciliation/   # Reconciliation components
│   ├── dashboard/        # Dashboard widgets and charts
│   └── vip/              # VIP transaction components
├── lib/                   # Utility functions and configurations
│   ├── prisma/           # Prisma client instance
│   ├── auth/             # NextAuth configuration
│   ├── reconciliation/   # Core reconciliation engine logic
│   └── utils/            # Helper functions
├── prisma/               # Database schema and migrations
├── types/                # TypeScript type definitions
├── hooks/                # Custom React hooks
└── constants/            # App-wide constants and enums
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio

## Roles

- **ADMIN**: Full system access
- **RECONCILIATION_OFFICER**: Manage transaction reconciliation
- **VIP_DESK**: Handle VIP transactions
- **AUDITOR**: View-only access for auditing

## Security

All API routes are protected and require authentication.