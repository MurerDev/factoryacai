-- FACTORY AÇAÍ: controle de loja aberta/fechada
-- Execute no Supabase > SQL Editor. A loja inicia aberta.
create table if not exists public.factory_configuracoes (
  id text primary key,
  loja_aberta boolean not null default true,
  atualizado_em timestamptz not null default now()
);

insert into public.factory_configuracoes (id, loja_aberta)
values ('principal', true) on conflict (id) do nothing;

alter table public.factory_configuracoes enable row level security;
drop policy if exists factory_configuracoes_leitura_publica on public.factory_configuracoes;
create policy factory_configuracoes_leitura_publica on public.factory_configuracoes
  for select to anon, authenticated using (true);
drop policy if exists factory_configuracoes_admin on public.factory_configuracoes;
create policy factory_configuracoes_admin on public.factory_configuracoes
  for all to authenticated using (public.factory_is_admin()) with check (public.factory_is_admin());
grant select on public.factory_configuracoes to anon, authenticated;
grant insert, update on public.factory_configuracoes to authenticated;

-- Habilita atualização em tempo real para o site público e o painel (Supabase).
do $$ begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime')
     and not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'factory_configuracoes') then
    alter publication supabase_realtime add table public.factory_configuracoes;
  end if;
end $$;

-- Bloqueio no próprio banco: impede envio mesmo se alguém tentar chamar a API diretamente.
create or replace function public.factory_criar_pedido(p_nome text,p_endereco text,p_telefone text,p_pagamento text,p_itens jsonb)
returns jsonb language plpgsql security definer set search_path=public as $$
declare v_id bigint; v_total numeric(10,2):=0; v_item jsonb; v_qtd integer; v_preco numeric(10,2); v_prod public.factory_catalogo_produtos%rowtype; v_add public.factory_catalogo_adicionais%rowtype; v_add_id text; v_comps text[];
begin
 if not coalesce((select loja_aberta from public.factory_configuracoes where id='principal'), true) then
   raise exception 'A loja está fechada no momento e não está recebendo pedidos.';
 end if;
 if length(trim(coalesce(p_nome,''))) not between 2 and 100 then raise exception 'Nome inválido'; end if;
 if length(trim(coalesce(p_endereco,''))) not between 5 and 300 then raise exception 'Endereço inválido'; end if;
 if length(regexp_replace(coalesce(p_telefone,''),'[^0-9]','','g')) not between 10 and 13 then raise exception 'Telefone inválido'; end if;
 if p_pagamento is null or p_pagamento not in ('dinheiro','pix','cartao','credito','debito','cartão de crédito/débito') then raise exception 'Pagamento inválido'; end if;
 if p_itens is null or jsonb_typeof(p_itens)<>'array' or jsonb_array_length(p_itens)<1 or jsonb_array_length(p_itens)>30 then raise exception 'Itens inválidos'; end if;
 for v_item in select value from jsonb_array_elements(p_itens) loop
   v_qtd:=coalesce((v_item->>'qtd')::integer,1); if v_qtd not between 1 and 30 then raise exception 'Quantidade inválida'; end if;
   select * into v_prod from public.factory_catalogo_produtos where id=v_item->>'tamanho' and ativo=true;
   if not found then raise exception 'Produto indisponível'; end if;
   v_preco:=v_prod.preco;
   for v_add_id in select value from jsonb_array_elements_text(coalesce(v_item->'complementos','[]'::jsonb)) loop
     select * into v_add from public.factory_catalogo_adicionais where id=v_add_id and ativo=true;
     if not found then raise exception 'Adicional indisponível'; end if;
     v_preco:=v_preco+v_add.preco;
   end loop;
   v_total:=v_total+(v_preco*v_qtd);
 end loop;
 insert into public.pedidos(nome,endereco,telefone,pagamento,total,status) values(trim(p_nome),trim(p_endereco),trim(p_telefone),p_pagamento,v_total,'Pendente') returning id into v_id;
 for v_item in select value from jsonb_array_elements(p_itens) loop
   v_qtd:=coalesce((v_item->>'qtd')::integer,1);
   select * into v_prod from public.factory_catalogo_produtos where id=v_item->>'tamanho';
   v_preco:=v_prod.preco; v_comps:=array[]::text[];
   for v_add_id in select value from jsonb_array_elements_text(coalesce(v_item->'complementos','[]'::jsonb)) loop
     select * into v_add from public.factory_catalogo_adicionais where id=v_add_id;
     v_preco:=v_preco+v_add.preco; v_comps:=array_append(v_comps,v_add.nome);
   end loop;
   insert into public.itens_pedido(pedido_id,nome,tamanho,qtd,preco,complementos,observacao)
   values(v_id,left(coalesce(v_prod.nome,'Açaí'),100),left(coalesce(v_prod.valor,''),30),v_qtd,v_preco,v_comps,left(coalesce(v_item->>'observacao',''),500));
 end loop;
 return jsonb_build_object('id',v_id,'total',v_total);
end; $$;
revoke all on function public.factory_criar_pedido(text,text,text,text,jsonb) from public;
grant execute on function public.factory_criar_pedido(text,text,text,text,jsonb) to anon,authenticated;
