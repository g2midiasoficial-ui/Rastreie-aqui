import React, { useEffect } from 'react';
import { ArrowLeft, ShieldCheck, FileText, RotateCcw, Cookie, Mail } from 'lucide-react';

export type PolicySlug = 'privacidade' | 'termos' | 'reembolso' | 'cookies';

const CONTACT_EMAIL = 'g2midiasoficial@gmail.com';
const LAST_UPDATED = '16 de outubro de 2026';

export const POLICY_PAGES: { slug: PolicySlug; path: string; label: string; title: string; icon: React.ElementType }[] = [
  { slug: 'privacidade', path: '/privacidade', label: 'Privacidade', title: 'Política de Privacidade', icon: ShieldCheck },
  { slug: 'termos', path: '/termos', label: 'Termos de Uso', title: 'Termos de Uso', icon: FileText },
  { slug: 'reembolso', path: '/reembolso', label: 'Cancelamento e Reembolso', title: 'Política de Cancelamento e Reembolso', icon: RotateCcw },
  { slug: 'cookies', path: '/cookies', label: 'Cookies', title: 'Política de Cookies e Armazenamento Local', icon: Cookie }
];

/** Retorna a política correspondente ao endereço atual (ex.: /privacidade), ou null. */
export function getPolicyFromPath(pathname: string): PolicySlug | null {
  const clean = pathname.replace(/\/+$/, '').toLowerCase();
  if (clean === '/politicas') return 'privacidade';
  return POLICY_PAGES.find((p) => p.path === clean)?.slug ?? null;
}

/** Navega para uma página do site sem recarregar (o App escuta o evento popstate). */
export function navigateTo(path: string) {
  window.history.pushState({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
  window.scrollTo(0, 0);
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-xl font-bold text-white">{title}</h2>
      <div className="space-y-3 text-[15px] leading-relaxed text-slate-300">{children}</div>
    </section>
  );
}

function List({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="space-y-2 pl-5 list-disc marker:text-slate-500">
      {items.map((item, i) => <li key={i}>{item}</li>)}
    </ul>
  );
}

const Email = () => (
  <a href={`mailto:${CONTACT_EMAIL}`} className="text-blue-300 hover:text-blue-200 underline underline-offset-2">{CONTACT_EMAIL}</a>
);

function PolicyLink({ slug, children }: { slug: PolicySlug; children: React.ReactNode }) {
  const page = POLICY_PAGES.find((p) => p.slug === slug)!;
  return (
    <a
      href={page.path}
      onClick={(e) => { e.preventDefault(); navigateTo(page.path); }}
      className="text-blue-300 hover:text-blue-200 underline underline-offset-2"
    >
      {children}
    </a>
  );
}

function PrivacyContent() {
  return (
    <>
      <p className="text-[15px] leading-relaxed text-slate-300">
        Esta política explica como o <strong className="text-white">Gerenciie Pro</strong> ("nós") coleta, usa, guarda e protege os dados pessoais de quem usa o site www.gerenciie.com.br, a plataforma e a extensão para navegador, em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018, "LGPD").
      </p>

      <Section title="1. Quem é o responsável pelos seus dados">
        <p>O controlador dos dados pessoais é o Gerenciie Pro. Para qualquer assunto sobre privacidade, inclusive para exercer seus direitos, fale com o nosso canal de atendimento ao titular: <Email />.</p>
      </Section>

      <Section title="2. Quais dados coletamos">
        <List items={[
          <><strong className="text-white">Dados de cadastro:</strong> nome, e-mail e senha. A senha é guardada de forma criptografada e não temos acesso a ela.</>,
          <><strong className="text-white">Login com Google:</strong> se você entrar com o Google, recebemos seu nome, e-mail e foto de perfil. Não temos acesso à sua senha do Google nem a outros dados da sua conta Google.</>,
          <><strong className="text-white">Dados que você cadastra na plataforma:</strong> contas bancárias e cartões (apenas nome, tipo e saldo informados por você, nunca números de cartão ou senhas bancárias), receitas, despesas, dívidas, metas, categorias, lista de mercado, veículos, agenda e informações de produtos, custos e campanhas.</>,
          <><strong className="text-white">Mensagens para os agentes de IA:</strong> o texto que você envia ao Agente CFO e ao agente financeiro, junto com os dados da sua conta necessários para responder.</>,
          <><strong className="text-white">Extensão para navegador:</strong> seu e-mail, a sessão de login e os cálculos e produtos que você salva na extensão. Quando você usa a captura de dados, a extensão lê o título e o preço do produto na página aberta, apenas para preencher a calculadora.</>,
          <><strong className="text-white">Dados técnicos:</strong> endereço IP, tipo de navegador, data e hora de acesso, registrados automaticamente pelos nossos provedores de hospedagem e autenticação para segurança e funcionamento do serviço.</>
        ]} />
      </Section>

      <Section title="3. Para que usamos os dados e com qual base legal">
        <List items={[
          <>Criar e manter sua conta, autenticar seu acesso e prestar o serviço contratado (execução de contrato, art. 7º, V, da LGPD).</>,
          <>Gerar cálculos, relatórios e respostas dos agentes de IA a partir dos dados que você cadastra (execução de contrato).</>,
          <>Manter a segurança, prevenir fraudes e acessos indevidos (legítimo interesse, art. 7º, IX).</>,
          <>Cumprir obrigações legais e responder a autoridades (art. 7º, II).</>,
          <>Enviar comunicações sobre sua conta, como confirmação de e-mail e avisos importantes do serviço (execução de contrato).</>
        ]} />
        <p>Não vendemos seus dados pessoais e não usamos seus dados financeiros para publicidade.</p>
      </Section>

      <Section title="4. Com quem compartilhamos">
        <p>Compartilhamos dados somente com fornecedores necessários para o funcionamento da plataforma, que atuam como operadores e tratam os dados conforme nossas instruções:</p>
        <List items={[
          <><strong className="text-white">Supabase:</strong> banco de dados e autenticação. Os dados da plataforma ficam armazenados na região de São Paulo (Brasil).</>,
          <><strong className="text-white">Vercel:</strong> hospedagem do site e do servidor da plataforma.</>,
          <><strong className="text-white">Google:</strong> login com Google (quando você escolhe essa opção) e o modelo de IA Gemini, que processa as mensagens enviadas aos agentes de IA. O site também carrega fontes do Google Fonts.</>
        ]} />
        <p>Também podemos compartilhar dados quando exigido por lei, ordem judicial ou autoridade competente.</p>
      </Section>

      <Section title="5. Transferência internacional">
        <p>Alguns fornecedores (como Vercel e Google) podem processar dados em servidores fora do Brasil. Nesses casos, a transferência ocorre para a prestação do serviço contratado por você e com fornecedores que adotam medidas de segurança e proteção de dados compatíveis com a LGPD (art. 33).</p>
      </Section>

      <Section title="6. Por quanto tempo guardamos">
        <p>Guardamos seus dados enquanto sua conta estiver ativa. Quando você pede a exclusão da conta, apagamos seus dados de cadastro e todos os dados financeiros cadastrados por você. Podemos manter por mais tempo apenas o que for exigido por lei, como registros de acesso, que devem ser guardados por 6 meses (Marco Civil da Internet, art. 15).</p>
      </Section>

      <Section title="7. Como protegemos seus dados">
        <List items={[
          'Toda a comunicação é feita por conexão criptografada (HTTPS).',
          'Cada conta acessa apenas os próprios dados: o banco de dados bloqueia o acesso a informações de outros usuários.',
          'Senhas são armazenadas com criptografia e as chaves de serviços de IA ficam somente no servidor.',
          'O acesso administrativo é restrito a contas autorizadas.'
        ]} />
        <p>Nenhum sistema é totalmente imune a incidentes. Se ocorrer um incidente de segurança que possa causar risco ou dano relevante, avisaremos você e a Autoridade Nacional de Proteção de Dados (ANPD), conforme a LGPD.</p>
      </Section>

      <Section title="8. Seus direitos">
        <p>Pela LGPD (art. 18), você pode, a qualquer momento:</p>
        <List items={[
          'confirmar se tratamos seus dados e acessá-los;',
          'corrigir dados incompletos, inexatos ou desatualizados;',
          'pedir a anonimização, o bloqueio ou a eliminação de dados desnecessários ou tratados em desconformidade com a lei;',
          'pedir a portabilidade dos seus dados;',
          'pedir a exclusão da sua conta e dos seus dados;',
          'saber com quem compartilhamos seus dados;',
          'revogar o consentimento, quando o tratamento se basear nele;',
          'apresentar reclamação à ANPD.'
        ]} />
        <p>Para exercer qualquer direito, envie um e-mail para <Email /> a partir do e-mail cadastrado. Responderemos em até 15 dias.</p>
      </Section>

      <Section title="9. Armazenamento local e cookies">
        <p>O site usa o armazenamento local do navegador para manter você conectado e lembrar preferências. Não usamos cookies de publicidade. Veja os detalhes na <PolicyLink slug="cookies">Política de Cookies</PolicyLink>.</p>
      </Section>

      <Section title="10. Crianças e adolescentes">
        <p>O Gerenciie Pro é destinado a maiores de 18 anos e não coleta intencionalmente dados de crianças ou adolescentes.</p>
      </Section>

      <Section title="11. Alterações desta política">
        <p>Podemos atualizar esta política. A data da última atualização fica no topo da página. Mudanças relevantes serão comunicadas pelo site ou por e-mail.</p>
      </Section>
    </>
  );
}

function TermsContent() {
  return (
    <>
      <p className="text-[15px] leading-relaxed text-slate-300">
        Estes Termos de Uso regulam o uso do <strong className="text-white">Gerenciie Pro</strong>, incluindo o site www.gerenciie.com.br, a plataforma e a extensão para navegador. Ao criar uma conta ou usar o serviço, você declara que leu e concorda com estes termos e com a <PolicyLink slug="privacidade">Política de Privacidade</PolicyLink>.
      </p>

      <Section title="1. O serviço">
        <p>O Gerenciie Pro é uma plataforma de gestão para quem vende em e-commerce, dropshipping e marketplaces. Oferece calculadora de precificação, CPA Breakeven, planejamento de tráfego, DRE, simulações de escala, organização financeira pessoal e da empresa, agentes de inteligência artificial e uma extensão para navegador.</p>
      </Section>

      <Section title="2. Sua conta">
        <List items={[
          'Você precisa ter 18 anos ou mais e fornecer informações verdadeiras no cadastro.',
          'Você é responsável por manter sua senha em sigilo e por todas as atividades feitas na sua conta.',
          <>Se perceber uso não autorizado, avise imediatamente pelo e-mail <Email />.</>,
          'O modo "Testar sem cadastro" guarda os dados apenas no seu navegador; eles podem ser perdidos ao limpar o navegador e não ficam vinculados a uma conta.'
        ]} />
      </Section>

      <Section title="3. Uso permitido">
        <p>Você concorda em não:</p>
        <List items={[
          'usar o serviço para atividades ilegais ou para prejudicar terceiros;',
          'tentar acessar dados de outros usuários ou burlar mecanismos de segurança;',
          'copiar, revender ou redistribuir a plataforma ou a extensão sem autorização;',
          'sobrecarregar o serviço com acessos automatizados ou usar os agentes de IA de forma abusiva.'
        ]} />
      </Section>

      <Section title="4. Cálculos, relatórios e inteligência artificial">
        <p>Os cálculos, simulações, relatórios e respostas dos agentes de IA são <strong className="text-white">estimativas</strong> baseadas nos dados que você informa. Eles não substituem a orientação de contador, consultor financeiro, tributário ou jurídico. As respostas da IA podem conter erros. As decisões de preço, investimento em anúncios e gestão do seu negócio são de sua responsabilidade.</p>
        <p>Taxas de marketplaces, impostos e regras de plataformas mudam com frequência. Confira sempre os valores vigentes nos canais em que você vende.</p>
      </Section>

      <Section title="5. Planos e pagamento">
        <p>Os planos, preços e recursos de cada plano são os informados na página de vendas no momento da contratação. Pagamentos podem ser processados por plataformas de pagamento parceiras, sujeitas aos próprios termos. Cancelamento e reembolso seguem a <PolicyLink slug="reembolso">Política de Cancelamento e Reembolso</PolicyLink>.</p>
      </Section>

      <Section title="6. Seus dados e conteúdo">
        <p>Os dados que você cadastra continuam sendo seus. Você nos autoriza a tratá-los apenas para prestar o serviço, conforme a <PolicyLink slug="privacidade">Política de Privacidade</PolicyLink>. Você é responsável pela veracidade e legalidade das informações que cadastra.</p>
      </Section>

      <Section title="7. Propriedade intelectual">
        <p>A marca Gerenciie Pro, o software, o design e os conteúdos da plataforma pertencem ao Gerenciie Pro e são protegidos por lei. O uso do serviço não transfere nenhum direito sobre eles.</p>
      </Section>

      <Section title="8. Disponibilidade e alterações do serviço">
        <p>Trabalhamos para manter a plataforma disponível, mas podem ocorrer interrupções para manutenção, atualizações ou por falhas de fornecedores. Podemos alterar, incluir ou remover funcionalidades para melhorar o serviço.</p>
      </Section>

      <Section title="9. Limitação de responsabilidade">
        <p>Na máxima extensão permitida pela lei, o Gerenciie Pro não se responsabiliza por lucros cessantes, prejuízos comerciais ou decisões tomadas com base em cálculos, simulações ou respostas da IA, nem por falhas causadas por terceiros, como marketplaces, bancos e provedores de internet. Nada nestes termos limita direitos garantidos pelo Código de Defesa do Consumidor.</p>
      </Section>

      <Section title="10. Suspensão e encerramento">
        <p>Você pode encerrar sua conta a qualquer momento pedindo pelo e-mail <Email />. Podemos suspender ou encerrar contas que violem estes termos, com aviso sempre que possível.</p>
      </Section>

      <Section title="11. Alterações destes termos">
        <p>Podemos atualizar estes termos. A data da última atualização fica no topo da página. Mudanças relevantes serão comunicadas pelo site ou por e-mail; continuar usando o serviço depois disso significa concordar com a nova versão.</p>
      </Section>

      <Section title="12. Lei aplicável">
        <p>Estes termos são regidos pelas leis brasileiras. Fica eleito o foro do domicílio do consumidor para resolver eventuais conflitos.</p>
      </Section>
    </>
  );
}

function RefundContent() {
  return (
    <>
      <p className="text-[15px] leading-relaxed text-slate-300">
        Esta política explica como cancelar sua assinatura do <strong className="text-white">Gerenciie Pro</strong> e em quais casos você tem direito a reembolso, de acordo com o Código de Defesa do Consumidor (CDC).
      </p>

      <Section title="1. Direito de arrependimento (7 dias)">
        <p>Como a contratação é feita pela internet, você pode desistir em até <strong className="text-white">7 dias corridos</strong> a partir da contratação ou do primeiro pagamento, sem precisar justificar (art. 49 do CDC). Nesse caso, devolvemos <strong className="text-white">100% do valor pago</strong>.</p>
      </Section>

      <Section title="2. Cancelamento depois de 7 dias">
        <List items={[
          'Você pode cancelar a assinatura a qualquer momento, sem multa.',
          'O cancelamento interrompe as próximas cobranças.',
          'Você mantém o acesso aos recursos pagos até o fim do período já pago.',
          'Não há reembolso proporcional do período já iniciado, salvo quando exigido por lei ou em caso de falha do serviço que impeça o uso.'
        ]} />
      </Section>

      <Section title="3. Planos anuais">
        <p>No plano anual vale o mesmo direito de arrependimento de 7 dias, com reembolso integral. Depois desse prazo, o cancelamento impede a renovação e o acesso continua até o fim do período contratado.</p>
      </Section>

      <Section title="4. Como pedir cancelamento ou reembolso">
        <List items={[
          <>Envie um e-mail para <Email /> a partir do e-mail cadastrado na sua conta.</>,
          'Informe se deseja cancelar a assinatura ou pedir reembolso.',
          'Se a compra foi feita por uma plataforma de pagamento parceira, você também pode pedir o reembolso diretamente por ela, seguindo as regras dessa plataforma.'
        ]} />
        <p>Confirmamos o pedido em até 5 dias úteis.</p>
      </Section>

      <Section title="5. Prazo do reembolso">
        <p>O reembolso é feito pelo mesmo meio de pagamento usado na compra. No cartão de crédito, o estorno pode aparecer em até duas faturas, conforme o banco emissor. No Pix ou boleto, a devolução é feita em até 10 dias úteis após a confirmação.</p>
      </Section>

      <Section title="6. Dados após o cancelamento">
        <p>Cancelar a assinatura não apaga sua conta automaticamente. Se quiser que seus dados sejam excluídos, peça pelo e-mail <Email />, conforme a <PolicyLink slug="privacidade">Política de Privacidade</PolicyLink>.</p>
      </Section>
    </>
  );
}

function CookiesContent() {
  return (
    <>
      <p className="text-[15px] leading-relaxed text-slate-300">
        Esta política explica como o <strong className="text-white">Gerenciie Pro</strong> usa cookies e o armazenamento local do navegador.
      </p>

      <Section title="1. Resumo">
        <p>O Gerenciie Pro <strong className="text-white">não usa cookies de publicidade nem de rastreamento</strong>. Usamos apenas o armazenamento local do navegador (localStorage), que é necessário para o funcionamento da plataforma.</p>
      </Section>

      <Section title="2. O que guardamos no seu navegador">
        <List items={[
          <><strong className="text-white">Sessão de login:</strong> mantém você conectado entre visitas. É removida quando você sai da conta.</>,
          <><strong className="text-white">Preferências:</strong> por exemplo, o modo pessoal ou empresa e escolhas de exibição.</>,
          <><strong className="text-white">Cópia temporária dos seus dados:</strong> deixa a plataforma mais rápida. A cópia principal fica no nosso banco de dados.</>,
          <><strong className="text-white">Modo "Testar sem cadastro":</strong> os dados ficam somente no seu navegador.</>,
          <><strong className="text-white">Extensão para navegador:</strong> guarda a sessão de login e os cálculos no armazenamento da própria extensão (chrome.storage).</>
        ]} />
        <p>Como esse armazenamento é essencial para o serviço funcionar, ele não depende de consentimento, conforme a LGPD.</p>
      </Section>

      <Section title="3. Serviços de terceiros">
        <List items={[
          <><strong className="text-white">Login com Google:</strong> ao entrar com o Google, o próprio Google pode usar cookies no domínio dele durante o login.</>,
          <><strong className="text-white">Google Fonts:</strong> as fontes do site são carregadas dos servidores do Google, que recebem dados técnicos como o endereço IP.</>
        ]} />
      </Section>

      <Section title="4. Como apagar ou bloquear">
        <p>Você pode apagar os dados do site nas configurações do seu navegador ("Limpar dados de navegação" ou "Dados de sites"). Se fizer isso, você será desconectado e os dados do modo "Testar sem cadastro" serão perdidos. Os dados da sua conta continuam salvos no nosso banco de dados.</p>
      </Section>

      <Section title="5. Mudanças">
        <p>Se passarmos a usar cookies de análise ou publicidade, atualizaremos esta política e pediremos seu consentimento antes.</p>
      </Section>
    </>
  );
}

interface PoliciesPageProps {
  policy: PolicySlug;
  onBack: () => void;
}

export function PoliciesPage({ policy, onBack }: PoliciesPageProps) {
  const current = POLICY_PAGES.find((p) => p.slug === policy) ?? POLICY_PAGES[0];

  useEffect(() => {
    const previous = document.title;
    document.title = `${current.title} | Gerenciie Pro`;
    return () => { document.title = previous; };
  }, [current.title]);

  return (
    <div className="min-h-screen bg-slate-950 text-white font-['Plus_Jakarta_Sans'] antialiased">
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-slate-950/85 border-b border-white/5">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <a
            href="/"
            onClick={(e) => { e.preventDefault(); onBack(); }}
            className="flex items-center gap-2.5"
          >
            <img src="/logo-192.png" alt="" className="w-9 h-9 rounded-xl" />
            <span className="font-extrabold text-lg tracking-tight">Gerenciie</span>
          </a>
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold text-slate-300 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          >
            <ArrowLeft size={16} />
            Voltar ao site
          </button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-14 grid grid-cols-1 md:grid-cols-[220px_1fr] gap-8 md:gap-12">
        <nav aria-label="Políticas" className="min-w-0 md:sticky md:top-24 self-start">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">Políticas</p>
          <ul className="flex md:flex-col gap-2 overflow-x-auto pb-2 md:pb-0 -mx-4 px-4 md:mx-0 md:px-0">
            {POLICY_PAGES.map((p) => {
              const active = p.slug === current.slug;
              return (
                <li key={p.slug} className="shrink-0">
                  <a
                    href={p.path}
                    onClick={(e) => { e.preventDefault(); navigateTo(p.path); }}
                    aria-current={active ? 'page' : undefined}
                    className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold whitespace-nowrap md:whitespace-normal transition-colors ${
                      active ? 'bg-blue-600/15 text-blue-200 border border-blue-500/30' : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <p.icon size={16} className="shrink-0" />
                    {p.label}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        <article className="min-w-0 space-y-8">
          <header className="space-y-2 pb-6 border-b border-white/5">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">{current.title}</h1>
            <p className="text-sm text-slate-500">Última atualização: {LAST_UPDATED}</p>
          </header>

          {current.slug === 'privacidade' && <PrivacyContent />}
          {current.slug === 'termos' && <TermsContent />}
          {current.slug === 'reembolso' && <RefundContent />}
          {current.slug === 'cookies' && <CookiesContent />}

          <div className="mt-4 rounded-2xl border border-white/5 bg-slate-900/50 p-5 flex items-start gap-3">
            <Mail size={18} className="text-blue-300 shrink-0 mt-0.5" />
            <p className="text-sm text-slate-300">
              Dúvidas sobre esta política? Fale com a gente em <Email />.
            </p>
          </div>
        </article>
      </div>

      <footer className="border-t border-white/5">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 text-sm text-slate-500">
          Gerenciie Pro © {new Date().getFullYear()}
        </div>
      </footer>
    </div>
  );
}
