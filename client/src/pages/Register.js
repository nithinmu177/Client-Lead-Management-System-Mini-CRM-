import React, { useEffect, useRef, useState } from 'react';
import api from '../api';
import { Link, useNavigate } from 'react-router-dom';

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

export default function Register() {
  const googleButtonRef = useRef(null);
  const googleInitializedRef = useRef(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
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
    setError(null);
    setLoading(true);
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
        console.warn('Failed to decode ID token payload', e);
      }

      console.log('Google response received (Register), payload:', payload);
      const res = await api.post('/auth/google', { token: response.credential });
      console.log('Backend responded:', res.data);
      localStorage.setItem('token', res.data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Google sign-in failed');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await api.post('/auth/register', { name, email, password });
      localStorage.setItem('token', res.data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-left">
        <div className="login-logo-big"><MauLogoWhite w={180}/></div>
        <h1>Create your <span style={{color:'var(--accent)'}}>MaU</span> workspace</h1>
        <p>Start organizing leads, tracking follow-ups, and growing client relationships from one place.</p>
        <div className="login-preview">
          <div style={{padding:10}}>
            <div style={{fontWeight:700,fontSize:12,marginBottom:10}}>Getting Started</div>
            <div style={{display:'grid',gap:8}}>
              {[
                ['1', 'Create your admin account'],
                ['2', 'Add your first lead'],
                ['3', 'Track progress in one dashboard']
              ].map(([step, label]) => (
                <div key={step} style={{background:'#fff',borderRadius:8,padding:'10px 12px',boxShadow:'0 1px 4px rgba(0,0,0,.06)',display:'flex',alignItems:'center',gap:10}}>
                  <div style={{width:28,height:28,borderRadius:999,background:'#0f1d35',color:'#fff',display:'grid',placeItems:'center',fontWeight:800,fontSize:12}}>{step}</div>
                  <div style={{fontSize:12.5,color:'#111827',fontWeight:600}}>{label}</div>
                </div>
              ))}
            </div>
            <div style={{marginTop:12,fontWeight:700,fontSize:11}}>Launch Progress</div>
            <svg width="100%" height="50" viewBox="0 0 300 50">
              <polyline points="0,42 55,36 110,28 165,24 220,14 280,8" fill="none" stroke="#10b981" strokeWidth="2.5"/>
            </svg>
          </div>
        </div>
        <div className="login-secure">Secure onboarding. Your CRM setup stays private and protected.</div>
      </div>

      <div className="login-right">
        <div className="login-right-logo"><MauLogo w={70}/></div>
        <div style={{fontSize:11,color:'var(--muted)',fontWeight:600,marginBottom:12}}>MaU Digital</div>
        <h2>Create Account</h2>
        <p className="sub">Set up your admin access to start using the CRM</p>
        {error && <div className="error-msg">{error}</div>}
        <form onSubmit={handleSubmit} style={{width:'100%'}}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <div className="form-input-wrap">
              <span className="f-icon">ID</span>
              <input className="form-input has-icon" value={name} onChange={e=>setName(e.target.value)} placeholder="Enter your name" required/>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div className="form-input-wrap">
              <span className="f-icon">@</span>
              <input className="form-input has-icon" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Enter your email" required/>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="form-input-wrap">
              <span className="f-icon">PW</span>
              <input className="form-input has-icon" type={showPw ? 'text' : 'password'} value={password} onChange={e=>setPassword(e.target.value)} placeholder="Create a password" required/>
              <button type="button" onClick={()=>setShowPw(!showPw)} style={{position:'absolute',right:10,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',fontSize:12,color:'var(--muted)',fontWeight:700}}>
                {showPw ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>
          <button className="btn btn-primary" type="submit" disabled={loading} style={{width:'100%',justifyContent:'center',padding:'12px',fontSize:14}}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>
        <div className="login-divider">or</div>
        <div className="google-signin-shell">
          <div ref={googleButtonRef} id="google-register-btn" style={{ width: '100%' }}></div>
        </div>
        <div className="login-bottom">
          Already registered? <Link to="/login" style={{color:'var(--accent)',fontWeight:700,textDecoration:'none'}}>Login here</Link>
        </div>
      </div>
    </div>
  );
}
