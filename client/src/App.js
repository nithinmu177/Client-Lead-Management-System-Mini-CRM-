import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, NavLink, useNavigate, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Leads from './pages/Leads';
import LeadDetailsPage from './pages/LeadDetailsPage';
import AddLeadPage from './pages/AddLeadPage';
import ProtectedRoute from './components/ProtectedRoute';

const MauLogo = ({w=36}) => (
  <svg width={w} height={w} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="100" rx="20" fill="#0f1d35"/>
    <path d="M20 70V38l20 22 20-22v32" stroke="#fff" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M55 70V52a15 15 0 0130 0" stroke="#e8820c" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

function Sidebar({ open, onClose }) {
  const loc = useLocation();
  const navigate = useNavigate();
  function logout() { localStorage.removeItem('token'); navigate('/register'); onClose(); }
  const links = [
    { to: '/', icon: '🏠', label: 'Dashboard' },
    { to: '/leads', icon: '👥', label: 'Leads' },
    { to: '/new', icon: '➕', label: 'Add Lead' },
  ];
  return (
    <aside className={`sidebar ${open ? 'open' : ''}`}>
      <div className="sidebar-brand">
        <MauLogo w={36}/>
        <div className="sidebar-brand-text">MaU Digital<small>CRM</small></div>
      </div>
      <nav className="sidebar-nav">
        {links.map(l => (
          <NavLink key={l.to} to={l.to} end={l.to==='/'} className={({isActive})=>`sidebar-link ${isActive?'active':''}`} onClick={onClose}>
            <span className="icon">{l.icon}</span>{l.label}
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-footer">
        <div className="sidebar-footer-box">
          <MauLogo w={44}/>
          <p>Manage leads efficiently and convert more clients.<br/><span className="highlight">MaU Digital CRM</span></p>
        </div>
        <button className="sidebar-link" onClick={logout} style={{justifyContent:'center',color:'rgba(255,255,255,.5)',fontSize:12}}>🚪 Sign Out</button>
        <div className="sidebar-copy">© 2025 MaU Digital.<br/>All rights reserved.</div>
      </div>
    </aside>
  );
}

function AppShell({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="app-layout">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="main-area">
        <header className="topbar">
          <button className="topbar-hamburger" onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
          <div className="topbar-search">
            <span className="s-icon">🔍</span>
            <input placeholder="Search leads..." />
          </div>
          <div className="topbar-right">
            <button className="notif-btn">🔔<span className="dot"></span></button>
            <div className="admin-pill">
              <div className="admin-avatar">
                {(() => {
                  const token = localStorage.getItem('token');
                  if (token) {
                    try {
                      const base64Url = token.split('.')[1];
                      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                      const payload = JSON.parse(atob(base64));
                      return (payload.name || payload.username || 'AD').substring(0, 2).toUpperCase();
                    } catch (e) { return 'AD'; }
                  }
                  return 'AD';
                })()}
              </div>
              <span className="admin-name">
                {(() => {
                  const token = localStorage.getItem('token');
                  if (token) {
                    try {
                      const base64Url = token.split('.')[1];
                      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                      const payload = JSON.parse(atob(base64));
                      return payload.name || payload.username || 'Admin';
                    } catch (e) { return 'Admin'; }
                  }
                  return 'Admin';
                })()} ▾
              </span>
            </div>
          </div>
        </header>
        {children}
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<ProtectedRoute><AppShell><Dashboard /></AppShell></ProtectedRoute>} />
        <Route path="/leads" element={<ProtectedRoute><AppShell><Leads /></AppShell></ProtectedRoute>} />
        <Route path="/leads/:id" element={<ProtectedRoute><AppShell><LeadDetailsPage /></AppShell></ProtectedRoute>} />
        <Route path="/new" element={<ProtectedRoute><AppShell><AddLeadPage /></AppShell></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
