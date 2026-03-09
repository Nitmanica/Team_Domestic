/**
 * TrustRoute Escrow Backend
 * Express REST API + MySQL + blockchain (ethers.js) integration.
 */
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import orderRoutes from './routes/order.js';
import escrowRoutes from './routes/escrow.js';
import deliveryRoutes from './routes/delivery.js';
import disputeRoutes from './routes/dispute.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Hackathon-friendly CORS: reflect request origin and allow local dev ports.
const allowedOrigins = new Set([
  process.env.FRONTEND_URL,
  'http://localhost:8080',
  'http://127.0.0.1:8080',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
].filter(Boolean));

app.use(cors({
  origin: (origin, cb) => {
    // allow non-browser clients (curl/postman) and same-origin
    if (!origin) return cb(null, true);
    if (allowedOrigins.has(origin)) return cb(null, true);
    return cb(null, true); // for hackathon demo; tighten in production
  },
  credentials: true,
}));
app.use(express.json());

app.use('/', authRoutes);
app.use('/', orderRoutes);
app.use('/', escrowRoutes);
app.use('/', deliveryRoutes);
app.use('/', disputeRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'trustroute-escrow-api' });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`TrustRoute Escrow API running at http://localhost:${PORT}`);
});
