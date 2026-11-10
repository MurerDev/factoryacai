// Cliente Supabase da Factory Açaí. A Publishable Key é pública; proteja os dados com RLS.
// Use a URL raiz do projeto (não acrescente /rest/v1).
window.factorySupabase = window.supabase.createClient(
  'https://dqdnagjxjxestpgirdku.supabase.co',
  'sb_publishable_Nf875_cibVHF7k5-QnaSYg_GqvOATQ4'
);
