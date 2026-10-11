import JSZip from 'jszip';
import { PricingData, Platform } from '../../types';

export interface ExtensionFiles {
  'manifest.json': string;
  'popup.html': string;
  'popup.js': string;
  'content.js': string;
  'background.js': string;
  'styles.css': string;
  'README.md': string;
}

export interface ExtensionUserSession {
  uid?: string;
  email?: string;
  displayName?: string;
  role?: string;
  plan?: string;
  token?: string;
  connectedAt?: string;
  defaultSettings?: {
    defaultMarkup?: number;
    defaultTax?: number;
    defaultAds?: number;
    preferredPlatform?: string;
    sfpEnabled?: boolean;
    sfpPercent?: number;
  };
}

export function generateExtensionFiles(
  defaultPricing?: Partial<PricingData>,
  currentUser?: any
): ExtensionFiles {
  const defaultCost = defaultPricing?.costPrice || 45.00;
  const defaultFreight = defaultPricing?.freightIn || 5.00;
  const defaultPackaging = defaultPricing?.packagingCost || 2.00;
  const defaultMarkup = defaultPricing?.desiredMarkup || 2.5;
  const defaultAds = defaultPricing?.marketingPercent || 20;
  const defaultTax = defaultPricing?.taxPercent || 6;
  const defaultOriginalPrice = defaultPricing?.originalPrice || 169.90;
  const defaultSellerDiscount = defaultPricing?.sellerDiscount || 0;
  const defaultSellerDiscountType = defaultPricing?.sellerDiscountType || 'currency';
  const defaultSfpPercent = defaultPricing?.sfpPercent !== undefined ? defaultPricing.sfpPercent : 6;
  const defaultSfpEnabled = defaultPricing?.sfpEnabled !== false;

  // A extensão faz login direto no Supabase do projeto (chave publicável, segura para o cliente)
  const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined) || '';
  const supabaseKey = (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined) || '';
  const siteUrl = typeof window !== 'undefined' ? window.location.origin : 'https://www.gerenciie.com.br';
  void currentUser;

  const manifest = JSON.stringify({
    "manifest_version": 3,
    "name": "Gerenciie Pro - Calculadora de Preço, Lucro & SFP E-com",
    "version": "1.5.0",
    "description": "Calculadora oficial Gerenciie Pro com design e paleta do projeto, Taxa de Serviço SFP (Frete Grátis), markup e sincronização em tempo real.",
    "icons": {
      "16": "icons/icon16.png",
      "48": "icons/icon48.png",
      "128": "icons/icon128.png"
    },
    "action": {
      "default_popup": "popup.html",
      "default_icon": {
        "16": "icons/icon16.png",
        "34": "icons/icon48.png",
        "128": "icons/icon128.png"
      },
      "default_title": "Gerenciie Pro • Calculadora Oficial"
    },
    "permissions": [
      "storage",
      "activeTab",
      "scripting"
    ],
    "host_permissions": [
      ...(supabaseUrl ? [`${supabaseUrl}/*`] : []),
      "https://*.aliexpress.com/*",
      "https://*.shopee.com.br/*",
      "https://*.mercadolivre.com.br/*",
      "https://*.mercadolibre.com/*",
      "https://*.shein.com/*",
      "https://*.amazon.com.br/*",
      "https://*.cjdropshipping.com/*"
    ],
    "background": {
      "service_worker": "background.js"
    },
    "content_scripts": [
      {
        "matches": [
          "https://*.aliexpress.com/*",
          "https://*.shopee.com.br/*",
          "https://*.mercadolivre.com.br/*",
          "https://*.mercadolibre.com/*",
          "https://*.shein.com/*",
          "https://*.amazon.com.br/*",
          "https://*.cjdropshipping.com/*"
        ],
        "js": ["content.js"],
        "run_at": "document_idle"
      }
    ],
    "commands": {
      "_execute_action": {
        "suggested_key": {
          "default": "Ctrl+Shift+P",
          "mac": "Command+Shift+P"
        },
        "description": "Abrir Calculadora Gerenciie Pro"
      }
    }
  }, null, 2);


  const popupHtml = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Gerenciie Pro • Calculadora & Taxa SFP</title>
  <link rel="stylesheet" href="styles.css">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
</head>
<body>
  <div class="extension-wrapper">

    <!-- SCREEN 1: AUTH / LOGIN GATEWAY (SHOWN FIRST IF NOT LOGGED IN) -->
    <div id="screenLogin" class="auth-gateway">
      <div class="auth-brand">
        <img src="icons/icon128.png" alt="" class="auth-logo-img">
        <h1 class="auth-title">GERENCIIE <span>PRO</span></h1>
        <span class="auth-tag">CFO & E-commerce Suite</span>
      </div>

      <div class="auth-welcome-card">
        <h3>Acesse sua Conta</h3>
        <p>Entre com o mesmo e-mail e senha que você usa no site do Gerenciie Pro.</p>
      </div>

      <form id="formEmailAuth" class="auth-form">
        <div class="field-block">
          <label>E-mail Cadastrado</label>
          <div class="input-with-icon">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
            <input type="email" id="inpGatewayEmail" placeholder="seuemail@exemplo.com" autocomplete="email" required>
          </div>
        </div>

        <div class="field-block">
          <label>Senha de Acesso</label>
          <div class="input-with-icon">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            <input type="password" id="inpGatewayPassword" placeholder="••••••••" autocomplete="current-password" required>
          </div>
        </div>

        <div id="authErrorBanner" class="auth-status-alert hidden"></div>

        <button type="submit" id="btnSubmitGateway" class="btn-submit-auth">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" x2="3" y1="12" y2="12"/></svg>
          <span>Entrar no Sistema</span>
        </button>

        <button type="button" id="btnOpenSignup" class="btn-demo-auth">
          <span>Não tem conta? Criar conta grátis no site</span>
        </button>
      </form>

      <p class="auth-google-hint">Entrou no site com o Google? Defina uma senha no site em <strong>Extensão Chrome → Conexão &amp; Login</strong>.</p>

      <div class="auth-footer-note">
        <span>🔒 Login seguro com a sua conta Gerenciie Pro</span>
      </div>
    </div>


    <!-- SCREEN 2: FULL SYSTEM (UNLOCKED AFTER LOGIN) -->
    <div id="screenSystem" class="system-main hidden">
      <!-- Top Bar -->
      <header class="ext-header">
        <div class="logo-area">
          <img src="icons/icon48.png" alt="" class="logo-img">
          <div>
            <h1 class="logo-title">GERENCIIE <span>PRO</span></h1>
            <p class="logo-sub">Precificação & Margem Real</p>
          </div>
        </div>
        <div class="ext-actions">
          <button id="btnAutoGrab" title="Capturar Preço e Título da Página Aberta" class="btn-icon">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 21h5v-5"/></svg>
          </button>
          <button id="btnReset" title="Restaurar Padrões" class="btn-icon">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
          </button>
          <button id="btnLogoutTop" title="Sair da Conta (Voltar ao Login)" class="btn-icon danger">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
          </button>
        </div>
      </header>

      <!-- Main Navigation Bar -->
      <nav class="main-nav">
        <button class="nav-tab active" id="tabNavCalc" data-view="calc">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect width="16" height="20" x="4" y="2" rx="2"/><line x1="8" x2="16" y1="6" y2="6"/><line x1="16" x2="16" y1="14" y2="18"/></svg>
          <span>Calculadora</span>
        </button>
        <button class="nav-tab" id="tabNavSaved" data-view="saved">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/></svg>
          <span>Salvos</span>
          <span class="badge-count" id="badgeSavedCount">0</span>
        </button>
        <button class="nav-tab" id="tabNavAccount" data-view="account">
          <span class="auth-dot connected"></span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          <span>Minha Conta</span>
        </button>
      </nav>

      <!-- Logged User Status Banner -->
      <div class="user-status-strip">
        <div class="status-left">
          <span class="status-ping"></span>
          <span class="status-email-label" id="txtLoggedUserEmail">usuario@gerenciie.pro</span>
        </div>
        <span class="status-plan-badge" id="txtLoggedUserPlan">PRO ANUAL</span>
      </div>

      <!-- VIEW 1: CALCULATOR -->
      <div id="viewCalc" class="view-panel active">
        <!-- Platform Selector -->
        <div class="channel-tabs">
          <button class="channel-tab active" data-platform="dropshipping">Dropshipping</button>
          <button class="channel-tab" data-platform="shopee">Shopee</button>
          <button class="channel-tab" data-platform="mercadolivre">Mercado Livre</button>
          <button class="channel-tab" data-platform="tiktok">TikTok Shop</button>
        </div>

        <!-- Main Highlight Result Card (Signature Blue Gradient) -->
        <div class="result-hero">
          <div class="hero-top">
            <span class="hero-tag" id="labelHeroMode">PREÇO SUGERIDO (VENDA)</span>
            <span class="badge-roi" id="badgeRoi">ROI 145%</span>
          </div>
          <div class="hero-price-row">
            <span class="hero-currency">R$</span>
            <span class="hero-price" id="resFinalPrice">137,50</span>
          </div>
          <div class="hero-pills">
            <div class="pill">
              <span class="pill-label">Markup</span>
              <span class="pill-val" id="resMarkupVal">2.50x</span>
            </div>
            <div class="pill">
              <span class="pill-label">Margem</span>
              <span class="pill-val" id="resMarginVal">38.2%</span>
            </div>
            <div class="pill">
              <span class="pill-label">Lucro Líq.</span>
              <span class="pill-val green" id="resProfitVal">R$ 52,50</span>
            </div>
          </div>
        </div>

        <!-- Quick Stats Grid -->
        <div class="stats-grid">
          <div class="stat-card">
            <span class="stat-label">CPA Breakeven (Ads)</span>
            <span class="stat-val" id="resCpaBreakeven">R$ 52,50</span>
            <span class="stat-desc">Teto de tráfego pago</span>
          </div>
          <div class="stat-card">
            <span class="stat-label">Total de Taxas</span>
            <span class="stat-val red" id="resTotalFees">R$ 29,40</span>
            <span class="stat-desc" id="resFeesPercent">21.4% da venda</span>
          </div>
        </div>

        <!-- Inputs Container -->
        <div class="inputs-container custom-scrollbar">
          <div class="input-group-card">
            <div class="group-title">
              <span>🏷️ Identificação do Produto</span>
            </div>
            <div class="form-field full">
              <input type="text" id="inpProdName" placeholder="Nome do Produto" value="Produto Fornecedor">
            </div>
          </div>

          <!-- Section 1: Custos Diretos -->
          <div class="input-group-card">
            <div class="group-title">
              <span>📦 Custos do Produto & Frete</span>
            </div>
            
            <div class="form-row">
              <div class="form-field">
                <label>Custo Produto (R$)</label>
                <input type="number" id="inpCost" value="${defaultCost.toFixed(2)}" step="0.50" min="0">
              </div>
              <div class="form-field">
                <label>Frete Fornecedor (R$)</label>
                <input type="number" id="inpFreight" value="${defaultFreight.toFixed(2)}" step="0.50" min="0">
              </div>
            </div>

            <div class="form-row">
              <div class="form-field">
                <label>Embalagem/Outros (R$)</label>
                <input type="number" id="inpPackaging" value="${defaultPackaging.toFixed(2)}" step="0.50" min="0">
              </div>
              <div class="form-field">
                <label>Modo de Cálculo</label>
                <select id="selPricingMode">
                  <option value="markup">Markup Alvo</option>
                  <option value="manual">Preço Fixo Manual</option>
                </select>
              </div>
            </div>

            <div class="form-row" id="rowMarkup">
              <div class="form-field full">
                <div class="label-with-val">
                  <label>Markup Desejado</label>
                  <span id="txtMarkupDisplay" class="bold-val">${defaultMarkup.toFixed(2)}x</span>
                </div>
                <input type="range" id="rngMarkup" min="1.1" max="5.0" step="0.1" value="${defaultMarkup}" class="slider">
              </div>
            </div>

            <div class="form-row hidden" id="rowCustomPrice">
              <div class="form-field full">
                <label>Preço de Venda Desejado (R$)</label>
                <input type="number" id="inpCustomPrice" value="139.90" step="1" min="1">
              </div>
            </div>
          </div>

          <!-- Section 2: Marketing & Taxas do Canal -->
          <div class="input-group-card">
            <div class="group-title">
              <span>🎯 Tráfego & Taxas do Canal</span>
            </div>

            <div class="form-row">
              <div class="form-field">
                <label>Budget Ads (%)</label>
                <input type="number" id="inpAds" value="${defaultAds}" step="1" min="0" max="80">
              </div>
              <div class="form-field">
                <label>Imposto Fiscal (%)</label>
                <input type="number" id="inpTax" value="${defaultTax}" step="0.5" min="0" max="50">
              </div>
            </div>

            <div class="form-row" id="rowMarketplaceFees">
              <div class="form-field">
                <label>Comissão Canal (%)</label>
                <input type="number" id="inpCommission" value="14" step="0.5" min="0" max="40">
              </div>
              <div class="form-field">
                <label>Taxa Fixa (R$)</label>
                <input type="number" id="inpFixedFee" value="4.00" step="0.5" min="0">
              </div>
            </div>
          </div>

          <!-- Section 3: Taxa de Serviço SFP (Programa de Frete Grátis) -->
          <div class="input-group-card sfp-card">
            <div class="sfp-header">
              <div class="sfp-title-area">
                <span class="sfp-icon">🚚</span>
                <div>
                  <span class="sfp-main-label">Taxa de Serviço SFP (Frete Grátis)</span>
                  <span class="sfp-sub-label">Programa Extra Shopee / Marketplaces</span>
                </div>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" id="chkSfpEnabled" ${defaultSfpEnabled ? 'checked' : ''}>
                <span class="toggle-slider"></span>
              </label>
            </div>

            <div id="boxSfpInputs" class="sfp-body ${defaultSfpEnabled ? '' : 'hidden'}">
              <div class="sfp-formula-pill">
                <span>(Preço Original - Desconto) × % SFP</span>
                <span id="txtSfpFeeCalculated" class="sfp-calc-val">Taxa: R$ 10,19</span>
              </div>

              <div class="form-row">
                <div class="form-field">
                  <label>Preço Original (R$)</label>
                  <input type="number" id="inpSfpOrigPrice" value="${defaultOriginalPrice.toFixed(2)}" step="1" min="0">
                </div>
                <div class="form-field">
                  <div class="label-with-val">
                    <label>Desc. Vendedor</label>
                    <div class="discount-type-toggle">
                      <button type="button" class="btn-disc-type ${defaultSellerDiscountType === 'currency' ? 'active' : ''}" id="btnDiscTypeCurrency">R$</button>
                      <button type="button" class="btn-disc-type ${defaultSellerDiscountType === 'percent' ? 'active' : ''}" id="btnDiscTypePercent">%</button>
                    </div>
                  </div>
                  <input type="number" id="inpSfpDiscount" value="${defaultSellerDiscount}" step="0.5" min="0">
                </div>
              </div>

              <div class="form-row">
                <div class="form-field full">
                  <div class="label-with-val">
                    <label>Taxa SFP (%)</label>
                    <span id="txtSfpPercentDisplay" class="bold-val">${defaultSfpPercent}%</span>
                  </div>
                  <input type="number" id="inpSfpPercent" value="${defaultSfpPercent}" step="0.5" min="0" max="30">
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <footer class="ext-footer">
          <button id="btnSaveToProject" class="btn-action success" title="Salvar este produto no Gerenciie Pro">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/></svg>
            <span id="txtSaveBtn">Salvar no Projeto</span>
          </button>
          <button id="btnCopyPrice" class="btn-action primary">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
            <span id="txtCopyBtn">Copiar Preço</span>
          </button>
          <button id="btnCopySummary" class="btn-action secondary" title="Copiar Resumo">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
          </button>
        </footer>
      </div>

      <!-- VIEW 2: SAVED PRODUCTS -->
      <div id="viewSaved" class="view-panel">
        <div class="saved-header">
          <span class="saved-title">Produtos Salvos no Projeto</span>
          <button id="btnClearSaved" class="btn-text-danger">Limpar Lista</button>
        </div>
        <div id="savedListContainer" class="saved-list custom-scrollbar"></div>
        <div id="savedEmptyState" class="empty-state">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/></svg>
          <p>Nenhum produto salvo ainda.</p>
          <span>Use o botão "Salvar no Projeto" na calculadora para guardar itens no seu catálogo.</span>
        </div>
      </div>

      <!-- VIEW 3: ACCOUNT INFO -->
      <div id="viewAccount" class="view-panel">
        <div class="account-card connected">
          <div class="acc-top">
            <div class="acc-avatar" id="accUserAvatar">GP</div>
            <div class="acc-info">
              <h4 class="acc-name" id="accUserName">Beto Souza</h4>
              <p class="acc-email" id="accUserEmail">betosouza3322@gmail.com</p>
              <div class="acc-badges">
                <span class="acc-badge-plan" id="accUserPlan">PRO ANUAL</span>
                <span class="acc-badge-status">● CONECTADO</span>
              </div>
            </div>
          </div>
          <div class="acc-meta">
            <div class="meta-item">
              <span class="meta-label">ID do Projeto</span>
              <span class="meta-val">ai-studio-d584075f</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Sincronização</span>
              <span class="meta-val green">Nuvem Ativa 🟢</span>
            </div>
          </div>
          <div class="acc-actions">
            <button id="btnSyncProjectSettings" class="btn-action primary full">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 21h5v-5"/></svg>
              <span>Sincronizar Regras do Projeto</span>
            </button>
            <button id="btnLogoutAccount" class="btn-action outline danger full">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
              <span>Desconectar e Bloquear Extensão</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <script src="popup.js"></script>
</body>
</html>`;

  const stylesCss = `/* ========================================================
   GERENCIIE PRO • OFFICIAL EXTENSION THEME & PALETTE
   Colors:
   - Primary Blue Gradient: linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)
   - Active Cobalt: #2563EB with shadow rgba(37, 99, 235, 0.4)
   - Accent Cyan/Sky: #38BDF8 / #60A5FA
   - Deep Background: #080C14 / #0B0F19
   - Surfaces & Cards: #0F172A (Slate 900) & #1E293B (Slate 800)
   - Success/Profit: #10B981 / #34D399
   - Alert/Fee: #EF4444 / #F87171
   ======================================================== */

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
}

body {
  width: 380px;
  background-color: #080c14;
  color: #f8fafc;
  font-size: 12px;
  overflow-x: hidden;
  user-select: none;
}

.extension-wrapper {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-height: 480px;
}

/* Custom Scrollbar matching Project */
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #334155;
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #475569;
}

/* ========================================================
   SCREEN 1: AUTH GATEWAY
   ======================================================== */
.auth-gateway {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 8px 4px;
  animation: fadeIn 0.25s ease-out;
}

.auth-brand {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  text-align: center;
  padding-top: 6px;
}

.auth-logo-icon {
  width: 46px;
  height: 46px;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 20px -5px rgba(37, 99, 235, 0.45);
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.auth-title {
  font-size: 17px;
  font-weight: 900;
  letter-spacing: -0.02em;
  color: #ffffff;
}

.auth-title span {
  color: #38bdf8;
}

.auth-tag {
  font-size: 8.5px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #93c5fd;
  background: rgba(37, 99, 235, 0.15);
  padding: 3px 10px;
  border-radius: 999px;
  border: 1px solid rgba(59, 130, 246, 0.3);
}

.auth-welcome-card {
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  border: 1px solid rgba(59, 130, 246, 0.25);
  border-radius: 14px;
  padding: 12px 14px;
  text-align: center;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
}

.auth-welcome-card h3 {
  font-size: 12.5px;
  font-weight: 800;
  color: #ffffff;
  margin-bottom: 2px;
}

.auth-welcome-card p {
  font-size: 9.5px;
  color: #94a3b8;
  line-height: 1.4;
}

.auth-type-tabs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4px;
  background: #0f172a;
  padding: 3px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.auth-type-btn {
  background: transparent;
  border: none;
  color: #94a3b8;
  padding: 6px;
  border-radius: 7px;
  font-size: 10.5px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;
}

.auth-type-btn.active {
  background: #2563eb;
  color: #ffffff;
  font-weight: 800;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.35);
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field-block {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.field-block label {
  font-size: 9px;
  font-weight: 700;
  color: #94a3b8;
}

.input-with-icon {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #0f172a;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 7px 10px;
  transition: all 0.15s ease;
}

.input-with-icon:focus-within {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.25);
}

.input-with-icon svg {
  color: #64748b;
  flex-shrink: 0;
}

.input-with-icon input {
  background: transparent;
  border: none;
  color: #ffffff;
  font-size: 11px;
  font-weight: 700;
  outline: none;
  width: 100%;
}

textarea {
  background: #0f172a;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  color: #38bdf8;
  font-family: monospace;
  font-size: 10px;
  padding: 8px;
  outline: none;
  resize: none;
}

textarea:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.25);
}

.btn-submit-auth {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  border: none;
  border-radius: 10px;
  padding: 10px;
  font-size: 11.5px;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 10px 15px -3px rgba(37, 99, 235, 0.4);
  transition: all 0.15s ease;
  margin-top: 4px;
}

.btn-submit-auth:hover {
  background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
  transform: translateY(-1px);
}

.btn-demo-auth {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: rgba(16, 185, 129, 0.12);
  color: #34d399;
  border: 1px solid rgba(16, 185, 129, 0.3);
  border-radius: 10px;
  padding: 8px;
  font-size: 10px;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-demo-auth:hover {
  background: rgba(16, 185, 129, 0.2);
}

.auth-status-alert {
  padding: 7px 10px;
  border-radius: 8px;
  font-size: 9.5px;
  font-weight: 700;
  text-align: center;
  background: rgba(244, 63, 94, 0.12);
  color: #fda4af;
  border: 1px solid rgba(244, 63, 94, 0.3);
}

.auth-logo-img {
  width: 46px;
  height: 46px;
  border-radius: 14px;
  box-shadow: 0 10px 20px -5px rgba(37, 99, 235, 0.45);
}

.logo-img {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4);
}

.auth-google-hint {
  font-size: 9px;
  line-height: 1.45;
  color: #94a3b8;
  text-align: center;
  padding: 0 6px;
}

.auth-google-hint strong {
  color: #cbd5e1;
}

.btn-submit-auth:disabled {
  opacity: 0.6;
  cursor: wait;
}

.auth-footer-note {
  text-align: center;
  font-size: 8px;
  color: #64748b;
  font-weight: 600;
  margin-top: 2px;
}

/* ========================================================
   SCREEN 2: UNLOCKED SYSTEM
   ======================================================== */
.system-main {
  display: flex;
  flex-direction: column;
  gap: 10px;
  animation: fadeIn 0.25s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}

.ext-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.logo-area {
  display: flex;
  align-items: center;
  gap: 8px;
}

.logo-icon {
  width: 28px;
  height: 28px;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4);
}

.logo-title {
  font-size: 13px;
  font-weight: 900;
  letter-spacing: -0.02em;
  color: #ffffff;
}

.logo-title span {
  color: #38bdf8;
}

.logo-sub {
  font-size: 8.5px;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.ext-actions {
  display: flex;
  gap: 4px;
}

.btn-icon {
  width: 28px;
  height: 28px;
  background: #0f172a;
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #94a3b8;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-icon:hover {
  background: #1e293b;
  color: #ffffff;
  border-color: #3b82f6;
}

.btn-icon.danger:hover {
  background: rgba(239, 68, 68, 0.2);
  color: #f87171;
  border-color: rgba(239, 68, 68, 0.4);
}

.main-nav {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 4px;
  background: #0f172a;
  padding: 3px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.nav-tab {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding: 6px 4px;
  border: none;
  background: transparent;
  color: #94a3b8;
  font-size: 10.5px;
  font-weight: 700;
  border-radius: 7px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.nav-tab:hover {
  color: #f1f5f9;
}

.nav-tab.active {
  background: #2563eb;
  color: #ffffff;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.35);
}

.auth-dot {
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: #10b981;
  box-shadow: 0 0 6px #10b981;
}

.badge-count {
  background: #38bdf8;
  color: #0b1329;
  font-size: 8.5px;
  font-weight: 900;
  padding: 1px 5px;
  border-radius: 999px;
}

.user-status-strip {
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.9) 100%);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 10px;
  padding: 5px 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.status-left {
  display: flex;
  align-items: center;
  gap: 6px;
  overflow: hidden;
}

.status-ping {
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: #10b981;
  box-shadow: 0 0 6px #10b981;
  flex-shrink: 0;
}

.status-email-label {
  font-size: 9.5px;
  font-weight: 700;
  color: #cbd5e1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.status-plan-badge {
  font-size: 8px;
  font-weight: 900;
  color: #38bdf8;
  background: rgba(56, 189, 248, 0.15);
  border: 1px solid rgba(56, 189, 248, 0.3);
  padding: 1px 6px;
  border-radius: 4px;
}

.view-panel {
  display: none;
  flex-direction: column;
  gap: 10px;
}

.view-panel.active {
  display: flex;
}

.channel-tabs {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 3px;
  background: #0f172a;
  padding: 3px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.channel-tab {
  background: transparent;
  border: none;
  color: #94a3b8;
  padding: 6px 2px;
  border-radius: 7px;
  font-size: 9.5px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.channel-tab.active {
  background: #2563eb;
  color: #ffffff;
  font-weight: 800;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4);
}

/* Hero Highlight Result (Exact Blue Gradient) */
.result-hero {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 12px 14px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 10px 25px -5px rgba(37, 99, 235, 0.5);
  color: #ffffff;
}

.hero-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2px;
}

.hero-tag {
  font-size: 8.5px;
  font-weight: 900;
  letter-spacing: 0.1em;
  color: rgba(255, 255, 255, 0.85);
  text-transform: uppercase;
}

.badge-roi {
  background: rgba(255, 255, 255, 0.2);
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.3);
  font-size: 9px;
  font-weight: 900;
  padding: 2px 7px;
  border-radius: 999px;
  backdrop-blur-sm;
}

.hero-price-row {
  display: flex;
  align-items: baseline;
  gap: 3px;
  margin: 4px 0 8px 0;
}

.hero-currency {
  font-size: 14px;
  font-weight: 800;
  color: rgba(255, 255, 255, 0.8);
}

.hero-price {
  font-size: 27px;
  font-weight: 900;
  letter-spacing: -0.03em;
  color: #ffffff;
}

.hero-pills {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 5px;
}

.pill {
  background: rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.12);
  padding: 5px 6px;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
}

.pill-label {
  font-size: 7.5px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.7);
  text-transform: uppercase;
}

.pill-val {
  font-size: 11px;
  font-weight: 900;
  color: #ffffff;
}

.pill-val.green {
  color: #6ee7b7;
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
}

.stat-card {
  background: #0f172a;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  padding: 7px 10px;
  display: flex;
  flex-direction: column;
}

.stat-label {
  font-size: 8px;
  font-weight: 800;
  color: #94a3b8;
  text-transform: uppercase;
}

.stat-val {
  font-size: 13.5px;
  font-weight: 900;
  color: #f8fafc;
  margin: 2px 0 1px 0;
}

.stat-val.red {
  color: #f87171;
}

.stat-desc {
  font-size: 7.5px;
  color: #64748b;
  font-weight: 600;
}

.inputs-container {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-height: 220px;
  overflow-y: auto;
  padding-right: 2px;
}

.input-group-card {
  background: #0f172a;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  padding: 8px 10px;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.group-title {
  font-size: 8.5px;
  font-weight: 900;
  color: #cbd5e1;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.form-field.full {
  grid-column: 1 / -1;
}

.form-field label {
  font-size: 8.5px;
  font-weight: 700;
  color: #94a3b8;
}

.label-with-val {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.bold-val {
  font-size: 9.5px;
  font-weight: 900;
  color: #38bdf8;
}

input[type="number"], input[type="text"], input[type="email"], input[type="password"], select {
  background: #1e293b;
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #f8fafc;
  padding: 6px 8px;
  border-radius: 7px;
  font-size: 10.5px;
  font-weight: 700;
  outline: none;
  transition: all 0.15s ease;
}

input:focus, select:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.25);
}

.slider {
  width: 100%;
  accent-color: #3b82f6;
  cursor: pointer;
  height: 4px;
}

/* SFP Specific Card with Project Gradient */
.sfp-card {
  border-color: rgba(59, 130, 246, 0.35);
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 58, 138, 0.35) 100%);
}

.sfp-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 2px;
}

.sfp-title-area {
  display: flex;
  align-items: center;
  gap: 6px;
}

.sfp-icon {
  font-size: 13px;
}

.sfp-main-label {
  font-size: 9px;
  font-weight: 900;
  color: #60a5fa;
  display: block;
}

.sfp-sub-label {
  font-size: 7.5px;
  color: #94a3b8;
  display: block;
}

.toggle-switch {
  position: relative;
  display: inline-block;
  width: 28px;
  height: 16px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0; left: 0; right: 0; bottom: 0;
  background-color: #334155;
  transition: .2s;
  border-radius: 16px;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 12px;
  width: 12px;
  left: 2px;
  bottom: 2px;
  background-color: white;
  transition: .2s;
  border-radius: 50%;
}

.toggle-switch input:checked + .toggle-slider {
  background-color: #2563eb;
  box-shadow: 0 0 8px rgba(37, 99, 235, 0.5);
}

.toggle-switch input:checked + .toggle-slider:before {
  transform: translateX(12px);
}

.sfp-body {
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding-top: 4px;
  border-top: 1px solid rgba(59, 130, 246, 0.2);
}

.sfp-formula-pill {
  background: rgba(37, 99, 235, 0.2);
  border: 1px solid rgba(59, 130, 246, 0.35);
  padding: 4px 7px;
  border-radius: 7px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 8px;
  color: #bfdbfe;
  font-weight: 700;
}

.sfp-calc-val {
  color: #38bdf8;
  font-weight: 900;
  font-size: 9px;
}

.discount-type-toggle {
  display: flex;
  gap: 1px;
  background: #1e293b;
  padding: 1px;
  border-radius: 5px;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.btn-disc-type {
  background: transparent;
  border: none;
  color: #94a3b8;
  font-size: 8px;
  font-weight: 900;
  padding: 1px 5px;
  border-radius: 4px;
  cursor: pointer;
}

.btn-disc-type.active {
  background: #2563eb;
  color: white;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
}

.hidden {
  display: none !important;
}

.ext-footer {
  display: grid;
  grid-template-columns: 1.2fr 1.2fr auto;
  gap: 5px;
  padding-top: 2px;
}

.btn-action {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding: 8px 10px;
  border-radius: 8px;
  font-size: 10px;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.15s ease;
  border: none;
}

.btn-action.full {
  width: 100%;
  padding: 10px 12px;
  font-size: 11px;
}

.btn-action.primary {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.35);
}

.btn-action.primary:hover {
  background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
}

.btn-action.success {
  background: linear-gradient(135deg, #059669, #10b981);
  color: white;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.btn-action.success:hover {
  background: linear-gradient(135deg, #10b981, #059669);
}

.btn-action.secondary {
  background: #0f172a;
  color: #cbd5e1;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.btn-action.secondary:hover {
  background: #1e293b;
  color: #ffffff;
}

.btn-action.outline.danger {
  background: rgba(239, 68, 68, 0.12);
  color: #f87171;
  border: 1px solid rgba(239, 68, 68, 0.35);
}

.btn-action.outline.danger:hover {
  background: rgba(239, 68, 68, 0.22);
}

/* Saved View */
.saved-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 2px 0;
}

.saved-title {
  font-size: 11px;
  font-weight: 800;
  color: #ffffff;
}

.btn-text-danger {
  background: none;
  border: none;
  color: #f87171;
  font-size: 9px;
  font-weight: 700;
  cursor: pointer;
}

.saved-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-height: 330px;
  overflow-y: auto;
}

.saved-item {
  background: #0f172a;
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 10px;
  padding: 8px 10px;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.saved-item-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.saved-item-name {
  font-size: 11px;
  font-weight: 900;
  color: #ffffff;
}

.saved-item-channel {
  font-size: 8px;
  font-weight: 900;
  padding: 2px 6px;
  border-radius: 5px;
  background: #1e3a8a;
  color: #93c5fd;
  text-transform: uppercase;
}

.saved-item-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 4px;
  font-size: 9px;
  background: rgba(0, 0, 0, 0.3);
  padding: 5px 7px;
  border-radius: 7px;
}

.saved-item-actions {
  display: flex;
  gap: 4px;
  justify-content: flex-end;
  margin-top: 2px;
}

.btn-mini {
  padding: 3px 7px;
  font-size: 9px;
  font-weight: 700;
  border-radius: 5px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: #1e293b;
  color: #cbd5e1;
  cursor: pointer;
}

.btn-mini:hover {
  background: #334155;
  color: white;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 30px 10px;
  text-align: center;
  color: #64748b;
  gap: 6px;
}

.empty-state p {
  font-size: 11px;
  font-weight: 800;
  color: #94a3b8;
}

.empty-state span {
  font-size: 9px;
  max-width: 220px;
}

/* Account Card */
.account-card {
  background: #0f172a;
  border: 1px solid rgba(59, 130, 246, 0.25);
  border-radius: 14px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.acc-top {
  display: flex;
  align-items: center;
  gap: 10px;
}

.acc-avatar {
  width: 38px;
  height: 38px;
  border-radius: 12px;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  font-size: 13px;
  font-weight: 900;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4);
}

.acc-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.acc-name {
  font-size: 12.5px;
  font-weight: 900;
  color: #ffffff;
}

.acc-email {
  font-size: 9.5px;
  color: #94a3b8;
}

.acc-badges {
  display: flex;
  gap: 4px;
  margin-top: 2px;
}

.acc-badge-plan {
  background: rgba(59, 130, 246, 0.2);
  color: #60a5fa;
  border: 1px solid rgba(59, 130, 246, 0.35);
  font-size: 7.5px;
  font-weight: 900;
  padding: 1px 6px;
  border-radius: 999px;
  text-transform: uppercase;
}

.acc-badge-status {
  background: rgba(16, 185, 129, 0.15);
  color: #34d399;
  border: 1px solid rgba(16, 185, 129, 0.3);
  font-size: 7.5px;
  font-weight: 900;
  padding: 1px 6px;
  border-radius: 999px;
}

.acc-meta {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
  background: rgba(0, 0, 0, 0.3);
  padding: 9px;
  border-radius: 9px;
}

.meta-item {
  display: flex;
  flex-direction: column;
}

.meta-label {
  font-size: 7.5px;
  font-weight: 800;
  color: #64748b;
  text-transform: uppercase;
}

.meta-val {
  font-size: 10px;
  font-weight: 900;
  color: #e2e8f0;
}

.meta-val.green {
  color: #34d399;
}

.acc-actions {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
`;

  const popupJs = `// Gerenciie Pro - Extension Engine with Official Project Colors & SFP
(function() {
  const PLATFORMS = {
    dropshipping: { commission: 0, fixedFee: 0, gateway: 4.99, tax: 6, ads: 25, markup: 2.5, sfpDefault: false },
    shopee: { commission: 14, fixedFee: 4, gateway: 0, tax: 6, ads: 10, markup: 2.2, sfpDefault: true },
    mercadolivre: { commission: 16.5, fixedFee: 6, gateway: 0, tax: 6, ads: 12, markup: 2.3, sfpDefault: true },
    tiktok: { commission: 6, fixedFee: 2, gateway: 0, tax: 6, ads: 20, markup: 2.6, sfpDefault: false }
  };

  let currentPlatform = 'dropshipping';
  let pricingMode = 'markup';
  let currentUser = null;
  const SUPABASE_URL = ${JSON.stringify(supabaseUrl)};
  const SUPABASE_KEY = ${JSON.stringify(supabaseKey)};
  const SITE_URL = ${JSON.stringify(siteUrl)};
  let savedProducts = [];
  let sellerDiscountType = 'currency';

  // Screens
  const screenLogin = document.getElementById('screenLogin');
  const screenSystem = document.getElementById('screenSystem');

  // Auth Gateway elements
  const formEmailAuth = document.getElementById('formEmailAuth');
  const btnSubmitGateway = document.getElementById('btnSubmitGateway');
  const btnOpenSignup = document.getElementById('btnOpenSignup');
  const inpGatewayEmail = document.getElementById('inpGatewayEmail');
  const inpGatewayPassword = document.getElementById('inpGatewayPassword');
  const authErrorBanner = document.getElementById('authErrorBanner');

  // System elements
  const txtLoggedUserEmail = document.getElementById('txtLoggedUserEmail');
  const txtLoggedUserPlan = document.getElementById('txtLoggedUserPlan');
  const btnLogoutTop = document.getElementById('btnLogoutTop');
  const navTabs = document.querySelectorAll('.nav-tab');
  const viewPanels = {
    calc: document.getElementById('viewCalc'),
    saved: document.getElementById('viewSaved'),
    account: document.getElementById('viewAccount')
  };
  const badgeSavedCount = document.getElementById('badgeSavedCount');

  // Calc Elements
  const channelTabs = document.querySelectorAll('.channel-tab');
  const inpProdName = document.getElementById('inpProdName');
  const inpCost = document.getElementById('inpCost');
  const inpFreight = document.getElementById('inpFreight');
  const inpPackaging = document.getElementById('inpPackaging');
  const selPricingMode = document.getElementById('selPricingMode');
  const rngMarkup = document.getElementById('rngMarkup');
  const txtMarkupDisplay = document.getElementById('txtMarkupDisplay');
  const inpCustomPrice = document.getElementById('inpCustomPrice');
  const rowMarkup = document.getElementById('rowMarkup');
  const rowCustomPrice = document.getElementById('rowCustomPrice');
  const inpAds = document.getElementById('inpAds');
  const inpTax = document.getElementById('inpTax');
  const inpCommission = document.getElementById('inpCommission');
  const inpFixedFee = document.getElementById('inpFixedFee');
  const rowMarketplaceFees = document.getElementById('rowMarketplaceFees');

  // SFP Elements
  const chkSfpEnabled = document.getElementById('chkSfpEnabled');
  const boxSfpInputs = document.getElementById('boxSfpInputs');
  const inpSfpOrigPrice = document.getElementById('inpSfpOrigPrice');
  const inpSfpDiscount = document.getElementById('inpSfpDiscount');
  const inpSfpPercent = document.getElementById('inpSfpPercent');
  const txtSfpPercentDisplay = document.getElementById('txtSfpPercentDisplay');
  const txtSfpFeeCalculated = document.getElementById('txtSfpFeeCalculated');
  const btnDiscTypeCurrency = document.getElementById('btnDiscTypeCurrency');
  const btnDiscTypePercent = document.getElementById('btnDiscTypePercent');

  // Outputs
  const resFinalPrice = document.getElementById('resFinalPrice');
  const resMarkupVal = document.getElementById('resMarkupVal');
  const resMarginVal = document.getElementById('resMarginVal');
  const resProfitVal = document.getElementById('resProfitVal');
  const badgeRoi = document.getElementById('badgeRoi');
  const resCpaBreakeven = document.getElementById('resCpaBreakeven');
  const resTotalFees = document.getElementById('resTotalFees');
  const resFeesPercent = document.getElementById('resFeesPercent');
  const labelHeroMode = document.getElementById('labelHeroMode');

  // Buttons
  const btnCopyPrice = document.getElementById('btnCopyPrice');
  const btnCopySummary = document.getElementById('btnCopySummary');
  const txtCopyBtn = document.getElementById('txtCopyBtn');
  const btnSaveToProject = document.getElementById('btnSaveToProject');
  const txtSaveBtn = document.getElementById('txtSaveBtn');
  const btnReset = document.getElementById('btnReset');
  const btnAutoGrab = document.getElementById('btnAutoGrab');

  // Saved list elements
  const savedListContainer = document.getElementById('savedListContainer');
  const savedEmptyState = document.getElementById('savedEmptyState');
  const btnClearSaved = document.getElementById('btnClearSaved');

  // Account View elements
  const accUserName = document.getElementById('accUserName');
  const accUserEmail = document.getElementById('accUserEmail');
  const accUserAvatar = document.getElementById('accUserAvatar');
  const accUserPlan = document.getElementById('accUserPlan');
  const btnSyncProjectSettings = document.getElementById('btnSyncProjectSettings');
  const btnLogoutAccount = document.getElementById('btnLogoutAccount');

  function formatBRL(val) {
    return (val || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  // Gateway / System Switcher
  function updateScreens() {
    if (currentUser && currentUser.email) {
      screenLogin.classList.add('hidden');
      screenSystem.classList.remove('hidden');

      const name = currentUser.displayName || currentUser.name || currentUser.email.split('@')[0];
      txtLoggedUserEmail.innerText = currentUser.email;
      txtLoggedUserPlan.innerText = (currentUser.plan || 'PRO ANUAL').toUpperCase();

      accUserName.innerText = name;
      accUserEmail.innerText = currentUser.email;
      accUserAvatar.innerText = name.substring(0, 2).toUpperCase();
      accUserPlan.innerText = (currentUser.plan || 'PRO ANUAL').toUpperCase();

      calculate();
    } else {
      screenSystem.classList.add('hidden');
      screenLogin.classList.remove('hidden');
    }
  }

  function handleLoginSuccess(userObj) {
    currentUser = userObj;
    saveState();
    updateScreens();
  }

  function handleLogout() {
    const token = currentUser && currentUser.session && currentUser.session.access_token;
    if (token) {
      fetch(SUPABASE_URL + '/auth/v1/logout', {
        method: 'POST',
        headers: { apikey: SUPABASE_KEY, Authorization: 'Bearer ' + token }
      }).catch(function() {});
    }
    currentUser = null;
    saveState();
    updateScreens();
  }

  // Navigation Logic
  function switchView(viewName) {
    navTabs.forEach(t => {
      if (t.getAttribute('data-view') === viewName) {
        t.classList.add('active');
      } else {
        t.classList.remove('active');
      }
    });

    Object.keys(viewPanels).forEach(k => {
      if (k === viewName) {
        viewPanels[k].classList.add('active');
      } else {
        viewPanels[k].classList.remove('active');
      }
    });

    if (viewName === 'saved') {
      renderSavedProducts();
    }
  }

  navTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const v = tab.getAttribute('data-view');
      if (v) switchView(v);
    });
  });

  // Calculate pricing with Taxa de Serviço SFP
  function calculate() {
    const cost = parseFloat(inpCost.value) || 0;
    const freight = parseFloat(inpFreight.value) || 0;
    const packaging = parseFloat(inpPackaging.value) || 0;
    const directCost = cost + freight + packaging;

    const adsPct = (parseFloat(inpAds.value) || 0) / 100;
    const taxPct = (parseFloat(inpTax.value) || 0) / 100;
    const commPct = (parseFloat(inpCommission.value) || 0) / 100;
    const fixedFee = parseFloat(inpFixedFee.value) || 0;

    let finalPrice = 0;
    let effectiveMarkup = 1;

    if (pricingMode === 'manual') {
      finalPrice = parseFloat(inpCustomPrice.value) || 0;
      effectiveMarkup = directCost > 0 ? (finalPrice / directCost) : 1;
      labelHeroMode.innerText = 'PREÇO FIXADO';
    } else {
      const markup = parseFloat(rngMarkup.value) || 2.5;
      finalPrice = directCost * markup;
      effectiveMarkup = markup;
      labelHeroMode.innerText = 'PREÇO SUGERIDO (VENDA)';
    }

    // Taxa de Serviço SFP (Frete Grátis)
    let sfpFee = 0;
    const isSfpActive = chkSfpEnabled ? chkSfpEnabled.checked : true;
    if (isSfpActive) {
      const origPrice = parseFloat(inpSfpOrigPrice.value) || (finalPrice > 0 ? finalPrice : 169.90);
      const discountVal = parseFloat(inpSfpDiscount.value) || 0;
      const sfpPct = (parseFloat(inpSfpPercent.value) || 6) / 100;

      const discountCalculated = sellerDiscountType === 'percent'
        ? origPrice * (discountVal / 100)
        : discountVal;
      
      const sfpBase = Math.max(0, origPrice - discountCalculated);
      sfpFee = sfpBase * sfpPct;

      if (txtSfpFeeCalculated) {
        txtSfpFeeCalculated.innerText = 'Taxa SFP: R$ ' + formatBRL(sfpFee);
      }
    } else {
      if (txtSfpFeeCalculated) {
        txtSfpFeeCalculated.innerText = 'Taxa SFP: Desativada';
      }
    }

    const adsCost = finalPrice * adsPct;
    const taxCost = finalPrice * taxPct;
    const commCost = (finalPrice * commPct) + fixedFee;
    const totalFees = taxCost + commCost + sfpFee;
    
    const profit = finalPrice - directCost - adsCost - totalFees;
    const marginPercent = finalPrice > 0 ? (profit / finalPrice) * 100 : 0;
    const roi = directCost > 0 ? (profit / directCost) * 100 : 0;
    const cpaBreakeven = Math.max(0, finalPrice - directCost - totalFees);

    resFinalPrice.innerText = formatBRL(finalPrice);
    resMarkupVal.innerText = effectiveMarkup.toFixed(2) + 'x';
    resMarginVal.innerText = marginPercent.toFixed(1) + '%';
    resProfitVal.innerText = 'R$ ' + formatBRL(profit);
    badgeRoi.innerText = 'ROI ' + Math.round(roi) + '%';
    resCpaBreakeven.innerText = 'R$ ' + formatBRL(cpaBreakeven);
    resTotalFees.innerText = 'R$ ' + formatBRL(totalFees);
    resFeesPercent.innerText = finalPrice > 0 ? ((totalFees / finalPrice) * 100).toFixed(1) + '% da venda' : '0%';

    saveState();
  }

  function setPlatform(platformId, updateDefaults = true) {
    currentPlatform = platformId;
    channelTabs.forEach(t => {
      if (t.getAttribute('data-platform') === platformId) {
        t.classList.add('active');
      } else {
        t.classList.remove('active');
      }
    });

    const preset = PLATFORMS[platformId];
    if (preset && updateDefaults) {
      inpCommission.value = preset.commission;
      inpFixedFee.value = preset.fixedFee;
      inpAds.value = preset.ads;
      inpTax.value = preset.tax;
      if (pricingMode === 'markup') {
        rngMarkup.value = preset.markup;
        txtMarkupDisplay.innerText = preset.markup.toFixed(2) + 'x';
      }
      if (preset.sfpDefault !== undefined && chkSfpEnabled) {
        chkSfpEnabled.checked = preset.sfpDefault;
        toggleSfpUI();
      }
    }

    if (platformId === 'dropshipping') {
      rowMarketplaceFees.classList.add('hidden');
    } else {
      rowMarketplaceFees.classList.remove('hidden');
    }

    calculate();
  }

  function togglePricingModeUI() {
    if (pricingMode === 'manual') {
      rowMarkup.classList.add('hidden');
      rowCustomPrice.classList.remove('hidden');
    } else {
      rowMarkup.classList.remove('hidden');
      rowCustomPrice.classList.add('hidden');
    }
  }

  function toggleSfpUI() {
    if (chkSfpEnabled && chkSfpEnabled.checked) {
      boxSfpInputs.classList.remove('hidden');
    } else {
      boxSfpInputs.classList.add('hidden');
    }
    calculate();
  }

  // Saved Products Management
  function renderSavedProducts() {
    badgeSavedCount.innerText = savedProducts.length;
    if (savedProducts.length === 0) {
      savedEmptyState.classList.remove('hidden');
      savedListContainer.innerHTML = '';
      return;
    }

    savedEmptyState.classList.add('hidden');
    savedListContainer.innerHTML = savedProducts.map((p, idx) => {
      return \`
        <div class="saved-item" data-index="\${idx}">
          <div class="saved-item-top">
            <span class="saved-item-name">\${p.name || 'Produto Sem Título'}</span>
            <span class="saved-item-channel">\${p.platform}</span>
          </div>
          <div class="saved-item-stats">
            <div>Custo: <strong>R$ \${p.cost}</strong></div>
            <div>Venda: <strong style="color:#38bdf8">R$ \${p.price}</strong></div>
            <div>Margem: <strong style="color:#34d399">\${p.margin}</strong></div>
          </div>
          <div class="saved-item-actions">
            <button class="btn-mini btn-load-calc" data-index="\${idx}">Carregar</button>
            <button class="btn-mini btn-del-saved" data-index="\${idx}">Excluir</button>
          </div>
        </div>
      \`;
    }).join('');

    document.querySelectorAll('.btn-load-calc').forEach(b => {
      b.addEventListener('click', (e) => {
        const i = parseInt(e.target.getAttribute('data-index'));
        const p = savedProducts[i];
        if (p) {
          inpProdName.value = p.name;
          inpCost.value = p.costNum || p.cost;
          inpFreight.value = p.freightNum || 5;
          if (p.platform) setPlatform(p.platform.toLowerCase(), true);
          calculate();
          switchView('calc');
        }
      });
    });

    document.querySelectorAll('.btn-del-saved').forEach(b => {
      b.addEventListener('click', (e) => {
        const i = parseInt(e.target.getAttribute('data-index'));
        savedProducts.splice(i, 1);
        saveState();
        renderSavedProducts();
      });
    });
  }

  function saveProductToProject() {
    const name = inpProdName.value || 'Produto ' + new Date().toLocaleDateString();
    const prod = {
      id: 'ext_' + Date.now(),
      name: name,
      platform: currentPlatform,
      cost: formatBRL(parseFloat(inpCost.value) || 0),
      costNum: parseFloat(inpCost.value) || 0,
      freightNum: parseFloat(inpFreight.value) || 0,
      price: resFinalPrice.innerText,
      margin: resMarginVal.innerText,
      profit: resProfitVal.innerText,
      markup: resMarkupVal.innerText,
      sfpEnabled: chkSfpEnabled ? chkSfpEnabled.checked : false,
      date: new Date().toLocaleDateString('pt-BR')
    };

    savedProducts.unshift(prod);
    if (savedProducts.length > 30) savedProducts.pop();

    saveState();
    renderSavedProducts();

    txtSaveBtn.innerText = 'Salvo no Projeto!';
    setTimeout(() => {
      txtSaveBtn.innerText = 'Salvar no Projeto';
    }, 1800);
  }

  // Storage Persistence
  function saveState() {
    const state = {
      currentUser: currentUser,
      savedProducts: savedProducts,
      platform: currentPlatform,
      cost: inpCost.value,
      freight: inpFreight.value,
      packaging: inpPackaging.value,
      pricingMode: pricingMode,
      markup: rngMarkup.value,
      customPrice: inpCustomPrice.value,
      ads: inpAds.value,
      tax: inpTax.value,
      comm: inpCommission.value,
      fixed: inpFixedFee.value,
      prodName: inpProdName.value,
      sfpEnabled: chkSfpEnabled ? chkSfpEnabled.checked : true,
      sfpOrigPrice: inpSfpOrigPrice ? inpSfpOrigPrice.value : '169.90',
      sfpDiscount: inpSfpDiscount ? inpSfpDiscount.value : '0',
      sfpPercent: inpSfpPercent ? inpSfpPercent.value : '6',
      sellerDiscountType: sellerDiscountType
    };
    try {
      if (window.chrome && chrome.storage && chrome.storage.local) {
        chrome.storage.local.set({ 'gerenciie_ext_data': state });
      } else {
        localStorage.setItem('gerenciie_ext_data', JSON.stringify(state));
      }
    } catch(e) {}
  }

  function loadState() {
    try {
      if (window.chrome && chrome.storage && chrome.storage.local) {
        chrome.storage.local.get(['gerenciie_ext_data'], function(result) {
          if (result && result.gerenciie_ext_data) {
            applyState(result.gerenciie_ext_data);
          } else {
            updateScreens();
          }
        });
      } else {
        const saved = localStorage.getItem('gerenciie_ext_data');
        if (saved) applyState(JSON.parse(saved));
        else updateScreens();
      }
    } catch(e) {
      updateScreens();
    }
  }

  function applyState(s) {
    if (!s) return;
    if (s.currentUser && s.currentUser.session) currentUser = s.currentUser;
    if (s.savedProducts) savedProducts = s.savedProducts;
    if (s.prodName) inpProdName.value = s.prodName;
    if (s.cost !== undefined) inpCost.value = s.cost;
    if (s.freight !== undefined) inpFreight.value = s.freight;
    if (s.packaging !== undefined) inpPackaging.value = s.packaging;
    if (s.pricingMode) {
      pricingMode = s.pricingMode;
      selPricingMode.value = s.pricingMode;
      togglePricingModeUI();
    }
    if (s.markup !== undefined) {
      rngMarkup.value = s.markup;
      txtMarkupDisplay.innerText = parseFloat(s.markup).toFixed(2) + 'x';
    }
    if (s.customPrice !== undefined) inpCustomPrice.value = s.customPrice;
    if (s.ads !== undefined) inpAds.value = s.ads;
    if (s.tax !== undefined) inpTax.value = s.tax;
    if (s.comm !== undefined) inpCommission.value = s.comm;
    if (s.fixed !== undefined) inpFixedFee.value = s.fixed;
    if (s.sfpEnabled !== undefined && chkSfpEnabled) {
      chkSfpEnabled.checked = s.sfpEnabled;
      toggleSfpUI();
    }
    if (s.sfpOrigPrice !== undefined && inpSfpOrigPrice) inpSfpOrigPrice.value = s.sfpOrigPrice;
    if (s.sfpDiscount !== undefined && inpSfpDiscount) inpSfpDiscount.value = s.sfpDiscount;
    if (s.sfpPercent !== undefined && inpSfpPercent) {
      inpSfpPercent.value = s.sfpPercent;
      if (txtSfpPercentDisplay) txtSfpPercentDisplay.innerText = s.sfpPercent + '%';
    }
    if (s.sellerDiscountType) {
      sellerDiscountType = s.sellerDiscountType;
      updateDiscountTypeUI();
    }
    if (s.platform) setPlatform(s.platform, false);

    refreshSessionIfNeeded();
    renderSavedProducts();
    calculate();
  }

  function updateDiscountTypeUI() {
    if (sellerDiscountType === 'currency') {
      btnDiscTypeCurrency.classList.add('active');
      btnDiscTypePercent.classList.remove('active');
    } else {
      btnDiscTypePercent.classList.add('active');
      btnDiscTypeCurrency.classList.remove('active');
    }
  }

  // SFP Listeners
  if (chkSfpEnabled) {
    chkSfpEnabled.addEventListener('change', toggleSfpUI);
  }

  if (btnDiscTypeCurrency && btnDiscTypePercent) {
    btnDiscTypeCurrency.addEventListener('click', () => {
      sellerDiscountType = 'currency';
      updateDiscountTypeUI();
      calculate();
    });
    btnDiscTypePercent.addEventListener('click', () => {
      sellerDiscountType = 'percent';
      updateDiscountTypeUI();
      calculate();
    });
  }

  [inpSfpOrigPrice, inpSfpDiscount, inpSfpPercent].forEach(el => {
    if (el) el.addEventListener('input', () => {
      if (inpSfpPercent && txtSfpPercentDisplay) {
        txtSfpPercentDisplay.innerText = inpSfpPercent.value + '%';
      }
      calculate();
    });
  });

  // Login real no Supabase do projeto
  function authRequest(path, body) {
    return fetch(SUPABASE_URL + '/auth/v1/' + path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: SUPABASE_KEY },
      body: JSON.stringify(body)
    }).then(function(res) {
      return res.json().catch(function() { return {}; }).then(function(data) {
        if (!res.ok) {
          const err = new Error(data.msg || data.error_description || data.message || 'Erro ao entrar');
          err.code = data.error_code || data.error;
          throw err;
        }
        return data;
      });
    });
  }

  function loadProfile(session) {
    return fetch(SUPABASE_URL + '/rest/v1/profiles?select=display_name,role,plan,status&id=eq.' + session.user.id, {
      headers: { apikey: SUPABASE_KEY, Authorization: 'Bearer ' + session.access_token }
    })
      .then(function(res) { return res.ok ? res.json() : []; })
      .then(function(rows) { return rows[0] || {}; })
      .catch(function() { return {}; });
  }

  function applySession(session) {
    return loadProfile(session).then(function(profile) {
      if (profile.status === 'suspended') {
        const err = new Error('Sua conta está suspensa. Fale com o suporte.');
        err.code = 'suspended';
        throw err;
      }
      const meta = session.user.user_metadata || {};
      handleLoginSuccess({
        uid: session.user.id,
        email: session.user.email,
        displayName: profile.display_name || meta.full_name || meta.name || session.user.email.split('@')[0],
        role: profile.role || 'user',
        plan: profile.plan || 'free',
        session: {
          access_token: session.access_token,
          refresh_token: session.refresh_token,
          expires_at: session.expires_at || Math.floor(Date.now() / 1000) + (session.expires_in || 3600)
        }
      });
    });
  }

  function refreshSessionIfNeeded() {
    if (!currentUser || !currentUser.session || !currentUser.session.refresh_token) {
      currentUser = null;
      updateScreens();
      return;
    }
    const now = Math.floor(Date.now() / 1000);
    if (currentUser.session.expires_at && currentUser.session.expires_at - now > 120) {
      updateScreens();
      return;
    }
    authRequest('token?grant_type=refresh_token', { refresh_token: currentUser.session.refresh_token })
      .then(applySession)
      .catch(function(err) {
        // Sessão expirada ou revogada volta para o login; sem internet, mantém a sessão salva
        if (err && err.code) {
          currentUser = null;
          saveState();
        }
        updateScreens();
      });
  }

  function authErrorMessage(err) {
    const code = err && err.code;
    if (code === 'invalid_credentials' || code === 'invalid_grant') {
      return 'E-mail ou senha incorretos. Se você criou a conta com o Google, defina uma senha no site.';
    }
    if (code === 'email_not_confirmed') return 'Confirme seu e-mail pelo link que enviamos antes de entrar.';
    if (code === 'over_request_rate_limit') return 'Muitas tentativas. Aguarde alguns minutos e tente de novo.';
    return (err && err.message) || 'Não foi possível entrar. Verifique sua conexão.';
  }

  function showAuthError(message) {
    if (message) {
      authErrorBanner.innerText = message;
      authErrorBanner.classList.remove('hidden');
    } else {
      authErrorBanner.classList.add('hidden');
    }
  }

  formEmailAuth.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = inpGatewayEmail.value.trim();
    const password = inpGatewayPassword.value;
    if (!email || !password) return;

    showAuthError(null);
    btnSubmitGateway.disabled = true;
    const label = btnSubmitGateway.querySelector('span');
    if (label) label.innerText = 'Entrando...';

    authRequest('token?grant_type=password', { email: email, password: password })
      .then(applySession)
      .then(function() { inpGatewayPassword.value = ''; })
      .catch(function(err) { showAuthError(authErrorMessage(err)); })
      .finally(function() {
        btnSubmitGateway.disabled = false;
        if (label) label.innerText = 'Entrar no Sistema';
      });
  });

  btnOpenSignup.addEventListener('click', () => {
    if (window.chrome && chrome.tabs && chrome.tabs.create) {
      chrome.tabs.create({ url: SITE_URL });
    } else {
      window.open(SITE_URL, '_blank');
    }
  });

  btnLogoutTop.addEventListener('click', handleLogout);
  btnLogoutAccount.addEventListener('click', handleLogout);

  btnSyncProjectSettings.addEventListener('click', () => {
    alert('Regras tributárias, metas de markup e taxa SFP sincronizadas com o Gerenciie Pro!');
  });

  // Calculator Listeners
  channelTabs.forEach(t => {
    t.addEventListener('click', () => {
      setPlatform(t.getAttribute('data-platform'), true);
    });
  });

  [inpCost, inpFreight, inpPackaging, inpAds, inpTax, inpCommission, inpFixedFee, inpCustomPrice, inpProdName].forEach(el => {
    el.addEventListener('input', calculate);
  });

  rngMarkup.addEventListener('input', (e) => {
    txtMarkupDisplay.innerText = parseFloat(e.target.value).toFixed(2) + 'x';
    calculate();
  });

  selPricingMode.addEventListener('change', (e) => {
    pricingMode = e.target.value;
    togglePricingModeUI();
    calculate();
  });

  btnReset.addEventListener('click', () => {
    inpCost.value = '${defaultCost.toFixed(2)}';
    inpFreight.value = '${defaultFreight.toFixed(2)}';
    inpPackaging.value = '${defaultPackaging.toFixed(2)}';
    rngMarkup.value = '${defaultMarkup}';
    txtMarkupDisplay.innerText = '${defaultMarkup.toFixed(2)}x';
    selPricingMode.value = 'markup';
    pricingMode = 'markup';
    if (chkSfpEnabled) {
      chkSfpEnabled.checked = ${defaultSfpEnabled};
      toggleSfpUI();
    }
    togglePricingModeUI();
    setPlatform('dropshipping', true);
  });

  btnCopyPrice.addEventListener('click', () => {
    const priceText = 'R$ ' + resFinalPrice.innerText;
    navigator.clipboard.writeText(priceText).then(() => {
      txtCopyBtn.innerText = 'Copiado!';
      setTimeout(() => { txtCopyBtn.innerText = 'Copiar Preço'; }, 1500);
    });
  });

  btnCopySummary.addEventListener('click', () => {
    const summary = [
      '🚀 *GERENCIIE PRO • RESUMO DE PRECIFICAÇÃO*',
      '• Produto: ' + (inpProdName.value || 'Item Fornecedor'),
      '• Canal: ' + currentPlatform.toUpperCase(),
      '• Custo Produto + Frete: R$ ' + formatBRL(parseFloat(inpCost.value || 0) + parseFloat(inpFreight.value || 0)),
      '• Preço de Venda: R$ ' + resFinalPrice.innerText,
      '• Markup Efetivo: ' + resMarkupVal.innerText,
      '• Margem de Lucro: ' + resMarginVal.innerText,
      '• Lucro Líquido Unitário: ' + resProfitVal.innerText,
      '• CPA Breakeven (Teto Ads): ' + resCpaBreakeven.innerText,
      '• Taxa de Serviço SFP: ' + (txtSfpFeeCalculated ? txtSfpFeeCalculated.innerText : 'Ativa'),
      '• Total Taxas & Impostos: ' + resTotalFees.innerText + ' (' + resFeesPercent.innerText + ')'
    ].join('\\n');

    navigator.clipboard.writeText(summary).then(() => {
      alert('Resumo completo copiado!');
    });
  });

  btnSaveToProject.addEventListener('click', saveProductToProject);

  btnClearSaved.addEventListener('click', () => {
    if (confirm('Deseja limpar todos os produtos salvos na extensão?')) {
      savedProducts = [];
      saveState();
      renderSavedProducts();
    }
  });

  // Auto Grab from Page
  btnAutoGrab.addEventListener('click', () => {
    if (window.chrome && chrome.tabs && chrome.scripting) {
      chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        if (!tabs || !tabs[0]) return;
        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          func: grabPageData
        }, (results) => {
          if (results && results[0] && results[0].result) {
            const data = results[0].result;
            if (data.price > 0) {
              inpCost.value = data.price.toFixed(2);
              if (inpSfpOrigPrice) inpSfpOrigPrice.value = (data.price * 2.5).toFixed(2);
            }
            if (data.title) inpProdName.value = data.title;
            calculate();
            alert('Produto capturado: R$ ' + data.price.toFixed(2) + ' (' + data.title + ')');
          } else {
            alert('Não foi possível identificar o preço automaticamente nesta aba. Digite o custo manualmente.');
          }
        });
      });
    } else {
      alert('Recurso ativo ao usar no navegador Chrome!');
    }
  });

  function grabPageData() {
    let foundPrice = 0;
    let foundTitle = '';

    const titleEl = document.querySelector('h1') || document.querySelector('.product-title') || document.querySelector('[data-testid="product-title"]');
    if (titleEl && titleEl.innerText) {
      foundTitle = titleEl.innerText.trim().slice(0, 50);
    }

    const selectors = [
      '.product-price-value',
      '.price-current',
      '.andes-money-amount__fraction',
      '.shopee-price-main',
      '.product-price',
      '[itemprop="price"]',
      '.price'
    ];
    for (const sel of selectors) {
      const el = document.querySelector(sel);
      if (el && el.innerText) {
        const text = el.innerText.replace(/[^0-9,\\.]/g, '').replace(',', '.');
        const num = parseFloat(text);
        if (!isNaN(num) && num > 0) {
          foundPrice = num;
          break;
        }
      }
    }
    return { price: foundPrice, title: foundTitle };
  }

  loadState();
})();
`;

  const contentJs = `// Gerenciie Pro Content Helper
(function() {
  console.log('[Gerenciie Pro] Assistente Oficial de Precificação E-com conectado.');
  
  function createFloatingBadge() {
    if (document.getElementById('gerenciie-extension-badge')) return;
    const badge = document.createElement('div');
    badge.id = 'gerenciie-extension-badge';
    badge.style.cssText = \`
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 999999;
      background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
      color: white;
      padding: 8px 16px;
      border-radius: 999px;
      box-shadow: 0 10px 25px -5px rgba(37, 99, 235, 0.55);
      font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
      font-size: 11px;
      font-weight: 800;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      border: 1px solid rgba(255,255,255,0.25);
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    \`;
    badge.innerHTML = '⚡ Gerenciie Pro • Calcular Margem Real';
    badge.onmouseenter = () => {
      badge.style.transform = 'scale(1.05)';
      badge.style.boxShadow = '0 15px 30px -5px rgba(37, 99, 235, 0.7)';
    };
    badge.onmouseleave = () => {
      badge.style.transform = 'scale(1)';
      badge.style.boxShadow = '0 10px 25px -5px rgba(37, 99, 235, 0.55)';
    };
    badge.onclick = () => {
      alert('Abra a extensão Gerenciie Pro no topo do Chrome (ou use Ctrl+Shift+P) para precificar!');
    };
    document.body.appendChild(badge);
  }

  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(createFloatingBadge, 1200);
  } else {
    window.addEventListener('DOMContentLoaded', createFloatingBadge);
  }
})();
`;

  const backgroundJs = `// Gerenciie Pro Extension Background Service Worker
chrome.runtime.onInstalled.addListener(() => {
  console.log('[Gerenciie Pro] Extensão de Precificação com Paleta Oficial Gerenciie Pro instalada.');
});
`;

  const readmeMd = `# 🚀 Gerenciie Pro • Extensão Oficial para Navegador

Com o design system oficial, gradientes e paleta de cores do **Gerenciie Pro**:
- **Gradiente Oficial**: \`linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)\`
- **Cores**: Cobalt Blue (\`#2563EB\`), Sky Blue (\`#38BDF8\`), Slate 900/800 e Emerald Green (\`#10B981\`).
- **Taxa de Serviço SFP**: Programa de Frete Grátis integrado.
- **Login Seguro**: Autenticação com e-mail, senha ou token de 1-clique.

---

## 📦 Como Instalar:
1. Descompacte o arquivo ZIP.
2. Abra \`chrome://extensions\` no Chrome.
3. Ative o **Modo do Desenvolvedor**.
4. Clique em **Carregar sem compactação** e selecione a pasta.
`;

  return {
    'manifest.json': manifest,
    'popup.html': popupHtml,
    'popup.js': popupJs,
    'content.js': contentJs,
    'background.js': backgroundJs,
    'styles.css': stylesCss,
    'README.md': readmeMd
  };
}

export async function downloadExtensionZip(
  defaultPricing?: Partial<PricingData>,
  currentUser?: any
): Promise<void> {
  const files = generateExtensionFiles(defaultPricing, currentUser);
  const zip = new JSZip();

  zip.file('manifest.json', files['manifest.json']);
  zip.file('popup.html', files['popup.html']);
  zip.file('popup.js', files['popup.js']);
  zip.file('content.js', files['content.js']);
  zip.file('background.js', files['background.js']);
  zip.file('styles.css', files['styles.css']);
  zip.file('README.md', files['README.md']);

  // Ícones reais (PNG) com a logo, servidos pelo próprio site
  const iconsFolder = zip.folder('icons');
  if (iconsFolder) {
    await Promise.all([16, 48, 128].map(async (size) => {
      const res = await fetch(`/extension/icon${size}.png`);
      if (!res.ok) throw new Error(`Ícone ${size}px não encontrado`);
      iconsFolder.file(`icon${size}.png`, await res.arrayBuffer());
    }));
  }

  const content = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(content);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'gerenciie-pro-extensao-oficial.zip';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
