import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api';
import NotesSection from './NotesSection';

export default function LeadDetails() {
  const { id } = useParams();
  const [lead, setLead] = useState(null);

  useEffect(() => {
    fetchLead();
  }, [id]);

  async function fetchLead() {
    const res = await api.get('/leads');
    const item = res.data.find((r) => String(r.id) === String(id));
    setLead(item);
  }

  async function updateStatus(newStatus) {
    await api.put(`/leads/${id}`, { status: newStatus });
    fetchLead();
  }

  if (!lead) return <div>Loading...</div>;

  return (
    <div>
      <h2>{lead.name}</h2>
      <p><strong>Email:</strong> {lead.email}</p>
      <p><strong>Source:</strong> {lead.source}</p>
      <p>
        <strong>Status:</strong>{' '}
        <select value={lead.status} onChange={(e) => updateStatus(e.target.value)}>
          <option value="new">new</option>
          <option value="contacted">contacted</option>
          <option value="converted">converted</option>
        </select>
      </p>

      <NotesSection leadId={lead.id} />
    </div>
  );
}
