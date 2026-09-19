'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

const ROLES = [
  { id: 'tasker', name: 'Tasker', desc: 'You set the tasks, choose the rewards and punishments, and judge the result.' },
  { id: 'taskee', name: 'Taskee', desc: 'You take on tasks, earn points, and answer for what you finish or miss.' },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [role, setRole] = useState('');
  const [petName, setPetName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!role) {
      setError('Pick Tasker or Taskee to continue.');
      return;
    }
    if (petName.trim().length < 2) {
      setError('Enter a pet name with at least 2 characters.');
      return;
    }

    setBusy(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
      return;
    }

    const { error: err } = await supabase.from('profiles').upsert({
      id: user.id,
      role,
      pet_name: petName.trim(),
      adult_confirmed_at: user.user_metadata?.adult_confirmed ? new Date().toISOString() : null,
    });
    setBusy(false);

    if (err) {
      setError(err.message);
      return;
    }
    router.push('/dashboard');
    router.refresh();
  }

  return (
    <div className="panel wide">
      <h1>Set up your profile</h1>
      <p className="muted">You can pair with your partner after this step.</p>

      {error && <div className="msg error" role="alert">{error}</div>}

      <form onSubmit={handleSubmit} noValidate>
        <div className="role-grid" role="radiogroup" aria-label="Your role">
          {ROLES.map((r) => (
            <label key={r.id} className={`role ${role === r.id ? 'on' : ''}`}>
              <input className="sr" type="radio" name="role" value={r.id} checked={role === r.id} onChange={() => setRole(r.id)} />
              <span className="name">{r.name}</span>
              <span className="desc">{r.desc}</span>
            </label>
          ))}
        </div>

        <label className="field">
          <span>Pet name</span>
          <input type="text" maxLength={30} value={petName} onChange={(e) => setPetName(e.target.value)} />
          <small>This is the name your partner sees.</small>
        </label>

        <button className="btn" type="submit" disabled={busy}>
          {busy ? 'Saving...' : 'Save and continue'}
        </button>
      </form>
    </div>
  );
}
