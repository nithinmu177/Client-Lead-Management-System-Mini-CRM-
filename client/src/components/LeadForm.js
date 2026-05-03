import React, { useState } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';

export default function LeadForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [source, setSource] = useState('website');
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    await api.post('/leads', { name, email, source });
    navigate('/');
  }

  return (
    <div>
      <h2>Add Lead</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Name</label>
          <br />
          <input value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div>
          <label>Email</label>
          <br />
          <input value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label>Source</label>
          <br />
          <input value={source} onChange={(e) => setSource(e.target.value)} />
        </div>
        <button type="submit">Add</button>
      </form>
    </div>
  );
}
