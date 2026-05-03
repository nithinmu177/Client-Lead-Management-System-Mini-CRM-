import React, { useEffect, useState } from 'react';
import api from '../api';
import { Link } from 'react-router-dom';

export default function LeadList() {
  const [leads, setLeads] = useState([]);

  useEffect(() => {
    fetchLeads();
  }, []);

  async function fetchLeads() {
    const res = await api.get('/leads');
    setLeads(res.data);
  }

  async function deleteLead(id) {
    await api.delete(`/leads/${id}`);
    fetchLeads();
  }

  return (
    <div>
      <h2>Leads</h2>
      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Source</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((l) => (
            <tr key={l.id}>
              <td><Link to={`/leads/${l.id}`}>{l.name}</Link></td>
              <td>{l.email}</td>
              <td>{l.source}</td>
              <td>{l.status}</td>
              <td>
                <button onClick={() => deleteLead(l.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
