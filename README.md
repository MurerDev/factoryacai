# Factory Açaí — HTML, CSS, JavaScript + Supabase + Vercel

Este projeto é estático (não usa Vite/React). O Supabase guarda catálogo, pedidos e autenticação do administrador. O total do pedido é recalculado no banco, não confiando nos preços enviados pelo navegador.

## 1. Configurar o Supabase

1. Acesse o projeto `dqdnagjxjxestpgirdku` no https://supabase.com/dashboard.
2. Abra **SQL Editor → New query**.
3. Abra `supabase_setup.sql`, copie todo o conteúdo e execute uma vez.
4. Em **Project Settings → API / API Keys**, confira se `supabase-client.js` contém o Project URL e a Publishable key do seu projeto. O arquivo `supabase-client.js` já está configurado com os dados que você enviou. A URL foi ajustada para a raiz do projeto (`https://dqdnagjxjxestpgirdku.supabase.co`), sem `/rest/v1`, pois o cliente JavaScript precisa da URL raiz. A Publishable key pode ficar no navegador; nunca use Secret key ou `service_role` no site.

### Criar o usuário administrador

1. No Supabase, entre em **Authentication → Users → Add user**.
2. Cadastre o e-mail e uma senha forte para o administrador (marque confirmação de e-mail, se solicitado).
3. Copie o UUID do usuário criado.
4. No **SQL Editor**, execute, substituindo o UUID:

```sql
insert into public.factory_admins (user_id)
values ('COLE-AQUI-O-UUID-DO-USUARIO');
```

Somente usuários cujo UUID esteja em `factory_admins` conseguem entrar no painel. Não existe senha padrão no código. Se quiser adicionar outro administrador, crie outro usuário no Authentication e repita o INSERT com o UUID correspondente.

## 2. Testar localmente

Abra a pasta no VS Code e execute com a extensão Live Server. O `index.html` é a página da loja e `admin.html` é o painel. Faça um pedido de teste e confira a tabela `pedidos` e `itens_pedido` no Supabase. Entre pelo botão Admin com o e-mail e a senha criados acima.

## 3. Publicar na Vercel

1. Envie o conteúdo desta pasta para um repositório GitHub (o `index.html` deve ficar na raiz do repositório).
2. Na Vercel, clique em **Add New → Project** e importe o repositório.
3. Framework Preset: **Other**. Build Command: vazio. Output Directory: `.`. Root Directory: `./`.
4. Clique em **Deploy**.
5. Depois, em **Settings → Domains**, você pode conectar seu domínio próprio.

Não precisa configurar variáveis de ambiente na Vercel: este projeto usa HTML/JS puro e lê a conexão pública diretamente de `supabase-client.js`.

## Funcionalidades integradas

- Cardápio e adicionais carregados do Supabase.
- Gestão de produtos e adicionais pelo painel, persistida no banco.
- Pedidos e itens salvos no Supabase; total calculado no servidor SQL.
- Painel administrativo protegido por Supabase Auth + lista de administradores (`factory_admins`).
- Pedidos atualizados em tempo real no painel (habilite Realtime para a tabela `pedidos`, se necessário, em Database → Publications/Replication).
- Consulta de pedido exige número + telefone e não devolve endereço ou telefone.
- Status: Pendente, Em preparo, Saiu para entrega, Entregue e Cancelado.

## Arquivos importantes
- `admin.js`: lógica do painel administrativo (incluído nesta versão).
- `ATUALIZAR_CONSULTA.sql`: migração segura para banco existente.

- `supabase-client.js`: URL e Publishable key do projeto.
- `supabase_setup.sql`: tabelas, catálogo inicial, políticas RLS e funções RPC.
- `index.html`, `style.css`, `script.js`: loja.
- `admin.html`, `admin.css`, `admin.js`: painel administrativo funcional.
- `vercel.json`: configuração de hospedagem estática.

## Observações

- A taxa de entrega permanece a definir e não é somada ao total automaticamente.
- Configure o e-mail de recuperação de senha e SMTP em Authentication se desejar recuperação por e-mail personalizada.
- Antes de receber pedidos reais, faça um pedido de teste e confira o cadastro no Supabase.


## Atualização de consulta e checkout (04/11/2026)
- A consulta de pedidos usa somente o número do pedido.
- O SQL atualizado remove a assinatura antiga com telefone e cria `factory_consultar_pedido(p_numero bigint)`.
- A consulta pública retorna status, total, data e itens; não retorna nome, endereço ou telefone.
- O checkout valida os campos antes de acessar `.value`, evitando erro quando algum ID não existe no HTML.
- Execute o arquivo `supabase_setup.sql` apenas se estiver configurando um banco novo. Para banco já em uso, execute somente o arquivo `ATUALIZAR_CONSULTA.sql` no SQL Editor. Não é necessário recriar tabelas nem apagar pedidos.


## Atualização — páginas por categoria e Salada de Frutas

- O menu agora possui páginas separadas para Início, Açaí, Salada de frutas, Sobre e Contato.
- A Salada de frutas possui tamanhos de 300 ml (R$ 11,00, até 3 frutas), 500 ml (R$ 17,00, até 4 frutas) e 700 ml (R$ 23,00, até 5 frutas).
- As frutas disponíveis são morango, maracujá, banana, kiwi, uva verde sem semente, abacaxi, manga, laranja e maçã verde.
- Cada fruta além do limite incluído custa R$ 2,50. O preço é calculado no navegador para prévia e recalculado no Supabase para garantir o total correto.

### Instalar a atualização em um Supabase já existente

1. Abra o Supabase do projeto.
2. Entre em **SQL Editor → New query**.
3. Abra e execute `ATUALIZAR_SALADA_FRUTAS.sql`. Esse arquivo cadastra os três tamanhos da nova categoria sem apagar pedidos ou dados existentes.
4. Substitua os arquivos do site pelos arquivos desta pasta e publique novamente na Vercel.

Não execute `supabase_setup.sql` novamente em um banco que já está em uso.


## Atualização de bebidas, Paçoquinha Zero e frutas da salada

Para instalar as alterações mais recentes em um banco já existente, execute **ATUALIZACAO_FRUTAS_BEBIDAS_PEDIDOS.sql** no SQL Editor do Supabase. Esse arquivo cadastra as cinco frutas do açaí, as nove frutas da salada, as quatro bebidas, os três copos de salada e atualiza a função de criação de pedidos para cobrar R$ 2,50 por fruta extra.

As bebidas permanecem inicialmente em R$ 0,00 porque os preços não foram informados. Ajuste os valores no painel administrativo antes de receber pedidos reais.

O painel administrativo exibe os dados completos do pedido. A consulta pública do cliente continua sem expor nome, endereço, telefone ou forma de pagamento, protegendo os dados pessoais.


## Atualização de pedidos e painel (09/11/2026)
- O detalhe administrativo segue a ordem: nome do cliente, data e hora, ID, itens do pedido, observações, endereço, pagamento e total.
- O modal de detalhes do pedido recebeu um layout mais organizado e responsivo.
- A consulta pública recebeu um cartão visual atualizado com status, itens, data e total.
- No painel, as frutas do açaí, frutas da salada, tamanhos da salada e bebidas ficam disponíveis por categoria para cadastro e edição.


## Emoji personalizado nos produtos

No painel administrativo, abra Produtos, clique em Editar ou Novo Produto e preencha o campo **Emoji do produto**. Você pode digitar ou colar qualquer emoji; a prévia aparece ao lado do campo. Para bancos já existentes, execute `ATUALIZAR_EMOJI_PRODUTOS.sql` no SQL Editor do Supabase antes de publicar esta versão.
