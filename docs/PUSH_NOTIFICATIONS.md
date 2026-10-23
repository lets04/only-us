# OnlyUs push notifications (Android)

The UI and service-worker plumbing are committed, but push delivery will not work until the Supabase migration, VAPID keys, Edge Function, and Vercel environment variable are configured.

## 1. Generate VAPID keys

From the project root, run:

```bash
npx web-push generate-vapid-keys
```

Keep the **private** key secret. Never put it in `VITE_*` variables or commit it.

## 2. Configure local environment

Add only the public key to your local `.env.local`:

```env
VITE_VAPID_PUBLIC_KEY=PASTE_VAPID_PUBLIC_KEY_HERE
```

Restart Vite after changing environment variables.

## 3. Apply the database migration

Apply `supabase/migrations/20261027_push_subscriptions.sql` to the same Supabase project used by OnlyUs. Earlier OnlyUs migrations must already be applied, including the `is_couple_member()` function and the `love_wishes` table.

## 4. Configure Supabase Function secrets

In Supabase Dashboard → Edge Functions → Secrets, add:

- `VAPID_PUBLIC_KEY`: the generated public key
- `VAPID_PRIVATE_KEY`: the generated private key
- `VAPID_SUBJECT`: a valid contact URI, such as `mailto:your-email@example.com`

Supabase supplies `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` to Edge Functions in its hosted environment. Never expose the service-role key in the frontend.

Deploy `supabase/functions/send-wish-notification` to the same Supabase project. The sender must be authenticated, a couple member, and the owner of the wish being sent.

## 5. Configure Vercel

In Vercel → Project → Settings → Environment Variables, add:

- `VITE_VAPID_PUBLIC_KEY`: the same generated public key
- The existing `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

Redeploy after changing environment variables.

## 6. Test both Android phones

1. Open the deployed HTTPS URL in Chrome on each phone and sign in with that person's own Supabase account.
2. Open **Deseos** and tap **Activar notificaciones**; allow the browser prompt on each phone.
3. Send a test wish from one account. The other phone should receive a push notification, including when OnlyUs is not open.
4. Repeat in the other direction.

If Chrome has notifications disabled for the site or Android has blocked app notifications, push messages cannot appear. Installing OnlyUs from Chrome's **Add to Home screen / Install app** option makes it feel more app-like; browser push support still depends on the Android browser and device settings.

## Notes

- The manifest and service worker are intended for the Vercel HTTPS deployment; the service worker is registered in production builds.
- A successful save of a wish does not by itself prove a push was delivered. Check the Edge Function logs when testing.
- The Edge Function currently sends to registered subscriptions belonging to the other couple account and removes expired endpoints.
- Do not commit VAPID private keys or service-role keys.
