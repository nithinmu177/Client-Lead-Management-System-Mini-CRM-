const db = require('../config/db');

exports.getAllLeads = async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await db.query('SELECT * FROM leads WHERE user_id = ? ORDER BY created_at DESC', [userId]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getLeadById = async (req, res) => {
  const id = req.params.id;
  const userId = req.user.id;
  try {
    const [rows] = await db.query('SELECT * FROM leads WHERE id = ? AND user_id = ?', [id, userId]);
    if (!rows.length) return res.status(404).json({ error: 'Lead not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createLead = async (req, res) => {
  const { name, email, source } = req.body;
  const userId = req.user.id;
  if (!name || !email) return res.status(400).json({ error: 'Name and email are required' });
  try {
    const [result] = await db.query(
      'INSERT INTO leads (user_id, name, email, source) VALUES (?,?,?,?)',
      [userId, name, email, source || null]
    );
    const [rows] = await db.query('SELECT * FROM leads WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateLead = async (req, res) => {
  const id = req.params.id;
  const userId = req.user.id;
  const { status } = req.body;
  const allowed = ['new', 'contacted', 'converted'];
  if (!allowed.includes(status)) return res.status(400).json({ error: 'Invalid status' });
  try {
    const [result] = await db.query('UPDATE leads SET status = ? WHERE id = ? AND user_id = ?', [status, id, userId]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Lead not found or unauthorized' });
    const [rows] = await db.query('SELECT * FROM leads WHERE id = ?', [id]);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteLead = async (req, res) => {
  const id = req.params.id;
  const userId = req.user.id;
  try {
    const [result] = await db.query('DELETE FROM leads WHERE id = ? AND user_id = ?', [id, userId]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Lead not found or unauthorized' });
    res.json({ message: 'Lead deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
