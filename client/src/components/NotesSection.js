import React, { useEffect, useState } from 'react';
import api from '../api';

function getNoteIcon(text) {
  const t = text.toLowerCase();
  if (t.includes('call')) return { icon: '📞', cls: 'call' };
  if (t.includes('follow') || t.includes('demo') || t.includes('meeting')) return { icon: '📅', cls: 'follow' };
  if (t.includes('added') || t.includes('system')) return { icon: '⚙️', cls: 'system' };
  return { icon: '📝', cls: 'default' };
}

export default function NotesSection({ leadId }) {
  const [notes, setNotes] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchNotes();
  }, [leadId]); // eslint-disable-line

  async function fetchNotes() {
    try {
      const res = await api.get(`/notes/${leadId}`);
      setNotes(res.data || []);
    } catch {
      setNotes([]);
    } finally {
      setLoading(false);
    }
  }

  async function addNote(e) {
    e.preventDefault();
    if (!text.trim()) return;
    setSaving(true);
    try {
      await api.post('/notes', { lead_id: leadId, note: text.trim() });
      setText('');
      await fetchNotes();
    } catch (err) {
      alert('Failed to add note');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="notes-section fade-up">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3 style={{ margin: 0 }}>Notes & Follow-ups</h3>
      </div>

      <div className="note-input-area">
        <textarea
          placeholder="Write a note... (e.g., Called client, Follow-up scheduled)"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <div className="note-input-footer">
          <button
            className="btn btn-primary btn-sm"
            onClick={addNote}
            disabled={saving || !text.trim()}
          >
            {saving ? 'Adding...' : 'Add Note'}
          </button>
        </div>
      </div>

      <div className="notes-timeline">
        {loading ? (
          <div className="spinner-wrap" style={{ padding: 20 }}>
            <div className="spinner" />
          </div>
        ) : notes.length === 0 ? (
          <div className="empty-state" style={{ padding: '20px 0' }}>
            <div className="empty-icon" style={{ fontSize: 24 }}>🗒️</div>
            <div className="empty-title" style={{ fontSize: 13 }}>No notes found</div>
          </div>
        ) : (
          notes.map((n) => {
            const info = getNoteIcon(n.note);
            return (
              <div key={n.id} className="note-item">
                <div className={`note-icon ${info.cls}`}>{info.icon}</div>
                <div className="note-body">
                  <div className="note-text">{n.note}</div>
                  <div className="note-meta">
                    Admin • {new Date(n.created_at).toLocaleString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div style={{ marginTop: 16, textAlign: 'center' }}>
        <button className="btn btn-outline btn-sm" style={{ width: '100%' }}>View All Notes</button>
      </div>
    </div>
  );
}
