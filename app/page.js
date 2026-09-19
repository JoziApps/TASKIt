import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  return (
    <>
      <section className="hero">
        <div>
          <h1 className="hero-title">Where duty meets desire?</h1>
          <p className="lead">
            A private space for two. One person sets the tasks and the stakes. The other earns
            points, or pays the price.
          </p>
          <div className="actions">
            <Link className="btn" href="/login?mode=signup">Create account</Link>
            <Link className="btn btn-ghost" href="/login">Sign in</Link>
          </div>
          <p className="muted">TASKit is for adults aged 18 and over.</p>
        </div>
        <Image className="hero-logo" src="/logo.png" alt="TASKit logo with handcuffs" width={500} height={500} priority />
      </section>

      <dl className="roles">
        <div>
          <dt>Tasker</dt>
          <dd>Builds task kits, assigns them, and decides what counts as done.</dd>
        </div>
        <div>
          <dt>Taskee</dt>
          <dd>Takes on tasks, earns points for rewards, and faces the consequences when tasks slip.</dd>
        </div>
        <div>
          <dt>Workspace</dt>
          <dd>Two accounts linked together. Tasks, points and chat belong to the pair, and nobody else can see them.</dd>
        </div>
      </dl>
    </>
  );
}
