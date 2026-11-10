-- FACTORY AÇAÍ | Atualização de bebidas, Paçoquinha Zero e frutas da salada
-- Execute no Supabase > SQL Editor. Os preços abaixo estão temporariamente em R$ 0,00
-- porque os valores ainda não foram definidos. Edite pelo painel administrativo depois.

insert into public.factory_catalogo_adicionais (id, nome, preco, categoria, emoji, ativo, ordem)
values
  ('coca-cola-310', 'Coca-Cola 310ml', 0, 'Bebidas', '🥤', true, 1),
  ('coca-cola-zero-310', 'Coca-Cola Zero 310ml', 0, 'Bebidas', '🥤', true, 2),
  ('guarana-350', 'Guaraná 350ml', 0, 'Bebidas', '🥤', true, 3),
  ('guarana-zero-350', 'Guaraná Zero 350ml', 0, 'Bebidas', '🥤', true, 4),
  ('pacoquinha-zero', 'Paçoquinha Zero', 0, 'Chocolates, doces e complementos', '🥜', true, 34)
on conflict (id) do update set
  nome = excluded.nome,
  categoria = excluded.categoria,
  emoji = excluded.emoji,
  ativo = true;

insert into public.factory_catalogo_adicionais (id, nome, preco, categoria, emoji, ativo, ordem)
values
  ('salada-morango', 'Morango', 0, 'Frutas da Salada', '🍓', true, 1),
  ('salada-maracuja', 'Maracujá', 0, 'Frutas da Salada', '🍈', true, 2),
  ('salada-banana', 'Banana', 0, 'Frutas da Salada', '🍌', true, 3),
  ('salada-kiwi', 'Kiwi', 0, 'Frutas da Salada', '🥝', true, 4),
  ('salada-uva-verde', 'Uva verde sem semente', 0, 'Frutas da Salada', '🍇', true, 5),
  ('salada-abacaxi', 'Abacaxi', 0, 'Frutas da Salada', '🍍', true, 6),
  ('salada-manga', 'Manga', 0, 'Frutas da Salada', '🥭', true, 7),
  ('salada-laranja', 'Laranja', 0, 'Frutas da Salada', '🍊', true, 8),
  ('salada-maca-verde', 'Maçã verde', 0, 'Frutas da Salada', '🍏', true, 9)
on conflict (id) do update set
  nome = excluded.nome,
  categoria = excluded.categoria,
  emoji = excluded.emoji,
  ativo = true;
