-- FACTORY ACAI | Cadastro da categoria Salada de Frutas
-- Execute no Supabase > SQL Editor > New query.
-- Os valores das frutas extras ainda nao foram definidos. Por isso, o site permite selecionar
-- frutas extras, mas bloqueia a finalizacao do pedido enquanto houver extras sem preco.

insert into public.factory_catalogo_produtos
  (id, nome, valor, preco, descricao, categoria, ativo, ordem)
values
  ('salada-300ml', 'Salada de frutas 300 ml', '300 ml', 11.00, 'Até 3 opções de frutas', 'Salada de frutas', true, 101),
  ('salada-500ml', 'Salada de frutas 500 ml', '500 ml', 17.00, 'Até 4 opções de frutas', 'Salada de frutas', true, 102),
  ('salada-700ml', 'Salada de frutas 700 ml', '700 ml', 23.00, 'Até 5 opções de frutas', 'Salada de frutas', true, 103)
on conflict (id) do update set
  nome = excluded.nome,
  valor = excluded.valor,
  preco = excluded.preco,
  descricao = excluded.descricao,
  categoria = excluded.categoria,
  ativo = true,
  ordem = excluded.ordem,
  atualizado_em = now();

-- Confere os três tamanhos cadastrados.
select id, nome, valor, preco, categoria, ativo
from public.factory_catalogo_produtos
where id in ('salada-300ml', 'salada-500ml', 'salada-700ml')
order by ordem;
