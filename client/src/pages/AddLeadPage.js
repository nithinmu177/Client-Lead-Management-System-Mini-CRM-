import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';

const SOURCES = ['Website','Referral','Social Media','Cold Call','Email Campaign','Walk-in','Other'];

export default function AddLeadPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [source, setSource] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await api.post('/leads', { name, email, source: source || 'Other' });
      // If notes provided, add as first note
      if (notes.trim() && res.data?.id) {
        await api.post('/notes', { lead_id: res.data.id, note: notes.trim() });
      }
      navigate('/leads');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add lead');
    } finally { setLoading(false); }
  }

  return (
    <div className="page fade-up">
      <div className="breadcrumb"><Link to="/leads">Leads</Link><span>›</span><span>Add Lead</span></div>

      <div className="form-card" style={{maxWidth:600,margin:'0 auto'}}>
        <h2 style={{fontSize:18,fontWeight:800,marginBottom:4}}>Add New Lead</h2>
        <p style={{fontSize:13,color:'var(--muted)',marginBottom:24}}>Fill in the details below to add a new lead.</p>

        {error && <div className="error-msg">⚠ {error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name <span className="req">*</span></label>
            <div className="form-input-wrap">
              <span className="f-icon">👤</span>
              <input className="form-input has-icon" value={name} onChange={e=>setName(e.target.value)} placeholder="Enter full name" required/>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email Address <span className="req">*</span></label>
            <div className="form-input-wrap">
              <span className="f-icon">✉️</span>
              <input className="form-input has-icon" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Enter email address" required/>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Source <span className="req">*</span></label>
            <div className="form-input-wrap">
              <span className="f-icon">🌐</span>
              <select className="form-select has-icon" style={{paddingLeft:38}} value={source} onChange={e=>setSource(e.target.value)} required>
                <option value="" disabled>Select source</option>
                {SOURCES.map(s=><option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-hint">Select the source where this lead came from.</div>
          </div>

          <div className="form-group">
            <label className="form-label">Additional Notes <span style={{fontWeight:400,color:'var(--muted)'}}>(Optional)</span></label>
            <div className="form-input-wrap">
              <textarea className="form-textarea" value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Add any additional notes about this lead..." rows={4}/>
            </div>
          </div>

          <div style={{display:'flex',gap:10,marginTop:8}}>
            <Link to="/leads" className="btn btn-outline" style={{flex:1,justifyContent:'center',padding:12}}>Cancel</Link>
            <button className="btn btn-primary" type="submit" disabled={loading} style={{flex:1,justifyContent:'center',padding:12}}>
              {loading ? 'Adding…' : '👤 Add Lead'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
