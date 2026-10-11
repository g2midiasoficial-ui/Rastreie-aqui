-- Funções do painel de administração. Usuários comuns não podem alterar papel/plano/status
-- diretamente (ver grants em profiles), então o painel usa estas funções, que conferem
-- se quem chama é admin antes de agir.

create or replace function public.admin_list_users()
returns table (
  id uuid,
  email text,
  display_name text,
  photo_url text,
  provider text,
  role text,
  plan text,
  status text,
  created_at timestamptz,
  last_sign_in_at timestamptz
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not private.is_admin() then
    raise exception 'Acesso negado' using errcode = '42501';
  end if;

  return query
    select p.id, p.email, p.display_name, p.photo_url, p.provider, p.role, p.plan, p.status,
           p.created_at, u.last_sign_in_at
    from public.profiles p
    left join auth.users u on u.id = p.id
    order by p.created_at desc;
end;
$$;

create or replace function public.admin_update_user(
  target_id uuid,
  new_display_name text default null,
  new_role text default null,
  new_plan text default null,
  new_status text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not private.is_admin() then
    raise exception 'Acesso negado' using errcode = '42501';
  end if;

  if target_id = (select auth.uid()) and new_role is not null and new_role <> 'admin' then
    raise exception 'Você não pode remover o seu próprio acesso de administrador';
  end if;

  update public.profiles
  set display_name = coalesce(new_display_name, display_name),
      role = coalesce(new_role, role),
      plan = coalesce(new_plan, plan),
      status = coalesce(new_status, status)
  where id = target_id;
end;
$$;

create or replace function public.admin_delete_user(target_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not private.is_admin() then
    raise exception 'Acesso negado' using errcode = '42501';
  end if;

  if target_id = (select auth.uid()) then
    raise exception 'Você não pode excluir a sua própria conta pelo painel';
  end if;

  -- Remove o login; o perfil e todos os dados do usuário saem em cascata
  delete from auth.users where id = target_id;
end;
$$;

revoke execute on function public.admin_list_users() from public, anon;
revoke execute on function public.admin_update_user(uuid, text, text, text, text) from public, anon;
revoke execute on function public.admin_delete_user(uuid) from public, anon;
grant execute on function public.admin_list_users() to authenticated;
grant execute on function public.admin_update_user(uuid, text, text, text, text) to authenticated;
grant execute on function public.admin_delete_user(uuid) to authenticated;
