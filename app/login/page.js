'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [adult, setAdult] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    if (p.get('mode') === 'signup') setMode('signup');
    if (p.get('error') === 'confirm') {
      setError('That confirmation link has expired or was already used. Sign in, or create the account again.');
    }
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setNotice('');

    if (password.length < 8) {
      setError('Use a password with at least 8 characters.');
      return;
    }
    if (mode === 'signup' && !adult) {
      setError('Confirm that you are 18 or older to create an account.');
      return;
    }

    setBusy(true);
    const supabase = createClient();

    if (mode === 'signup') {
      const { data, error: err } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: { adult_confirmed: true },
        },
      });
      setBusy(false);
      if (err) {
        setError(err.message);
        return;
      }
      if (data.session) {
        router.push('/onboarding');
        router.refresh();
      } else {
        setNotice('Check your email for a confirmation link, then come back to finish setting up.');
      }
    } else {
      const { error: err } = await supabase.auth.signInWithPassword({ email, password });
      setBusy(false);
      if (err) {
        setError(err.message);
        return;
      }
      router.push('/dashboard');
      router.refresh();
    }
  }

  const signup = mode === 'signup';

  return (
    <div className="panel">
      <h1>{signup ? 'Create your account' : 'Sign in'}</h1>

      {error && <div className="msg error" role="alert">{error}</div>}
      {notice && <div className="msg ok" role="status">{notice}</div>}

      <form onSubmit={handleSubmit} noValidate>
        <label className="field">
          <span>Email</span>
          <input type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label className="field">
          <span>Password</span>
          <input
            type="password"
            autoComplete={signup ? 'new-password' : 'current-password'}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {signup && <small>At least 8 characters.</small>}
        </label>

        {signup && (
          <label className="check">
            <input type="checkbox" checked={adult} onChange={(e) => setAdult(e.target.checked)} />
            <span>I am 18 or older.</span>
          </label>
        )}

        <button className="btn" type="submit" disabled={busy}>
          {busy ? 'Working...' : signup ? 'Create account' : 'Sign in'}
        </button>
      </form>

      <p className="switch">
        {signup ? 'Already have an account? ' : 'New to TASKit? '}
        <button type="button" onClick={() => { setMode(signup ? 'signin' : 'signup'); setError(''); setNotice(''); }}>
          {signup ? 'Sign in' : 'Create an account'}
        </button>
      </p>
    </div>
  );
}
