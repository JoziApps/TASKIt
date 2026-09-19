import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export default async function Dashboard() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, pet_name')
    .eq('id', user.id)
    .maybeSingle();

  if (!profile) redirect('/onboarding');

  const roleName = profile.role === 'tasker' ? 'Tasker' : 'Taskee';

  return (
    <>
      <h1>Welcome, {profile.pet_name}</h1>
      <p className="muted">You are signed in as a {roleName}.</p>

      <div className="workspace-empty">
        <h2>Your workspace</h2>
        <p>You are not paired yet. Linking with your partner opens in the next update.</p>
      </div>

      <form action="/auth/signout" method="post" style={{ marginTop: 32 }}>
        <button className="btn btn-ghost" type="submit">Sign out</button>
      </form>
    </>
  );
}
