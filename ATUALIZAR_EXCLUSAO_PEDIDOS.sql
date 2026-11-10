-- FACTORY AÇAÍ — permissões para excluir pedidos pelo painel administrativo.
-- Execute no Supabase SQL Editor usando o projeto já existente.
-- A tabela itens_pedido já deve ter FK para pedidos(id) com ON DELETE CASCADE.

ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.itens_pedido ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS pedidos_admin_delete ON public.pedidos;
CREATE POLICY pedidos_admin_delete
ON public.pedidos
FOR DELETE
TO authenticated
USING (public.factory_is_admin());

GRANT DELETE ON TABLE public.pedidos TO authenticated;

-- A exclusão do pedido apaga automaticamente seus itens vinculados
-- por causa da chave estrangeira ON DELETE CASCADE.
