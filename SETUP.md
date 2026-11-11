# Namaz Board: setup guide

Everything here is free and needs no card:
- **GitHub Pages** hosts the app.
- **Supabase** stores the logs, handles sign-in and sends the alerts.
- **Google Cloud** lets you sign in with Google.

Set aside about 45 minutes and do it on a laptop. Your secret keys are in the separate **SECRETS.txt** file. Never put that file on GitHub.

In the steps below, swap in your own values for these placeholders:

| Placeholder | What it is | Example |
|---|---|---|
| `USERNAME` | your GitHub username | `shupti` |
| `REF` | your Supabase project ref, the random letters in your Supabase URL | `abcdwxyzabcdwxyz` |

---

## 1. Put the app on GitHub Pages

1. Sign up or log in at <https://github.com>.
2. Click **New repository**:
   - Name: `namaz-board`
   - Visibility: **Public** (free Pages needs a public repo; nothing secret is in the code)
   - Click **Create repository**.
3. On the empty repo page, click **uploading an existing file**.
4. Unzip `namaz-board.zip`, open the folder, select **everything inside it** and drag it into the page. Click **Commit changes**.
5. Go to **Settings → Pages**:
   - Source: **Deploy from a branch**
   - Branch: **main**, folder **/ (root)**
   - Click **Save**.
6. After a minute your app is live at `https://USERNAME.github.io/namaz-board/`. It will say "Almost there" until you finish step 4.

## 2. Create the Supabase project (database)

1. Go to <https://supabase.com>, click **Start your project** and sign in with GitHub.
2. Click **New project**:
   - Name: `namaz-board`
   - Database password: anything strong; save it somewhere.
   - Region: **West EU (London)**
   - Plan: **Free**.
3. When it's ready, open **SQL Editor → New query**. Paste all of `supabase/schema.sql` and click **Run**. It should say "Success".
   Then do the same, one at a time, for each file in `supabase/migrations/` (in number order).
4. Make a new query, paste this with **your Gmail in lowercase**, and click **Run**. This makes you the admin and lets you join:

   ```sql
   insert into admins (email) values ('yourgmail@gmail.com');
   insert into invites (email) values ('yourgmail@gmail.com');
   ```

5. Open **Project Settings → API Keys** and copy two things for step 4:
   - **Project URL**, like `https://REF.supabase.co`. It's also on the project's home page under **Connect**.
   - **Publishable key**, which starts `sb_publishable_`. If you only see "anon" keys, copy the **anon public** key instead.

## 3. Turn on Google sign-in

1. Go to <https://console.cloud.google.com> and sign in with your Gmail.
2. At the top, open the project picker and click **New project**. Name it `Namaz Board` and click **Create**, then select it.
3. Search for **Google Auth Platform** and open it. Click **Get started**:
   - App name: `Namaz Board`
   - Support email: your Gmail
   - Audience: **External**
   - Contact email: your Gmail
   - Agree and click **Create**.
4. Go to **Audience** and click **Publish app**, then **Confirm**. This lets your friends sign in. No review is needed, because the app only asks for name and email.
5. Go to **Clients → Create client**:
   - Application type: **Web application**
   - Name: `Namaz Board`
   - Authorized JavaScript origins: `https://USERNAME.github.io`
   - Authorized redirect URIs: `https://REF.supabase.co/auth/v1/callback`
   - Click **Create**, then copy the **Client ID** and **Client secret**.
6. Back in Supabase, open **Authentication → Sign In / Providers → Google**:
   - Turn it **on**.
   - Paste the Client ID and Client secret.
   - Click **Save**.
7. Open **Authentication → URL Configuration**:
   - **Site URL**: `https://USERNAME.github.io/namaz-board/`
   - **Redirect URLs**: click **Add URL** and add the same address.
   - Click **Save**.

## 4. Connect the app to Supabase

1. On GitHub, open `config.js` in your repo and click the pencil (**Edit**).
2. Replace `https://YOUR-PROJECT-REF.supabase.co` with your Project URL.
3. Replace `YOUR-PUBLISHABLE-OR-ANON-KEY` with your publishable (or anon) key.
4. Leave `vapidPublicKey` as it is; it's already filled in.
5. Click **Commit changes**. Pages updates in about a minute.

Now open `https://USERNAME.github.io/namaz-board/`. You should be able to sign in with Google and **Join**. Logging works at this point; alerts come next.

## 5. Add the notification function

1. In Supabase, go to **Edge Functions → Deploy a new function → Via Editor**.
2. Name it **`notify`** exactly.
3. Delete the sample code, paste all of `supabase/functions/notify/index.ts`, and click **Deploy function**.
4. Open the function's **Details / Settings**, turn **off** "Verify JWT" (it may be called "Enforce JWT verification"), and save.
   - It's safe to turn off, because the function checks its own secret.
5. Go to **Edge Functions → Secrets** and add these five. The values are in **SECRETS.txt**:

   | Name | Value |
   |---|---|
   | `VAPID_PUBLIC_KEY` | from SECRETS.txt |
   | `VAPID_PRIVATE_KEY` | from SECRETS.txt |
   | `VAPID_SUBJECT` | `mailto:` followed by your Gmail |
   | `CRON_SECRET` | from SECRETS.txt |
   | `APP_URL` | `https://USERNAME.github.io/namaz-board/` |

## 6. Run it every minute

1. In **SQL Editor → New query**, paste `supabase/cron.sql`.
2. Replace `YOUR-PROJECT-REF` with your `REF`, and `YOUR-CRON-SECRET` with the CRON_SECRET from SECRETS.txt.
3. Click **Run**.

## 7. Try it on your phone

- **iPhone:** open the link in **Safari**, tap **Share → Add to Home Screen**, then open Namaz Board from the home screen. Alerts need iOS 16.4 or newer.
- **Android:** open the link in **Chrome** and tap **Install** (or ⋮ → **Add to Home screen**).

Then:

1. Sign in with Google and tap **Join**. Pick your city and Hanafi Asr.
2. Tap the 🔔 at the top, then **Turn on alerts**, and allow notifications.
3. Tap **Send a test**. A notification should arrive within a few seconds.

## 8. Invite your friends

Send them the link. They sign in with Google and tap **Ask to join**. You get a notification, and you approve them under ⚙️ **Settings → Join requests**.

You can also skip the request by adding their Gmail under **Or invite directly**.

---

## What you'll get

| Alert | When |
|---|---|
| 🌸 "It's Asr time · আসর" | When each fardh waqt starts |
| ⏳ "Asr ends in 30 min" | 30 minutes before a waqt ends, **only if you haven't logged it**: the streak saver |

Each person can switch these on or off under 🔔.

## Good to know

- **Free limits:**
  - The every-minute check uses about 43,000 of Supabase's 500,000 free function calls a month.
  - The database is tiny; years of logs for 10 people still come to a few MB.
- **Pausing:** Supabase pauses free projects after about a week with no activity. Daily use keeps it awake. If it ever pauses, you'll get an email, and **Restore** in the dashboard brings it back with all data.
- **Updating the app:** edit files on GitHub, or ask Claude for changes and upload the new files. Pages redeploys on its own.

## If something doesn't work

| Problem | Fix |
|---|---|
| "Google sign-in isn't set up yet" | Check step 3.6: the Google provider must be on, with the ID and secret saved. |
| Google says `redirect_uri_mismatch` | The redirect URI in step 3.5 must be exactly `https://REF.supabase.co/auth/v1/callback`. |
| After signing in you land on the wrong page | Check Site URL and Redirect URLs in step 3.7, including the trailing `/`. |
| "You're not on the list yet" | Add that Gmail under Invite friends, or with the SQL in step 2.4. |
| Test notification fails | Check that the function is named `notify`, Verify JWT is off and all five secrets are set. **Edge Functions → notify → Logs** shows errors. |
| Test works but the timed alerts don't | In SQL Editor, run `select * from cron.job_run_details order by start_time desc limit 5;`. The runs should show `succeeded`. Then check that cron.sql has your real REF and secret. |
| iPhone shows no 🔔 option | Add the app to your home screen first and open it from there. |
