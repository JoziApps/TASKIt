# TASKit Phase 1: setup (browser only)

You need three free accounts: GitHub (you have it), Supabase, Vercel.

## 1. Supabase

1. supabase.com > New project. Pick the closest region (Cape Town if offered) and save the database password somewhere safe.
2. Left menu > SQL Editor > New query. Open `supabase/schema.sql`, paste all of it, click Run. It should say "Success". Run it once only.
3. Left menu > Authentication > Sign In / Providers > Email. For testing, turn OFF "Confirm email" so sign-up logs you straight in. Turn it back on before you launch.
4. Project Settings > API. Copy the Project URL and the anon (or "publishable") key. You need both in step 3.

## 2. GitHub (repo: JoziApps/TASKIt)

1. Unzip `taskit-phase1.zip` on your device.
2. Open the repo > Add file > Upload files.
3. Open the unzipped `taskit-phase1` folder and drag its CONTENTS into the page (app, components, lib, public, supabase, middleware.js, package.json and the rest). Do not drag the outer folder itself, or everything ends up one level too deep.
4. Scroll down, click Commit changes.

The repo root must show `package.json`, `middleware.js`, `app/` and `lib/` directly.

## 3. Vercel

1. vercel.com > Add New > Project > import `JoziApps/TASKIt`. Framework should auto-detect as Next.js.
2. Before deploying, open Environment Variables and add:
   - `NEXT_PUBLIC_SUPABASE_URL` = your Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your anon / publishable key
3. Click Deploy. Every later commit on GitHub redeploys automatically.

## 4. Point Supabase at your live site

Supabase > Authentication > URL Configuration:
- Site URL: your Vercel address (for example https://taskit.vercel.app)
- Redirect URLs: add `https://YOUR-VERCEL-ADDRESS/auth/callback`

## 5. Test

1. Open your site > Create account > tick "I am 18 or older".
2. Choose Tasker or Taskee, enter a pet name, save.
3. You should land on "Welcome, your pet name". In Supabase > Table Editor > profiles you will see your row.

If sign-up fails, check the two environment variables in Vercel (redeploy after changing them).

## Signature footer

`components/SignatureFooter.js` is your Jozi Nites calling card. Copy that one file into every app so the signature never drifts. Tell me if you want different wording.

## Next

Phase 2: create a workspace, share an invite code, pair a Tasker with a Taskee, and add pause and disband controls.
