import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#12071e] text-white relative overflow-hidden font-sans">
      {/* Background roxo profundo */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#12071e] via-[#1e1130] to-[#12071e]" />

      {/* Orbs decorativos roxos */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] animate-float" aria-hidden="true" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] animate-float" style={{ animationDelay: '2s' }} aria-hidden="true" />

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="px-6 py-6 lg:px-12">
          <nav className="max-w-7xl mx-auto flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <img src="/logo-factory-acai.png" alt="Factory Açaí" className="w-10 h-10" />
              <span className="font-display text-2xl font-bold tracking-tighter text-white">FACTORY AÇAÍ</span>
            </Link>

            <div className="hidden md:flex items-center gap-8 text-sm font-medium text-purple-200">
              <Link href="#cardapio" className="hover:text-white transition-colors">Cardápio</Link>
              <Link href="#sobre" className="hover:text-white transition-colors">Sobre</Link>
              <Link href="#contato" className="hover:text-white transition-colors">Contato</Link>
              <a
                href="https://wa.me/5511999999999"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-purple-500 hover:bg-purple-400 text-white px-5 py-2 rounded-full font-bold transition-all shadow-[0_0_20px_rgba(168,85,247,0.6)]"
              >
                Pedir pelo WhatsApp
              </a>
            </div>

            <button className="md:hidden text-purple-200">Menu</button>
          </nav>
        </header>

        {/* Hero */}
        <section className="flex-1 flex items-center justify-center px-6 lg:px-12 pt-20 pb-32">
          <div className="max-w-7xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 mb-8 backdrop-blur-sm">
              <span className="text-xs font-bold text-purple-300 uppercase tracking-widest">Loja Oficial</span>
              <span className="w-1.5 h-1.5 rounded-full bg-pink-500"></span>
              <span className="text-xs font-bold text-purple-300 uppercase tracking-widest">Delivery</span>
            </div>

            <img
              src="/logo-factory-acai.png"
              alt="Logo Factory Açaí"
              className="mx-auto mb-10 w-[300px] md:w-[440px]"
            />

            <h1 className="font-display text-6xl lg:text-8xl font-bold mb-6 leading-tight text-white">
              O Melhor<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-fuchsia-500">
                Açaí da Cidade
              </span>
            </h1>

            <p className="text-lg lg:text-xl text-purple-200 max-w-2xl mx-auto mb-10 leading-relaxed">
              Açaí premium, cremoso e feito com frutas selecionadas. Monte seu copo como quiser e receba em casa com rapidez.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="#cardapio"
                className="bg-white text-[#12071e] px-8 py-4 rounded-full font-bold text-lg hover:bg-pink-500 hover:text-white transition-all shadow-[0_0_30px_rgba(255,255,255,0.3)]"
              >
                Ver Cardápio
              </Link>
              <a
                href="https://wa.me/5511999999999"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-pink-500 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-pink-400 transition-all shadow-[0_0_30px_rgba(236,72,153,0.6)]"
              >
                Pedir pelo WhatsApp <span className="ml-2">→</span>
              </a>
            </div>
          </div>
        </section>

        {/* Sobre */}
        <section id="sobre" className="py-20 px-6 lg:px-12 border-t border-purple-900/50">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="font-display text-4xl font-bold mb-6 text-white">
                  Por que escolher a Factory Açaí?
                </h2>
                <ul className="space-y-4 text-purple-200">
                  <li className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center text-xs font-bold">✓</span>
                    Açaí puro e cremoso, feito com frutas selecionadas
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center text-xs font-bold">✓</span>
                    Ingredientes frescos e toppings ilimitados
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center text-xs font-bold">✓</span>
                    Entrega rápida para toda a região
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center text-xs font-bold">✓</span>
                    Atendimento direto pelo WhatsApp
                  </li>
                </ul>
              </div>
              <div className="flex justify-center">
                <div className="w-64 h-64 bg-gradient-to-br from-purple-600 to-purple-900 rounded-3xl p-4 border border-purple-400/30 shadow-[0_0_40px_rgba(168,85,247,0.4)]">
                  <img src="/logo-factory-acai.png" alt="Factory Açaí" className="w-full h-full object-contain" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Cardápio */}
        <section id="cardapio" className="py-20 px-6 lg:px-12 bg-[#1e1130]">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="font-display text-4xl font-bold mb-4 text-white">Nosso Cardápio</h2>
              <p className="text-purple-200">Escolha seu tamanho, base e complementos favoritos</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Tamanhos */}
              <div className="bg-[#12071e]/50 p-6 rounded-2xl border border-purple-900/50 hover:border-purple-500/50 transition-colors group">
                <div className="text-purple-400 font-bold text-lg mb-2">🥤 Tamanhos</div>
                <ul className="space-y-3 text-purple-200 text-sm">
                  <li className="flex justify-between">
                    <span>Pequeno 350ml</span>
                    <span>R$ 14,90</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Médio 500ml</span>
                    <span>R$ 19,90</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Grande 700ml</span>
                    <span>R$ 24,90</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Família 1 Litro</span>
                    <span>R$ 32,90</span>
                  </li>
                </ul>
              </div>

              {/* Bases */}
              <div className="bg-[#12071e]/50 p-6 rounded-2xl border border-purple-900/50 hover:border-purple-500/50 transition-colors group">
                <div className="text-pink-400 font-bold text-lg mb-2">🍯 Bases</div>
                <ul className="space-y-3 text-purple-200 text-sm">
                  <li className="flex justify-between">
                    <span>Açaí Tradicional</span>
                    <span>Incluso</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Açaí Zero Açúcar</span>
                    <span>+ R$ 2,00</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Açaí Premium</span>
                    <span>+ R$ 4,00</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Base de Pitaya</span>
                    <span>+ R$ 5,00</span>
                  </li>
                </ul>
              </div>

              {/* Complementos */}
              <div className="bg-[#12071e]/50 p-6 rounded-2xl border border-purple-900/50 hover:border-purple-500/50 transition-colors group">
                <div className="text-purple-400 font-bold text-lg mb-2">🍓 Complementos</div>
                <ul className="space-y-3 text-purple-200 text-sm">
                  <li className="flex justify-between">
                    <span>Morango</span>
                    <span>+ R$ 2,50</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Banana</span>
                    <span>+ R$ 1,50</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Kiwi</span>
                    <span>+ R$ 3,00</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Nutella / Leite Condensado</span>
                    <span>+ R$ 4,00</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* CTA final */}
        <section className="py-20 px-6 lg:px-12">
          <div className="max-w-3xl mx-auto text-center">
            <div className="relative p-12 rounded-3xl bg-gradient-to-r from-purple-600 to-purple-900 overflow-hidden shadow-[0_0_50px_rgba(168,85,247,0.5)]">
              <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" aria-hidden="true" />
              <div className="relative z-10">
                <h2 className="font-display text-3xl lg:text-4xl font-bold mb-4 text-white">
                  Pronto para pedir?
                </h2>
                <p className="text-purple-100 mb-8">
                  Entre em contato pelo WhatsApp e faça seu pedido agora mesmo.
                </p>
                <a
                  href="https://wa.me/5511999999999"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white text-[#12071e] px-10 py-4 rounded-full font-bold text-lg hover:bg-pink-100 transition-all shadow-[0_0_30px_rgba(255,255,255,0.4)]"
                >
                  Abrir WhatsApp
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer id="contato" className="border-t border-purple-900/50 bg-[#0c0516] py-12 px-6 lg:px-12">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-purple-300">
            <div className="flex items-center gap-3">
              <img src="/logo-factory-acai.png" alt="Factory Açaí" className="w-8 h-8" />
              <span className="font-display font-bold text-white">FACTORY AÇAÍ</span>
            </div>
            <p>© {new Date().getFullYear()} Factory Açaí. Todos os direitos reservados.</p>
            <div className="flex items-center gap-6">
              <a
                href="https://wa.me/5511999999999"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                WhatsApp
              </a>
              <Link href="#cardapio" className="hover:text-white transition-colors">
                Cardápio
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </main>
  )
}
