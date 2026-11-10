-- FACTORY AÇAÍ | Permite definir um emoji personalizado em cada produto.
-- Execute no Supabase > SQL Editor. Seguro para executar mais de uma vez.
alter table public.factory_catalogo_produtos
  add column if not exists emoji text not null default '🥤';

-- Mantém um emoji padrão nos produtos antigos que ainda estejam sem valor.
update public.factory_catalogo_produtos
set emoji = '🥤'
where emoji is null or btrim(emoji) = '';
