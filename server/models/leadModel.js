// Simple model helpers for leads - optional layer
const db = require('../config/db');

exports.findById = async (id) => {
  const [rows] = await db.query('SELECT * FROM leads WHERE id = ?', [id]);
  return rows[0];
};

exports.create = async (name, email, source) => {
  const [result] = await db.query('INSERT INTO leads (name, email, source) VALUES (?,?,?)', [name, email, source]);
  return exports.findById(result.insertId);
};
