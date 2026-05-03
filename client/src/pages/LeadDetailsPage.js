import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api';
import NotesSection from '../components/NotesSection';

const AVATAR_COLORS = ['#3b82f6','#10b981','#f59e0b','#8b5cf6','#ec4899','#0891b2'];
function getInitials(n){return(n||'').split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2)}
function getColor(n){let h=0;for(let i=0;i<(n||'').length;i++)h=n.charCodeAt(i)+((h<<5)-h);return AVATAR_COLORS[Math.abs(h)%AVATAR_COLORS.length]}

function srcClass(s){
  if(!s)return'default';const l=s.toLowerCase();
  if(l.includes('website'))return'website';if(l.includes('referral'))return'referral';
  if(l.includes('social'))return'social';if(l.includes('walk'))return'walk-in';return'default';
}

export default function LeadDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchLead() }, [id]); // eslint-disable-line

  async function fetchLead() {
    try {
      const res = await api.get(`/leads/${id}`);
      setLead(res.data);
    } catch {
      try { const r = await api.get('/leads'); setLead((r.data||[]).find(x=>String(x.id)===String(id))||null); } catch { setLead(null); }
    } finally { setLoading(false); }
  }

  async function changeStatus(s) {
    await api.put(`/leads/${id}`, { status: s });
    setLead(prev => ({ ...prev, status: s }));
  }

  async function handleDelete() {
    if (!window.confirm('Delete this lead and all notes?')) return;
    await api.delete(`/leads/${id}`);
    navigate('/leads');
  }

  if (loading) return <div className="page"><div className="spinner-wrap"><div className="spinner"/></div></div>;
  if (!lead) return (
    <div className="page">
      <Link to="/leads" className="breadcrumb" style={{textDecoration:'none'}}>← Back to Leads</Link>
      <div className="card card-pad" style={{textAlign:'center',padding:60}}>
        <div style={{fontSize:40}}>😕</div><h2 style={{marginTop:12}}>Lead not found</h2>
      </div>
    </div>
  );

  const created = new Date(lead.created_at);

  return (
    <div className="page fade-up">
      <div className="breadcrumb"><Link to="/leads">Leads</Link><span>›</span><span>Lead Details</span></div>

      <div className="page-head">
        <div/>
        <div style={{display:'flex',gap:8}}>
          <Link to="/leads" className="btn btn-outline btn-sm">← Back to Leads</Link>
          <button className="btn btn-danger btn-sm" onClick={handleDelete}>🗑️ Delete Lead</button>
        </div>
      </div>

      {/* Lead header card */}
      <div className="card card-pad" style={{marginBottom:20}}>
        <div className="lead-header">
          <div className="lead-avatar" style={{background:getColor(lead.name),color:'#fff',border:'none',fontSize:20}}>
            {getInitials(lead.name)}
          </div>
          <div className="lead-header-info">
            <h2>
              {lead.name}
              <select className={`status-select ${lead.status}`} value={lead.status} onChange={e=>changeStatus(e.target.value)} style={{marginLeft:8,fontSize:11}}>
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="converted">Converted</option>
              </select>
            </h2>
            <div className="lead-id">
              Lead ID: #LD-{String(lead.id).padStart(4,'0')} &nbsp;|&nbsp; 📅 Created on {created.toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'})} at {created.toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'})}
            </div>
          </div>
        </div>
      </div>

      {/* Detail grid */}
      <div className="detail-grid">
        <div>
          <div className="info-section">
            <h3>Lead Information</h3>
            <div className="info-row"><span className="ir-icon">👤</span><span className="ir-label">Full Name</span><span className="ir-value">{lead.name}</span></div>
            <div className="info-row"><span className="ir-icon">✉️</span><span className="ir-label">Email</span><span className="ir-value">{lead.email}</span></div>
            <div className="info-row"><span className="ir-icon">🌐</span><span className="ir-label">Source</span><span className="ir-value"><span className={`source-badge ${srcClass(lead.source)}`}>{lead.source||'—'}</span></span></div>
            <div className="info-row"><span className="ir-icon">🎯</span><span className="ir-label">Status</span><span className="ir-value"><span className={`status-badge ${lead.status}`}>{lead.status}</span></span></div>
          </div>
        </div>

        <NotesSection leadId={lead.id} />
      </div>
    </div>
  );
}
