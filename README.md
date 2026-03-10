# TrustRoute Escrow – Smart Contract-Based Escrow for Transportation Apps

Hackathon-ready full-stack: **React frontend** + **Node.js/Express backend** + **MySQL** + **Ethereum (Hardhat) escrow contract** + **ethers.js** integration.

---

## Quick start (local)

### 1. MySQL

Create a database and run migrations:

```bash
# Create DB (mysql client or MySQL Workbench)
mysql -u root -p -e "CREATE DATABASE trustroute_escrow;"

# Backend: init schema
cd backend && npm install && node config/initDb.js
# Optional: seed demo users (customer, driver, admin – password: password123)
node config/seedDb.js
```

### 2. Backend

```bash
cd backend
cp .env.example .env   # edit .env with your PG and optional blockchain vars
npm run dev
# API: http://localhost:3001
```

**Demo mode:** If you omit `ESCROW_WALLET_PRIVATE_KEY` and `ESCROW_CONTRACT_ADDRESS`, the API runs without blockchain: lock/release are recorded in DB only.

### 3. Smart contract (optional, for real escrow)

```bash
cd smart-contract
npm install
npx hardhat compile

# Local chain (separate terminal)
npx hardhat node

# Deploy (another terminal)
npx hardhat run scripts/deploy.js --network localhost
# Copy printed ESCROW_CONTRACT_ADDRESS into backend/.env
# Fund the backend wallet (ESCROW_WALLET_PRIVATE_KEY) with ETH on that network for lockPayment.
```

For Sepolia:

```bash
# Set ETH_RPC_URL and ESCROW_WALLET_PRIVATE_KEY in backend .env
npx hardhat run scripts/deploy.js --network sepolia
```

### 4. Frontend

```bash
# from repo root
cp .env.example .env   # optional; VITE_API_URL defaults to http://localhost:3001
npm install
npm run dev
# App: http://localhost:8080
```

**Flows:** Landing → **Login** (or Register as Customer/Driver) → Customer: Book Delivery → Escrow Payment (lock) → Driver: Accept → Upload proof → Customer can confirm delivery; admin can resolve disputes.

---

## API overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/register` | Register (customer, driver, admin) |
| POST | `/login` | Login |
| POST | `/order` | Create order (auth) |
| GET | `/order/:orderId` | Get order |
| GET | `/orders/customer` | My orders (customer) |
| GET | `/orders/driver` | My orders (driver) |
| GET | `/orders/available` | Available for drivers |
| PATCH | `/order/:orderId/accept` | Driver accept |
| POST | `/escrow/lock` | Lock payment (body: `order_id`) |
| POST | `/escrow/release` | Release to driver |
| POST | `/delivery/proof` | Driver upload proof |
| POST | `/delivery/confirm` | Customer confirm delivery |
| POST | `/dispute` | Create dispute |
| GET | `/disputes` | List disputes |
| POST | `/admin/dispute/resolve` | Admin resolve (body: `dispute_id`, `resolution`, etc.) |

All authenticated routes use header: `Authorization: Bearer <token>`.

---

## Project layout

```
backend/           # Express API
      config/          # DB pool, initDb, seedDb (MySQL)
  controllers/
  middleware/      # auth
  models/
  routes/
  services/        # blockchain (ethers.js)
  server.js

smart-contract/
  contracts/Escrow.sol
  scripts/deploy.js
  hardhat.config.js

src/               # Vite + React frontend
  contexts/AuthContext.tsx
  lib/api.ts       # API client
  pages/           # Customer, Driver, Admin, Login, Escrow, Book
```

---

## Demo users (after seed)

| Email | Password | Role |
|-------|----------|------|
| customer@trustroute.com | password123 | Customer |
| driver@trustroute.com | password123 | Driver |
| admin@trustroute.com | password123 | Admin |

---

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS



