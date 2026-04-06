create or replace function public.is_username_available(input_username text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select not exists (
    select 1
    from public.profiles
    where username = lower(regexp_replace(trim(input_username), '\s+', '', 'g'))
  );
$$;

create or replace function public.is_username_taken(input_username text, input_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where username = lower(regexp_replace(trim(input_username), '\s+', '', 'g'))
      and id <> input_user_id
  );
$$;

grant execute on function public.is_username_available(text) to anon, authenticated;
grant execute on function public.is_username_taken(text, uuid) to authenticated;
