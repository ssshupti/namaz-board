# Weekly backup

Every Sunday, GitHub makes an **encrypted** copy of the Namaz Board database and keeps it for 90 days.

**What's in it:**
- members, logs, groups, group members, shared streak numbers, invites, admins and join requests

**What's left out:**
- excused days, which stay private, even from the admin
- notification subscriptions
- the alert log

## One-time setup

In the repo, go to **Settings → Secrets and variables → Actions → New repository secret** and add these three:

| Name | Value |
|---|---|
| `SUPABASE_URL` | `https://xnmtemzrljjswgwvytlk.supabase.co` |
| `SUPABASE_SECRET_KEY` | From Supabase **Project Settings → API Keys → Secret keys**, starting `sb_secret_…`. Click **Reveal** and copy it. |
| `BACKUP_PASSPHRASE` | A long passphrase you make up and **write down somewhere safe**. Without it, backups can't be opened. |

Then go to **Actions → Weekly backup → Run workflow** to make the first backup right away.

## Getting a backup

Go to **Actions → Weekly backup**, click a run, and under **Artifacts** download `namaz-backup-YYYY-MM-DD`. Unzip it to get a `.json.gz.enc` file.

To open it, use Terminal on a Mac:

```
openssl enc -d -aes-256-cbc -pbkdf2 -iter 200000 -in namaz-backup-YYYY-MM-DD.json.gz.enc | gunzip > backup.json
```

It asks for your passphrase. `backup.json` then holds every table.

## Restoring

If data is ever lost, give `backup.json` to Claude (or whoever maintains the app) and ask to restore it into Supabase.
