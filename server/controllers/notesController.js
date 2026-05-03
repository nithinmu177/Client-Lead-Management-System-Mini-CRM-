const db = require('../config/db');

exports.getNotesByLead = async (req, res) => {
  const leadId = req.params.leadId;
  const userId = req.user.id;
  try {
    // Verify lead ownership
    const [leads] = await db.query('SELECT id FROM leads WHERE id = ? AND user_id = ?', [leadId, userId]);
    if (!leads.length) return res.status(403).json({ error: 'Access denied' });

    const [rows] = await db.query('SELECT * FROM notes WHERE lead_id = ? ORDER BY created_at DESC', [leadId]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createNote = async (req, res) => {
  const { lead_id, note } = req.body;
  const userId = req.user.id;
  try {
    // Verify lead ownership
    const [leads] = await db.query('SELECT id FROM leads WHERE id = ? AND user_id = ?', [lead_id, userId]);
    if (!leads.length) return res.status(403).json({ error: 'Access denied' });

    const [result] = await db.query('INSERT INTO notes (lead_id, note) VALUES (?,?)', [lead_id, note]);
    const [rows] = await db.query('SELECT * FROM notes WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
