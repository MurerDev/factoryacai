-- FACTORY AÇAÍ | Atualização de frutas, bebidas, salada e cobrança de frutas extras
-- Execute no Supabase > SQL Editor > New query.
-- Cada fruta acima da quantidade incluída no copo de salada custa R$ 2,50.

-- Garante que todos os produtos de salada estejam disponíveis no painel administrativo.
insert into public.factory_catalogo_produtos (id,nome,valor,preco,descricao,categoria,ativo,ordem) values
('salada-300ml','Salada de frutas 300 ml','300 ml',11.00,'Até 3 frutas incluídas','Salada de frutas',true,101),
('salada-500ml','Salada de frutas 500 ml','500 ml',17.00,'Até 4 frutas incluídas','Salada de frutas',true,102),
('salada-700ml','Salada de frutas 700 ml','700 ml',23.00,'Até 5 frutas incluídas','Salada de frutas',true,103)
on conflict (id) do update set nome=excluded.nome,valor=excluded.valor,preco=excluded.preco,descricao=excluded.descricao,categoria=excluded.categoria,ativo=true,ordem=excluded.ordem,atualizado_em=now();

-- Frutas do açaí: mesmas opções do cardápio, visíveis para edição no painel.
insert into public.factory_catalogo_adicionais (id,nome,preco,categoria,emoji,ativo,ordem) values
('banana','Banana',3.00,'Frutas','🍌',true,1),
('morango','Morango',4.00,'Frutas','🍓',true,2),
('abacaxi','Abacaxi',4.00,'Frutas','🍍',true,3),
('maracuja','Maracujá',3.50,'Frutas','🍇',true,4),
('uva-verde','Uva verde',4.00,'Frutas','🍇',true,5)
on conflict (id) do update set nome=excluded.nome,preco=excluded.preco,categoria=excluded.categoria,emoji=excluded.emoji,ativo=true,ordem=excluded.ordem,atualizado_em=now();

-- Frutas usadas na montagem da salada.
insert into public.factory_catalogo_adicionais (id,nome,preco,categoria,emoji,ativo,ordem) values
('salada-morango','Morango',0,'Frutas da Salada','🍓',true,1),
('salada-maracuja','Maracujá',0,'Frutas da Salada','🍈',true,2),
('salada-banana','Banana',0,'Frutas da Salada','🍌',true,3),
('salada-kiwi','Kiwi',0,'Frutas da Salada','🥝',true,4),
('salada-uva-verde','Uva verde sem semente',0,'Frutas da Salada','🍇',true,5),
('salada-abacaxi','Abacaxi',0,'Frutas da Salada','🍍',true,6),
('salada-manga','Manga',0,'Frutas da Salada','🥭',true,7),
('salada-laranja','Laranja',0,'Frutas da Salada','🍊',true,8),
('salada-maca-verde','Maçã verde',0,'Frutas da Salada','🍏',true,9)
on conflict (id) do update set nome=excluded.nome,categoria=excluded.categoria,emoji=excluded.emoji,ativo=true,ordem=excluded.ordem,atualizado_em=now();

-- Adicionais específicos da salada de frutas com os preços definidos.
insert into public.factory_catalogo_adicionais (id,nome,preco,categoria,emoji,ativo,ordem) values
('mousse-maracuja','Mousse de Maracujá',4.00,'Chocolates, doces e complementos','🍮',true,80),
('mousse-morango','Mousse de Morango',4.00,'Chocolates, doces e complementos','🍮',true,81),
('leite-condensado','Leite Condensado',3.50,'Chocolates, doces e complementos','🥛',true,82),
('leite-condensado-zero','Leite Condensado Zero Lactose',6.00,'Chocolates, doces e complementos','🥛',true,83),
('creme-de-leite','Creme de leite',3.00,'Chocolates, doces e complementos','🥛',true,84)
on conflict (id) do update set nome=excluded.nome,preco=excluded.preco,categoria=excluded.categoria,emoji=excluded.emoji,ativo=true,ordem=excluded.ordem,atualizado_em=now();

-- Bebidas já disponíveis no cardápio e agora garantidas no cadastro administrativo.
insert into public.factory_catalogo_adicionais (id,nome,preco,categoria,emoji,ativo,ordem) values
('coca-cola-310','Coca Cola 310ml',0,'Bebidas','🥤',true,1),
('coca-cola-zero-310','Coca Cola Zero 310ml',0,'Bebidas','🥤',true,2),
('guarana-350','Guaraná 350ml',0,'Bebidas','🥤',true,3),
('guarana-zero-350','Guaraná Zero 350ml',0,'Bebidas','🥤',true,4)
on conflict (id) do update set nome=excluded.nome,categoria=excluded.categoria,emoji=excluded.emoji,ativo=true,ordem=excluded.ordem,atualizado_em=now();

-- O preço é recalculado no servidor. Não depende do valor enviado pelo navegador.
create or replace function public.factory_criar_pedido(p_nome text,p_endereco text,p_telefone text,p_pagamento text,p_itens jsonb)
returns jsonb language plpgsql security definer set search_path=public as $$
declare
 v_id bigint; v_total numeric(10,2):=0; v_item jsonb; v_qtd integer; v_preco numeric(10,2);
 v_prod public.factory_catalogo_produtos%rowtype; v_add public.factory_catalogo_adicionais%rowtype;
 v_add_id text; v_comps text[]; v_qtd_frutas integer; v_limite_frutas integer; v_extras_frutas integer;
begin
 if length(trim(coalesce(p_nome,''))) not between 2 and 100 then raise exception 'Nome inválido'; end if;
 if length(trim(coalesce(p_endereco,''))) not between 5 and 300 then raise exception 'Endereço inválido'; end if;
 if length(regexp_replace(coalesce(p_telefone,''),'[^0-9]','','g')) not between 10 and 13 then raise exception 'Telefone inválido'; end if;
 if p_pagamento is null or p_pagamento not in ('dinheiro','pix','cartao','credito','debito','cartão de crédito/débito') then raise exception 'Pagamento inválido'; end if;
 if p_itens is null or jsonb_typeof(p_itens)<>'array' or jsonb_array_length(p_itens)<1 or jsonb_array_length(p_itens)>30 then raise exception 'Itens inválidos'; end if;

 -- Primeiro calcula o total com base no catálogo ativo.
 for v_item in select value from jsonb_array_elements(p_itens) loop
   v_qtd:=coalesce((v_item->>'qtd')::integer,1);
   if v_qtd not between 1 and 30 then raise exception 'Quantidade inválida'; end if;
   select * into v_prod from public.factory_catalogo_produtos where id=v_item->>'tamanho' and ativo=true;
   if not found then raise exception 'Produto indisponível'; end if;
   v_preco:=v_prod.preco; v_qtd_frutas:=0;
   for v_add_id in select value from jsonb_array_elements_text(coalesce(v_item->'complementos','[]'::jsonb)) loop
     select * into v_add from public.factory_catalogo_adicionais where id=v_add_id and ativo=true;
     if not found then raise exception 'Adicional indisponível'; end if;
     if v_prod.categoria='Salada de frutas' and v_add.categoria='Frutas da Salada' then
       v_qtd_frutas:=v_qtd_frutas+1;
     else
       v_preco:=v_preco+v_add.preco;
     end if;
   end loop;
   if v_prod.categoria='Salada de frutas' then
     v_limite_frutas:=case when v_prod.id='salada-300ml' then 3 when v_prod.id='salada-500ml' then 4 when v_prod.id='salada-700ml' then 5 else 3 end;
     v_extras_frutas:=greatest(0,v_qtd_frutas-v_limite_frutas);
     v_preco:=v_preco+(v_extras_frutas*2.50);
   end if;
   v_total:=v_total+(v_preco*v_qtd);
 end loop;

 insert into public.pedidos(nome,endereco,telefone,pagamento,total,status)
 values(trim(p_nome),trim(p_endereco),trim(p_telefone),p_pagamento,v_total,'Pendente') returning id into v_id;

 -- Grava os itens com o preço individual já incluindo frutas extras.
 for v_item in select value from jsonb_array_elements(p_itens) loop
   v_qtd:=coalesce((v_item->>'qtd')::integer,1);
   select * into v_prod from public.factory_catalogo_produtos where id=v_item->>'tamanho';
   v_preco:=v_prod.preco; v_comps:=array[]::text[]; v_qtd_frutas:=0;
   for v_add_id in select value from jsonb_array_elements_text(coalesce(v_item->'complementos','[]'::jsonb)) loop
     select * into v_add from public.factory_catalogo_adicionais where id=v_add_id;
     if v_prod.categoria='Salada de frutas' and v_add.categoria='Frutas da Salada' then
       v_qtd_frutas:=v_qtd_frutas+1;
     else
       v_preco:=v_preco+v_add.preco;
     end if;
     v_comps:=array_append(v_comps,v_add.nome);
   end loop;
   if v_prod.categoria='Salada de frutas' then
     v_limite_frutas:=case when v_prod.id='salada-300ml' then 3 when v_prod.id='salada-500ml' then 4 when v_prod.id='salada-700ml' then 5 else 3 end;
     v_extras_frutas:=greatest(0,v_qtd_frutas-v_limite_frutas);
     v_preco:=v_preco+(v_extras_frutas*2.50);
   end if;
   insert into public.itens_pedido(pedido_id,nome,tamanho,qtd,preco,complementos,observacao)
   values(v_id,left(coalesce(v_prod.nome,'Açaí'),100),left(coalesce(v_prod.valor,''),30),v_qtd,v_preco,v_comps,left(coalesce(v_item->>'observacao',''),500));
 end loop;
 return jsonb_build_object('id',v_id,'total',v_total);
end; $$;
revoke all on function public.factory_criar_pedido(text,text,text,text,jsonb) from public;
grant execute on function public.factory_criar_pedido(text,text,text,text,jsonb) to anon,authenticated;

-- Conferência do catálogo após executar a atualização.
select id,nome,preco,categoria,ativo from public.factory_catalogo_adicionais
where categoria in ('Frutas','Frutas da Salada','Bebidas') order by categoria,ordem;
select id,nome,preco,categoria,ativo from public.factory_catalogo_produtos
where categoria='Salada de frutas' order by ordem;
