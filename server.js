const express = require('express');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
const PORT = 3000;
const SECRET = 'supersecret';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Hardcoded users
const users = [
  { username: 'guest', password: 'guest123', role: 'guest' },
  { username: 'admin', password: 'X9k#mP2$vL8@qR5!', role: 'admin' }
];

// POST /login
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  const user = users.find(u => u.username === username && u.password === password);

  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // Generate JWT with HS256
  const token = jwt.sign(
    { username: user.username, role: user.role },
    SECRET,
    { algorithm: 'HS256' }
  );

  res.json({ token });
});

// Vulnerable JWT middleware
function vulnerableJWTCheck(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.substring(7);

  try {
    // VULNERABLE: Manual JWT parsing with alg: none bypass
    const parts = token.split('.');
    
    if (parts.length !== 3) {
      return res.status(401).json({ error: 'Invalid token format' });
    }

    const header = JSON.parse(Buffer.from(parts[0], 'base64').toString());
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());

    // TODO: remove debug logging before production
    console.log('[DEBUG] Token header:', header);
    console.log('[DEBUG] Token payload:', payload);

    // CRITICAL VULNERABILITY: Check algorithm from header
    if (header.alg === 'none') {
      // Skip signature verification entirely!
      console.log('[DEBUG] Algorithm is "none" - skipping verification');
      req.user = payload;
      return next();
    }

    if (header.alg === 'HS256') {
      // Verify signature normally
      const verified = jwt.verify(token, SECRET, { algorithms: ['HS256'] });
      req.user = verified;
      return next();
    }

    return res.status(401).json({ error: 'Unsupported algorithm' });

  } catch (err) {
    console.log('[DEBUG] Token verification error:', err.message);
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// GET /dashboard
app.get('/dashboard', vulnerableJWTCheck, (req, res) => {
  if (req.user.role === 'guest') {
    return res.json({ message: 'Welcome guest. Nothing to see here.' });
  }

  if (req.user.role === 'admin') {
    return res.json({ message: 'Welcome to the dashboard.' });
  }

  res.status(403).json({ error: 'Unknown role' });
});

// GET /admin/flag
app.get('/admin/flag', vulnerableJWTCheck, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admins only.' });
  }

  // FLAG: TRACECTF{sl3pt_0n_k3yb04rd_g0t_f14g}
  res.json({ flag: 'TRACECTF{sl3pt_0n_k3yb04rd_g0t_f14g}' });
});

app.listen(PORT, () => {
  console.log(`[*] The Broken Gatekeeper is running on http://localhost:${PORT}`);
  console.log('[*] CTF Challenge: Can you access the admin flag as a guest?');
});
