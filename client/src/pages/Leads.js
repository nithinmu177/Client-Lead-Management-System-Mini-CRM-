import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

const PER_PAGE = 10;
const SOURCES = ['All Sources','Website','Referral','Social Media','Cold Call','Email Campaign','Walk-in','Other'];
const STATUSES = ['All Status','new','contacted','converted'];

function srcClass(s){
  if(!s)return'default';
  const l=s.toLowerCase();
  if(l.includes('website'))return'website';
  if(l.includes('referral')||l.includes('reference'))return'referral';
  if(l.includes('social'))return'social';
  if(l.includes('walk'))return'walk-in';
  if(l.includes('email'))return'email';
  if(l.includes('cold'))return'cold';
  return'default';
}

export default function Leads() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [srcFilter, setSrcFilter] = useState('All Sources');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [page, setPage] = useState(1);

  useEffect(() => { api.get('/leads').then(r=>setLeads(r.data||[])).catch(()=>{}).finally(()=>setLoading(false)) }, []);

  async function changeStatus(id, status) {
    await api.put(`/leads/${id}`, { status });
    setLeads(prev => prev.map(l => l.id===id ? {...l, status} : l));
  }

  async function deleteLead(id) {
    if (!window.confirm('Delete this lead?')) return;
    await api.delete(`/leads/${id}`);
    setLeads(prev => prev.filter(l => l.id !== id));
  }

  function reset(){setSearch('');setSrcFilter('All Sources');setStatusFilter('All Status');setPage(1)}

  const filtered = leads
    .filter(l => srcFilter==='All Sources' || l.source===srcFilter)
    .filter(l => statusFilter==='All Status' || l.status===statusFilter)
    .filter(l => !search || [l.name,l.email,l.source].join(' ').toLowerCase().includes(search.toLowerCase()));

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paged = filtered.slice((page-1)*PER_PAGE, page*PER_PAGE);

  return (
    <div className="page fade-up">
      <div className="page-head">
        <div>
          <h1 className="page-title">Leads</h1>
          <p className="page-sub">Manage and track all your leads in one place.</p>
        </div>
        <div style={{display:'flex',gap:8}}>
          <button className="btn btn-outline btn-sm">📥 Export</button>
          <Link to="/new" className="btn btn-primary">➕ Add New Lead</Link>
        </div>
      </div>

      {/* FILTERS */}
      <div className="filter-bar">
        <div className="search-wrap">
          <span className="si">🔍</span>
          <input placeholder="Search by name, email or source..." value={search} onChange={e=>{setSearch(e.target.value);setPage(1)}}/>
        </div>
        <select className="form-select" style={{width:160,padding:'9px 30px 9px 12px'}} value={srcFilter} onChange={e=>{setSrcFilter(e.target.value);setPage(1)}}>
          {SOURCES.map(s=><option key={s}>{s}</option>)}
        </select>
        <select className="form-select" style={{width:140,padding:'9px 30px 9px 12px'}} value={statusFilter} onChange={e=>{setStatusFilter(e.target.value);setPage(1)}}>
          {STATUSES.map(s=><option key={s} value={s}>{s==='All Status'?s:s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
        </select>
        <button className="btn btn-outline btn-sm" onClick={reset}>🔄 Reset</button>
      </div>

      {loading ? <div className="spinner-wrap"><div className="spinner"/></div> : (
        <div className="table-card">
          {filtered.length === 0 ? (
            <div className="empty-state"><div className="empty-icon">📭</div><div className="empty-title">No leads found</div><div className="empty-sub">{search?'Try a different search.': <Link to="/new" style={{color:'var(--accent)',fontWeight:600}}>Add your first lead</Link>}</div></div>
          ) : (
            <>
              <table>
                <thead>
                  <tr>
                    <th>#</th><th>Name ↕</th><th>Email</th><th>Source ↕</th><th>Status ↕</th><th>Date Added ↕</th><th style={{textAlign:'center'}}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.map((l, idx) => (
                    <tr key={l.id}>
                      <td style={{color:'var(--muted)',fontWeight:600}}>{(page-1)*PER_PAGE+idx+1}</td>
                      <td className="lead-name"><Link to={`/leads/${l.id}`}>{l.name}</Link></td>
                      <td style={{color:'var(--muted)'}}>{l.email}</td>
                      <td><span className={`source-badge ${srcClass(l.source)}`}>{l.source||'—'}</span></td>
                      <td>
                        <select className={`status-select ${l.status}`} value={l.status} onChange={e=>changeStatus(l.id,e.target.value)}>
                          <option value="new">New</option>
                          <option value="contacted">Contacted</option>
                          <option value="converted">Converted</option>
                        </select>
                      </td>
                      <td style={{color:'var(--muted)',fontSize:12}}>{new Date(l.created_at).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</td>
                      <td>
                        <div style={{display:'flex',gap:6,justifyContent:'center'}}>
                          <Link to={`/leads/${l.id}`} className="btn-icon" title="View">👁️</Link>
                          <button className="btn-icon danger" title="Delete" onClick={()=>deleteLead(l.id)}>🗑️</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="pagination">
                <span>Showing {(page-1)*PER_PAGE+1} to {Math.min(page*PER_PAGE,filtered.length)} of {filtered.length} leads</span>
                <div style={{display:'flex',alignItems:'center',gap:12}}>
                  <div className="pagination-btns">
                    <button onClick={()=>setPage(1)} disabled={page===1}>«</button>
                    <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1}>‹</button>
                    {Array.from({length:Math.min(5,totalPages)},(_,i)=>{
                      let p;
                      if(totalPages<=5) p=i+1;
                      else if(page<=3) p=i+1;
                      else if(page>=totalPages-2) p=totalPages-4+i;
                      else p=page-2+i;
                      return <button key={p} className={p===page?'active':''} onClick={()=>setPage(p)}>{p}</button>
                    })}
                    <button onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages}>›</button>
                    <button onClick={()=>setPage(totalPages)} disabled={page===totalPages}>»</button>
                  </div>
                  <span style={{fontSize:11,color:'var(--muted)'}}>Rows per page: {PER_PAGE}</span>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
