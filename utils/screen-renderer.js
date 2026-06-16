import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const catalog = JSON.parse(readFileSync(join(__dirname, '..', 'components', 'component-catalog.json'), 'utf-8'));

export class ScreenRenderer {
  constructor(componentCatalog = catalog) {
    this.catalog = componentCatalog;
  }

  renderScreen(screenSpec) {
    // Reload the catalog from disk so components generated during this
    // request (saved by ComponentGenerator) are visible to the renderer.
    this.reloadCatalog();

    const html = this.renderHTML(screenSpec);
    const css = this.renderCSS(screenSpec.components);
    const figma = this.renderFigmaJSON(screenSpec);

    return { screenSpec, html, css, figma };
  }

  reloadCatalog() {
    try {
      this.catalog = JSON.parse(
        readFileSync(join(__dirname, '..', 'components', 'component-catalog.json'), 'utf-8')
      );
    } catch {
      /* keep existing catalog if reload fails */
    }
  }

  // Components that the renderer provides implicitly as the outer wrapper.
  // The AI sometimes emits these as children — skip them to avoid a nested frame.
  isWrapperComponent(type) {
    return type === 'PhoneFrame';
  }

  findCatalogComponent(type) {
    const groups = (this.catalog && this.catalog.components) || {};
    for (const list of Object.values(groups)) {
      const match = (list || []).find(c => c.name === type);
      if (match) return match;
    }
    return null;
  }

  renderHTML(screenSpec) {
    const components = (screenSpec.components || [])
      .filter(comp => !this.isWrapperComponent(comp.type));

    const componentHTML = components.map(comp => {
      const template = this.getComponentTemplate(comp);
      return `<div class="screen-component" data-component="${comp.type}" ${comp.id ? `data-id="${comp.id}"` : ''} ${comp.variant ? `data-variant="${comp.variant}"` : ''}>
${template}
</div>`;
    }).join('\n');

    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${screenSpec.screen} - M-PESA Lehulum</title>
${this.inlineStyles(screenSpec.components)}
</head>
<body>
<div class="phone-frame">
<div class="app-content">
${componentHTML}
</div>
</div>
<script src="https://unpkg.com/lucide@latest"></script>
<script>lucide.createIcons();</script>
</body>
</html>`;
  }

  getComponentTemplate(comp) {
    const templates = {
      HeaderNav: (p) => this.renderHeaderNav(p),
      TextField: (p) => this.renderTextField(p),
      AmountInput: (p) => this.renderAmountInput(p),
      TransactionCard: (p) => this.renderTransactionCard(p),
      PrimaryButton: (p) => this.renderPrimaryButton(p),
      SecondaryButton: (p) => this.renderSecondaryButton(p),
      ReceiverCard: (p) => this.renderReceiverCard(p),
      Keypad: () => this.renderKeypad(),
      BalanceCard: (p) => this.renderBalanceCard(p),
      QuickActions: (p) => this.renderQuickActions(p),
      Modal: (p) => this.renderModal(p),
      Toast: (p) => this.renderToast(p),
      PinInput: () => this.renderPinInput(),
      AppBar: (p) => this.renderAppBar(p),
    };

    const render = templates[comp.type];
    if (render) {
      return render(comp.props || {});
    }

    // Fallback: render from the catalog (built-in `structure` or saved file)
    // so catalogued and AI-generated components don't degrade to placeholders.
    const fallback = this.renderFromCatalog(comp);
    if (fallback) return fallback;

    return `<!-- Missing component: ${comp.type} -->`;
  }

  renderFromCatalog(comp) {
    const entry = this.findCatalogComponent(comp.type);
    if (!entry) return null;

    // Prefer an inline structure string if the catalog provides one.
    if (entry.structure) {
      return entry.structure.replace(/CONTENT/g, '');
    }

    // Otherwise read the component's saved HTML file.
    if (entry.file) {
      try {
        const raw = readFileSync(join(__dirname, '..', entry.file), 'utf-8');
        return raw.trim();
      } catch {
        return null;
      }
    }

    return null;
  }

  renderHeaderNav(props) {
    const title = props.title || 'Title';
    const backBtn = props.showBack !== false ? '<button class="back-btn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M19 12H5M12 19l-7-7 7-7"/></svg></button>' : '<div style="width:36px;"></div>';
    
    return `<div class="header-nav" data-component="HeaderNav">
${backBtn}
<span class="header-title">${title}</span>
${props.showClose ? '<button class="close-btn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>' : '<div style="width:36px;"></div>'}
</div>`;
  }

  renderTextField(props) {
    const label = props.label || 'Label';
    const placeholder = props.placeholder || '';
    const value = props.value || '';
    
    return `<div class="form-field" data-component="TextField">
<label>${label}</label>
<input type="text" placeholder="${placeholder}" value="${value}">
</div>`;
  }

  renderAmountInput(props) {
    const value = props.value || '0.00';
    const currency = props.currency || 'ETB';
    
    return `<div class="amount-display" data-component="AmountInput">
<span class="amount-value">${value}</span>
<span class="amount-currency">${currency}</span>
</div>`;
  }

  renderTransactionCard(props) {
    const title = props.title || 'Transaction Summary';
    const amount = props.amount || '0.00';
    const currency = props.currency || 'ETB';
    
    return `<div class="receipt-card" data-component="TransactionCard">
<div class="success-icon-wrapper"><svg viewBox="0 0 24 24" fill="none" stroke="white"><path d="M20 6 9 17l-5-5"/></svg></div>
<div class="receipt-header"><h2>${title}</h2><p>${props.subtitle || 'Thank you for choosing M-PESA'}</p></div>
<div class="amount-section">
<span class="amount-value">${amount}</span>
<span class="amount-currency">${currency}</span>
</div>
</div>`;
  }

  renderPrimaryButton(props) {
    const label = props.label || 'Button';
    const icon = props.icon ? `<i data-lucide="${props.icon}"></i>` : '';
    
    return `<button class="btn-primary" data-component="PrimaryButton">
${icon}${label}
</button>`;
  }

  renderSecondaryButton(props) {
    const label = props.label || 'Button';
    return `<button class="btn-secondary" data-component="SecondaryButton">${label}</button>`;
  }

  renderReceiverCard(props) {
    const name = props.name || 'Recipient Name';
    const bank = props.bank || 'Bank Name';
    const account = props.account || '**** ****';
    
    return `<div class="receiver-card" data-component="ReceiverCard">
<div class="receiver-avatar">AB</div>
<div class="receiver-info">
<span class="receiver-name">${name}</span>
<div class="receiver-bank"><span>${bank}</span><span>•</span><span>${account}</span></div>
</div>
</div>`;
  }

  renderKeypad() {
    return `<div class="keypad" data-component="Keypad">
${[1,2,3,4,5,6,7,8,9].map(n => `<button class="key">${n}</button>`).join('')}
<button class="key empty"></button>
<button class="key">0</button>
<button class="key delete"><svg viewBox="0 0 24 24" fill="none"><path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"/><line x1="18" y1="9" x2="12" y2="15"/><line x1="12" y1="9" x2="18" y2="15"/></svg></button>
</div>`;
  }

  renderBalanceCard(props) {
    return `<div class="balance-card-wrapper" data-component="BalanceCard">
<div class="balance-card">
<div class="balance-card-top">
<div class="main-balance"><span class="label">Main Balance (Birr)</span><span class="amount">${props.mainBalance || '*** ***'}</span></div>
<button class="add-money-btn"><span>Add Money</span></button>
</div>
</div>
</div>`;
  }

  renderQuickActions(props) {
    const actions = props.actions || ['Scan', 'Pay', 'Transfer'];
    return `<div class="actions" data-component="QuickActions">
${actions.map(a => `<div class="primary-action"><div class="icon-container"></div><span class="label">${a}</span></div>`).join('')}
</div>`;
  }

  renderModal(props) {
    return `<div class="modal-overlay" data-component="Modal">
<div class="fayda-modal">
<h2 class="modal-title">${props.title || 'Modal Title'}</h2>
<p class="modal-description">${props.description || ''}</p>
</div>
</div>`;
  }

  renderToast(props) {
    return `<div class="toast success" data-component="Toast">
<div class="toast-content"><div class="toast-title">${props.title || 'Success'}</div><div class="toast-subtitle">${props.subtitle || ''}</div></div>
</div>`;
  }

  renderPinInput() {
    return `<div class="pin-container" data-component="PinInput">
${Array(4).fill(0).map(() => '<div class="pin-box"></div>').join('')}
</div>`;
  }

  renderAppBar(props) {
    return `<div class="welcome-app-bar" data-component="AppBar">
<div class="leading-icon"><div class="avatar"><span>AM</span></div></div>
<div class="title"><span>${props.greeting || 'Good Morning'}, ${props.name || 'User'} 👋</span></div>
<div class="trailing-icon"></div>
</div>`;
  }

  // The stylesheet each component needs (relative to project root).
  static get styleMap() {
    return {
      HeaderNav: 'styles/component-status-bar.css',
      TextField: 'styles/component-extras.css',
      AmountInput: 'styles/component-keypad.css',
      TransactionCard: 'styles/component-transactions.css',
      PrimaryButton: 'styles/component-button.css',
      SecondaryButton: 'styles/component-button.css',
      ReceiverCard: 'styles/component-keypad.css',
      Keypad: 'styles/component-keypad.css',
      BalanceCard: 'styles/component-balance-card.css',
      QuickActions: 'styles/component-actions.css',
      Modal: 'styles/component-popup.css',
      Toast: 'styles/component-extras.css',
      PinInput: 'styles/component-extras.css',
      AppBar: 'styles/component-welcome-bar.css'
    };
  }

  // Embed all required CSS directly into the document so the screen is fully
  // self-contained — no external stylesheet links, so it renders correctly
  // anywhere (iframe srcdoc, preview panel, file://) without path/CORS issues.
  inlineStyles(components) {
    // design-tokens + base are always required; tokens MUST come first because
    // it carries the @import for the font (which has to precede other rules).
    const files = ['styles/design-tokens.css', 'styles/base.css'];
    const map = ScreenRenderer.styleMap;
    (components || []).forEach(comp => {
      if (map[comp.type] && !files.includes(map[comp.type])) files.push(map[comp.type]);
    });

    const css = files.map(rel => {
      try {
        return readFileSync(join(__dirname, '..', rel), 'utf-8');
      } catch {
        return `/* missing: ${rel} */`;
      }
    }).join('\n\n');

    return `<style>\n${css}\n</style>`;
  }

  getCSSLinks(components) {
    const cssFiles = new Set();
    const componentMap = {
      HeaderNav: '../styles/component-status-bar.css',
      TextField: '../styles/component-extras.css',
      AmountInput: '../styles/component-keypad.css',
      TransactionCard: '../styles/component-transactions.css',
      PrimaryButton: '../styles/component-button.css',
      SecondaryButton: '../styles/component-button.css',
      ReceiverCard: '../styles/component-keypad.css',
      Keypad: '../styles/component-keypad.css',
      BalanceCard: '../styles/component-balance-card.css',
      QuickActions: '../styles/component-actions.css',
      Modal: '../styles/component-popup.css',
      Toast: '../styles/component-extras.css',
      PinInput: '../styles/component-extras.css',
      AppBar: '../styles/component-welcome-bar.css'
    };

    components.forEach(comp => {
      if (componentMap[comp.type]) {
        cssFiles.add(componentMap[comp.type]);
      }
    });

    return Array.from(cssFiles).map(css => `<link rel="stylesheet" href="${css}">`).join('\n');
  }

  renderCSS(components) {
    const cssFiles = new Set(['../styles/design-tokens.css', '../styles/base.css']);
    
    const componentMap = {
      HeaderNav: '../styles/component-status-bar.css',
      TextField: '../styles/component-extras.css',
      AmountInput: '../styles/component-keypad.css',
      TransactionCard: '../styles/component-transactions.css',
      PrimaryButton: '../styles/component-button.css',
      SecondaryButton: '../styles/component-button.css',
      ReceiverCard: '../styles/component-keypad.css',
      Keypad: '../styles/component-keypad.css',
      BalanceCard: '../styles/component-balance-card.css',
      QuickActions: '../styles/component-actions.css',
      Modal: '../styles/component-popup.css',
      Toast: '../styles/component-extras.css',
      PinInput: '../styles/component-extras.css',
      AppBar: '../styles/component-welcome-bar.css'
    };

    components.forEach(comp => {
      if (componentMap[comp.type]) cssFiles.add(componentMap[comp.type]);
    });

    return Array.from(cssFiles).join('\n');
  }

  renderFigmaJSON(screenSpec) {
    return {
      version: 3,
      name: screenSpec.screen,
      width: 390,
      height: 780,
      children: (screenSpec.components || [])
        .filter(comp => !this.isWrapperComponent(comp.type))
        .map((comp, index) => ({
        type: 'FRAME',
        name: comp.type,
        component: { name: comp.type, variantProp: 'Variant', value: comp.variant || 'Default' },
        x: 0,
        y: index * 100,
        w: 390,
        h: 100
      }))
    };
  }
}