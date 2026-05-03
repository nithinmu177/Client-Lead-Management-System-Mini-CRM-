const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const pool = require('../config/db');
const bcrypt = require('bcryptjs');

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const client = new OAuth2Client(GOOGLE_CLIENT_ID);
const isGoogleConfigured = !!GOOGLE_CLIENT_ID;

exports.login = (req, res) => {
  const { username, password } = req.body;
  const ADMIN_USER = process.env.ADMIN_USER || 'admin';
  const ADMIN_PASS = process.env.ADMIN_PASS || 'password';
  const JWT_SECRET = process.env.JWT_SECRET || 'change-me';
  const JWT_EXPIRES = process.env.JWT_EXPIRES || '8h';

  if (username === ADMIN_USER && password === ADMIN_PASS) {
    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
    return res.json({ token });
  }

  return res.status(401).json({ error: 'Invalid credentials' });
};

exports.register = async (req, res) => {
  const { name, email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  try {
    const hash = await bcrypt.hash(password, 10);
    const [result] = await pool.execute('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)', [name || null, email, hash]);
    const user = { id: result.insertId, email, name };
    const token = jwt.sign(user, process.env.JWT_SECRET || 'change-me', { expiresIn: process.env.JWT_EXPIRES || '8h' });
    return res.json({ token });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Registration failed' });
  }
};

exports.googleAuth = async (req, res) => {
  const { token } = req.body; // ID token from Google Identity Services
  if (!token) return res.status(400).json({ error: 'Token required' });
  if (!isGoogleConfigured) {
    if (req.body.demo) {
      console.log('Demo login requested (bypass mode)');
      const email = process.env.ADMIN_USER || 'admin@example.com';
      const name = 'Admin User';
      const jwtToken = jwt.sign({ id: 0, email, name }, process.env.JWT_SECRET || 'change-me', { expiresIn: '8h' });
      return res.json({ token: jwtToken });
    }
    return res.status(503).json({ error: 'Google sign-in is not configured on the server.' });
  }

    try {
      console.log('Verifying token with Google...');
      const ticket = await client.verifyIdToken({ idToken: token, audience: GOOGLE_CLIENT_ID });
      const payload = ticket.getPayload();
      const email = payload.email;
      const name = payload.name;
      const googleId = payload.sub;

      console.log('Google login attempt for email:', email);

      // Check if user exists or register them
      let user;
      try {
        console.log('Searching for user in DB:', email);
        const [rows] = await pool.execute('SELECT id, name, email FROM users WHERE email = ? LIMIT 1', [email]);
        if (rows.length) {
          console.log('User found:', rows[0].id);
          user = rows[0];
        } else {
          console.log('New user detected, registering...');
          const [ins] = await pool.execute('INSERT INTO users (name, email, google_id) VALUES (?, ?, ?)', [name, email, googleId]);
          user = { id: ins.insertId, name, email };
          console.log('Registration successful, new ID:', user.id);
        }
      } catch (dbErr) {
        console.error('Database error during Google auth:', dbErr.message);
        console.warn('Proceeding with transient user (id:0)');
        user = { id: 0, name, email }; // Fallback
      }

      console.log('Generating JWT for user:', user.id);
      const jwtToken = jwt.sign({ id: user.id, email: user.email, name: user.name }, process.env.JWT_SECRET || 'change-me', { expiresIn: process.env.JWT_EXPIRES || '8h' });
      return res.json({ token: jwtToken });

    } catch (err) {
      console.error('Google token verification failed:', err.message);
      return res.status(401).json({ error: 'Invalid Google token: ' + err.message });
    }
};
