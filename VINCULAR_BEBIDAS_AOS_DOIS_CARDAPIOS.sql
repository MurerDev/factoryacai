-- FACTORY AÇAÍ | Vincula bebidas aos cardápios de Açaí e Salada de frutas.
-- As bebidas são adicionais compartilhados; o mesmo cadastro/preço é usado nos dois.
-- Execute no Supabase > SQL Editor.

insert into public.factory_catalogo_adicionais
  (id, nome, preco, categoria, emoji, ativo, ordem)
values
  ('coca-cola-310', 'Coca Cola 310ml', 0.00, 'Bebidas', '🥤', true, 1),
  ('coca-cola-zero-310', 'Coca Cola Zero 310ml', 0.00, 'Bebidas', '🥤', true, 2),
  ('guarana-350', 'Guaraná 350ml', 0.00, 'Bebidas', '🥤', true, 3),
  ('guarana-zero-350', 'Guaraná Zero 350ml', 0.00, 'Bebidas', '🥤', true, 4)
on conflict (id) do update set
  nome = excluded.nome,
  categoria = excluded.categoria,
  emoji = excluded.emoji,
  ativo = true,
  ordem = excluded.ordem,
  atualizado_em = now();

-- Confirmação: devem aparecer 4 bebidas ativas para ambos os cardápios.
select id, nome, preco, categoria, ativo
from public.factory_catalogo_adicionais
where id in ('coca-cola-310', 'coca-cola-zero-310', 'guarana-350', 'guarana-zero-350')
order by ordem;
