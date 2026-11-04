-- FACTORY AÇAÍ — atualizar consulta para usar somente o número do pedido
-- Execute este bloco no SQL Editor do Supabase no banco que já está em uso.
-- Não apaga pedidos nem itens existentes.

drop function if exists public.factory_consultar_pedido(bigint, text);
drop function if exists public.factory_consultar_pedido(bigint);

create function public.factory_consultar_pedido(p_numero bigint)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select case
    when p.id is null then null
    else jsonb_build_object(
      'id', p.id,
      'total', p.total,
      'status', p.status,
      'criado_em', p.criado_em,
      'itens', coalesce((
        select jsonb_agg(
          jsonb_build_object(
            'nome', i.nome,
            'tamanho', i.tamanho,
            'qtd', i.qtd,
            'preco', i.preco,
            'complementos', i.complementos,
            'observacao', i.observacao
          ) order by i.id
        )
        from public.itens_pedido i
        where i.pedido_id = p.id
      ), '[]'::jsonb)
    )
  end
  from public.pedidos p
  where p.id = p_numero
  limit 1;
$$;

revoke all on function public.factory_consultar_pedido(bigint) from public;
grant execute on function public.factory_consultar_pedido(bigint) to anon, authenticated;
