import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

const COLORS = ['#3b82f6','#10b981','#f59e0b','#8b5cf6','#6b7280'];
const AVATAR_COLORS = ['#3b82f6','#10b981','#f59e0b','#8b5cf6','#ec4899','#0891b2'];
function getInitials(n){return(n||'').split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2)}
function getColor(n){let h=0;for(let i=0;i<(n||'').length;i++)h=n.charCodeAt(i)+((h<<5)-h);return AVATAR_COLORS[Math.abs(h)%AVATAR_COLORS.length]}
function ago(d){const ms=Date.now()-new Date(d).getTime();const m=Math.floor(ms/60000);if(m<1)return'just now';if(m<60)return m+' min ago';const h=Math.floor(m/60);if(h<24)return h+' hour'+(h>1?'s':'')+' ago';return Math.floor(h/24)+' day'+(Math.floor(h/24)>1?'s':'')+' ago'}

function MiniChart({data,color}){
  if(!data||!data.length) return null;
  const max=Math.max(...data,1);
  const pts=data.map((v,i)=>`${(i/(data.length-1))*280},${48-((v/max)*44)}`).join(' ');
  return <svg width="100%" height="50" viewBox="0 0 280 50"><polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
}

function PieChart({slices}){
  const total=slices.reduce((a,s)=>a+s.value,0)||1;
  let cum=0;
  return(
    <svg width="140" height="140" viewBox="0 0 140 140">
      {slices.map((s,i)=>{
        const pct=s.value/total;const start=cum;cum+=pct;
        const a1=start*2*Math.PI-Math.PI/2;const a2=(start+pct)*2*Math.PI-Math.PI/2;
        const la=pct>.5?1:0;
        const d=`M70 70 L${70+55*Math.cos(a1)} ${70+55*Math.sin(a1)} A55 55 0 ${la} 1 ${70+55*Math.cos(a2)} ${70+55*Math.sin(a2)} Z`;
        return <path key={i} d={d} fill={s.color}/>
      })}
      <circle cx="70" cy="70" r="30" fill="#fff"/>
    </svg>
  );
}

export default function Dashboard() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/leads').then(r => setLeads(r.data || [])).catch(()=>{}).finally(() => setLoading(false));
  }, []);

  const total=leads.length;
  const newC=leads.filter(l=>l.status==='new').length;
  const cont=leads.filter(l=>l.status==='contacted').length;
  const conv=leads.filter(l=>l.status==='converted').length;

  const srcMap={};
  leads.forEach(l=>{const s=(l.source||'Other');srcMap[s]=(srcMap[s]||0)+1});
  const srcSlices=Object.entries(srcMap).map(([name,value],i)=>({name,value,color:COLORS[i%COLORS.length]}));

  // Mini sparkline data (fake trend from last 7 days counts)
  const now=Date.now();
  const dayBuckets=[0,0,0,0,0,0,0];
  leads.forEach(l=>{const d=Math.floor((now-new Date(l.created_at).getTime())/(86400000));if(d<7)dayBuckets[6-d]++});

  const recent=leads.slice(0,5);

  if(loading)return <div className="page"><div className="spinner-wrap"><div className="spinner"/></div></div>;

  return(
    <div className="page fade-up">
      <div className="page-head">
        <div>
          <h1 className="page-title">
            Welcome back, {(() => {
              const token = localStorage.getItem('token');
              if (token) {
                try {
                  const base64Url = token.split('.')[1];
                  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                  const payload = JSON.parse(atob(base64));
                  return payload.name || payload.username || 'User';
                } catch (e) { return 'User'; }
              }
              return 'User';
            })()}! 👋
          </h1>
          <p className="page-sub">Here's what's happening with your leads today.</p>
        </div>
      </div>

      {/* STATS */}
      <div className="stats-row">
        {[
          {label:'Total Leads',val:total,sub:'All time leads',icon:'👥',cls:'blue',data:dayBuckets,clr:'#3b82f6'},
          {label:'New Leads',val:newC,sub:'This week',icon:'✨',cls:'green',data:dayBuckets.map(v=>Math.round(v*.4)),clr:'#10b981'},
          {label:'Contacted',val:cont,sub:'This week',icon:'📞',cls:'orange',data:dayBuckets.map(v=>Math.round(v*.3)),clr:'#f59e0b'},
          {label:'Converted',val:conv,sub:'This week',icon:'✅',cls:'purple',data:dayBuckets.map(v=>Math.round(v*.2)),clr:'#8b5cf6'},
        ].map(s=>(
          <div className="stat-card" key={s.label}>
            <div className={`stat-icon-box ${s.cls}`}>{s.icon}</div>
            <div style={{flex:1}}>
              <div className="stat-val">{s.val}</div>
              <div className="stat-label">{s.sub}</div>
              <MiniChart data={s.data} color={s.clr}/>
            </div>
          </div>
        ))}
      </div>

      {/* CHARTS */}
      <div className="charts-row">
        <div className="chart-card">
          <div className="chart-head">
            <div className="chart-title">📈 Leads Overview</div>
            <select className="status-select" style={{fontSize:11,padding:'4px 24px 4px 8px'}}>
              <option>Last 7 Days</option>
            </select>
          </div>
          <div style={{height:160}}>
            {dayBuckets.some(v=>v>0)?(
              <svg width="100%" height="160" viewBox="0 0 500 160" preserveAspectRatio="none">
                {/* Grid lines */}
                {[0,40,80,120].map(y=><line key={y} x1="0" y1={y} x2="500" y2={y} stroke="#e4e8f0" strokeWidth="0.5"/>)}
                {/* Area */}
                <polygon points={`0,160 ${dayBuckets.map((v,i)=>`${(i/6)*500},${160-((v/Math.max(...dayBuckets,1))*130)}`).join(' ')} 500,160`} fill="rgba(59,130,246,0.08)"/>
                {/* Line */}
                <polyline points={dayBuckets.map((v,i)=>`${(i/6)*500},${160-((v/Math.max(...dayBuckets,1))*130)}`).join(' ')} fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                {/* Dots */}
                {dayBuckets.map((v,i)=><circle key={i} cx={(i/6)*500} cy={160-((v/Math.max(...dayBuckets,1))*130)} r="4" fill="#3b82f6" stroke="#fff" strokeWidth="2"/>)}
              </svg>
            ):<div className="chart-placeholder">Add leads to see chart data</div>}
          </div>
        </div>
        <div className="chart-card">
          <div className="chart-head"><div className="chart-title">🥧 Leads by Source</div></div>
          {srcSlices.length>0?(
            <div style={{display:'flex',alignItems:'center',gap:20}}>
              <PieChart slices={srcSlices}/>
              <div className="pie-legend">
                {srcSlices.map(s=>(
                  <div className="pie-legend-item" key={s.name}>
                    <span className="pie-dot" style={{background:s.color}}/>
                    <span style={{flex:1}}>{s.name}</span>
                    <span style={{fontWeight:600}}>{Math.round((s.value/total)*100)}% ({s.value})</span>
                  </div>
                ))}
              </div>
            </div>
          ):<div className="chart-placeholder" style={{height:140}}>No source data yet</div>}
        </div>
      </div>

      {/* RECENT + FOLLOWUPS */}
      <div className="dual-row">
        <div className="list-card">
          <div className="list-head"><h3>Recent Leads</h3><Link to="/leads">View All</Link></div>
          {recent.length===0?<div className="empty-state" style={{padding:30}}><div className="empty-title">No leads yet</div></div>:
            recent.map(l=>(
              <Link to={`/leads/${l.id}`} key={l.id} className="list-item" style={{textDecoration:'none'}}>
                <div className="list-avatar" style={{background:getColor(l.name)}}>{getInitials(l.name)}</div>
                <div className="list-info">
                  <div className="name">{l.name}</div>
                  <div className="email">{l.email}</div>
                </div>
                <span className={`status-badge ${l.status}`} style={{fontSize:10}}>{l.status}</span>
                <span className="list-time">{ago(l.created_at)}</span>
              </Link>
            ))
          }
        </div>
        <div className="list-card">
          <div className="list-head"><h3>Upcoming Follow-ups</h3><Link to="/leads">View All</Link></div>
          {leads.filter(l=>l.status==='contacted').length===0?
            <div className="empty-state" style={{padding:30}}><div className="empty-title">No follow-ups</div></div>:
            leads.filter(l=>l.status==='contacted').slice(0,5).map(l=>(
              <Link to={`/leads/${l.id}`} key={l.id} className="list-item" style={{textDecoration:'none'}}>
                <div className="followup-icon">📋</div>
                <div className="fu-info">
                  <div className="fu-name">{l.name}</div>
                  <div className="fu-type">Follow-up Call</div>
                </div>
                <span className="list-time">📅 {new Date(l.created_at).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</span>
              </Link>
            ))
          }
        </div>
      </div>
    </div>
  );
}
