import React, { useState, useEffect, useRef } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';

const MauLogo = ({w=80}) => (
  <svg width={w} height={w} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 78V30l25 28 25-28v48" stroke="#0f1d35" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M52 78V55a18 18 0 0136 0" stroke="#e8820c" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const MauLogoWhite = ({w=160}) => (
  <svg width={w} height={w*.7} viewBox="0 0 200 140" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M30 110V45l35 40 35-40v65" stroke="#fff" strokeWidth="11" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M90 110V82a22 22 0 0144 0" stroke="#e8820c" strokeWidth="11" strokeLinecap="round" strokeLinejoin="round"/>
    <text x="20" y="135" fill="#fff" fontSize="20" fontWeight="800" fontFamily="Inter,sans-serif">MaU Digital</text>
  </svg>
);

export default function Login() {
  const googleButtonRef = useRef(null);
  const googleInitializedRef = useRef(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const navigate = useNavigate();
  const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID || '';
  const isGoogleConfigured = !!googleClientId;

  useEffect(() => {
    /* global google */
    if (!isGoogleConfigured) {
      return undefined;
    }

    const initializeGoogleButton = () => {
      if (!window.google || !googleButtonRef.current || googleInitializedRef.current) {
        return;
      }

      google.accounts.id.initialize({
        client_id: googleClientId,
        callback: handleGoogleResponse
      });

      googleButtonRef.current.innerHTML = '';
      google.accounts.id.renderButton(googleButtonRef.current, {
        theme: 'outline',
        size: 'large',
        shape: 'rectangular',
        logo_alignment: 'left',
        width: 364,
        text: 'continue_with'
      });
      googleInitializedRef.current = true;
    };

    initializeGoogleButton();

    const googleScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
    if (googleScript && !googleInitializedRef.current) {
      googleScript.addEventListener('load', initializeGoogleButton);
      return () => googleScript.removeEventListener('load', initializeGoogleButton);
    }

    return undefined;
  }, [googleClientId, isGoogleConfigured]);

  async function handleGoogleResponse(response) {
    setLoading(true);
    console.log('Google credential received:', response.credential);
    try {
      let payload = null;
      try {
        const parts = response.credential.split('.');
        if (parts.length >= 2) {
          const raw = parts[1].replace(/-/g, '+').replace(/_/g, '/');
          const json = decodeURIComponent(atob(raw).split('').map(function(c) { return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2); }).join(''));
          payload = JSON.parse(json);
        }
      } catch (e) {
        console.warn('Failed to decode ID token payload locally', e);
      }

      console.log('Sending token to backend:', api.defaults.baseURL + '/auth/google');
      const res = await api.post('/auth/google', { token: response.credential });
      console.log('Backend response success:', res.data);
      localStorage.setItem('token', res.data.token);
      navigate('/');
    } catch (err) {
      console.error('Google Login Error Details:', err);
      if (err.response) {
        console.error('Server responded with:', err.response.status, err.response.data);
      }
      setError(err.response?.data?.error || 'Google Login failed');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { username, password });
      localStorage.setItem('token', res.data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      {/* LEFT */}
      <div className="login-left">
        <div className="login-logo-big"><MauLogoWhite w={180}/></div>
        <h1>Welcome to <span style={{color:'var(--accent)'}}>MaU</span> Digital CRM</h1>
        <p>Manage Leads. Build Relationships. Grow Together.</p>
        <div className="login-preview">
          <div style={{padding:10}}>
            <div style={{fontWeight:700,fontSize:12,marginBottom:10}}>Dashboard</div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8}}>
              {[['Total Leads','128','👥'],['New Leads','45','✨'],['Contacted','52','📞']].map(([l,v,i])=>(
                <div key={l} style={{background:'#fff',borderRadius:8,padding:'8px 10px',boxShadow:'0 1px 4px rgba(0,0,0,.06)'}}>
                  <div style={{fontSize:10,color:'#6b7280'}}>{l}</div>
                  <div style={{fontSize:20,fontWeight:800,display:'flex',justifyContent:'space-between',alignItems:'center'}}>{v}<span style={{fontSize:14}}>{i}</span></div>
                </div>
              ))}
            </div>
            <div style={{marginTop:10,fontWeight:700,fontSize:11}}>Leads Overview</div>
            <svg width="100%" height="50" viewBox="0 0 300 50"><polyline points="0,40 40,30 80,35 120,15 160,25 200,10 240,18 280,5" fill="none" stroke="#3b82f6" strokeWidth="2"/></svg>
          </div>
        </div>
        <div className="login-secure">🛡️ Secure admin access. All activities are monitored.</div>
      </div>

      {/* RIGHT */}
      <div className="login-right">
        <div className="login-right-logo"><MauLogo w={70}/></div>
        <div style={{fontSize:11,color:'var(--muted)',fontWeight:600,marginBottom:12}}>MaU Digital</div>
        <h2>Welcome Back!</h2>
        <p className="sub">Sign in to access your MaU Digital CRM</p>
        {error && <div className="error-msg">⚠ {error}</div>}
        <form onSubmit={handleSubmit} style={{width:'100%'}}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div className="form-input-wrap">
              <span className="f-icon">✉️</span>
              <input className="form-input has-icon" value={username} onChange={e=>setUsername(e.target.value)} placeholder="Enter your email" required/>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="form-input-wrap">
              <span className="f-icon">🔒</span>
              <input className="form-input has-icon" type={showPw?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)} placeholder="Enter your password" required/>
              <button type="button" onClick={()=>setShowPw(!showPw)} style={{position:'absolute',right:10,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',fontSize:14,color:'var(--muted)'}}>
                {showPw?'🙈':'👁️'}
              </button>
            </div>
          </div>
          <div className="remember-row">
            <label><input type="checkbox"/> Remember me</label>
            <a href="#!">Forgot Password?</a>
          </div>
          <button className="btn btn-primary" type="submit" disabled={loading} style={{width:'100%',justifyContent:'center',padding:'12px',fontSize:14}}>
            {loading?'Signing in…':'🔐 Login'}
          </button>
        </form>
        <div className="login-divider">or</div>
        <div className="google-signin-shell">
          <div ref={googleButtonRef} id="google-signin-btn" style={{ width: '100%' }}></div>
        </div>
        <div className="login-bottom">🛡️ Secure admin access. All activities are monitored.</div>
      </div>
    </div>
  );
}
