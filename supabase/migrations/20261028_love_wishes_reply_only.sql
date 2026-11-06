-- Antojitos de amor: a wish can only be answered, and only by the person who did not send it.
-- Before this, any member could update every column (wish_titles, message, sender_id…)
-- and could also answer their own wish.

drop policy if exists couple_members_reply_love_wishes on public.love_wishes;

create policy couple_members_reply_love_wishes on public.love_wishes
  for update to authenticated
  using (public.is_couple_member() and sender_id <> auth.uid())
  with check (public.is_couple_member() and sender_id <> auth.uid());

revoke update on table public.love_wishes from authenticated;
grant update (response) on table public.love_wishes to authenticated;
