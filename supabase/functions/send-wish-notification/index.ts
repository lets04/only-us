import webpush from 'npm:web-push@3.6.7'
import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (request.method !== 'POST') return Response.json({ error: 'Method not allowed' }, { status: 405, headers: corsHeaders })

  const authorization = request.headers.get('Authorization')
  if (!authorization) return Response.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders })

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  const publicKey = Deno.env.get('VAPID_PUBLIC_KEY')
  const privateKey = Deno.env.get('VAPID_PRIVATE_KEY')
  const subject = Deno.env.get('VAPID_SUBJECT') || 'mailto:admin@onlyus.app'

  if (!supabaseUrl || !anonKey || !serviceRoleKey || !publicKey || !privateKey) {
    return Response.json({ error: 'Push service is not configured' }, { status: 503, headers: corsHeaders })
  }

  const userClient = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authorization } }, auth: { persistSession: false } })
  const { data: authData, error: authError } = await userClient.auth.getUser()
  if (authError || !authData.user) return Response.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders })

  let wishId: string
  try {
    const body = await request.json()
    wishId = body.wishId
    if (typeof wishId !== 'string' || !/^[0-9a-f-]{36}$/i.test(wishId)) throw new Error('Invalid wish id')
  } catch {
    return Response.json({ error: 'Invalid request body' }, { status: 400, headers: corsHeaders })
  }

  const admin = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } })
  const { data: wish, error: wishError } = await admin.from('love_wishes')
    .select('id,sender_id,wish_titles,message')
    .eq('id', wishId)
    .eq('sender_id', authData.user.id)
    .maybeSingle()

  if (wishError || !wish) return Response.json({ error: 'Wish not found for authenticated sender' }, { status: 404, headers: corsHeaders })

  const { data: member, error: memberError } = await admin.rpc('is_couple_member', { user_id: authData.user.id })
  if (memberError || member !== true) return Response.json({ error: 'Not a couple member' }, { status: 403, headers: corsHeaders })

  const { data: subscriptions, error: subscriptionsError } = await admin.from('push_subscriptions')
    .select('id,user_id,subscription')
    .neq('user_id', authData.user.id)

  if (subscriptionsError) return Response.json({ error: 'Could not load push subscriptions' }, { status: 500, headers: corsHeaders })

  webpush.setVapidDetails(subject, publicKey, privateKey)
  const payload = JSON.stringify({
    title: 'Un antojito de amor 💗',
    body: [...(wish.wish_titles || []), wish.message].filter(Boolean).join(' · ').slice(0, 180) || 'Tu persona favorita te dejó un mensajito.',
    url: '/deseos',
    tag: 'onlyus-wish-' + wish.id,
  })

  const results = await Promise.all((subscriptions || []).map(async (row) => {
    try {
      await webpush.sendNotification(row.subscription, payload)
      return { ok: true }
    } catch (error) {
      const statusCode = (error as { statusCode?: number }).statusCode
      if (statusCode === 404 || statusCode === 410) await admin.from('push_subscriptions').delete().eq('id', row.id)
      return { ok: false }
    }
  }))

  return Response.json({ sent: results.filter((result) => result.ok).length, attempted: results.length }, { headers: corsHeaders })
})
