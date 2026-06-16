/**
 * M-PESA App - Unified Page Loader v2
 * Loads page components into the phone frame dynamically
 */

const PAGE_REGISTRY = {
  'send-money-menu': {
    title: 'Send Money Menu',
    content: 'components/send-money-menu-content.html',
    overlay: null,
    group: 'Send Money'
  },
  'transfer-select-bank': {
    title: 'Transfer - Select Bank',
    content: 'components/transfer-select-bank-content.html',
    overlay: null,
    group: 'Send Money'
  },
  'transfer-enter-amount': {
    title: 'Transfer - Enter Amount',
    content: 'components/transfer-enter-amount-content.html',
    overlay: null,
    group: 'Send Money'
  },
  'transfer-enter-pin': {
    title: 'Transfer - Enter PIN',
    content: 'components/transfer-enter-pin-content.html',
    overlay: null,
    group: 'Send Money'
  },
  'transaction-history': {
    title: 'Transaction History',
    content: null,
    overlay: null,
    group: 'Transactions'
  },
  'add-favourites': {
    title: 'Manage Favourites',
    content: null,
    overlay: null,
    group: 'Account'
  },
  'manage-statement': {
    title: 'Manage Statement',
    content: null,
    overlay: null,
    group: 'Transactions'
  },
  'account-detail': {
    title: 'Account Detail',
    content: null,
    overlay: null,
    group: 'Account'
  },
  'account': {
    title: 'Account',
    content: null,
    overlay: null,
    group: 'Account'
  },
  'create-pin': {
    title: 'Create PIN',
    content: null,
    overlay: null,
    group: 'Auth'
  },
  'confirm-profile': {
    title: 'Confirm Profile',
    content: null,
    overlay: null,
    group: 'Auth'
  },
  'signup': {
    title: 'M-PESA SignUp',
    content: null,
    overlay: null,
    group: 'Auth'
  },
  'login': {
    title: 'M-PESA Login',
    content: null,
    overlay: null,
    group: 'Auth'
  },
  'otp-verification': {
    title: 'OTP Verification',
    content: null,
    overlay: null,
    group: 'Auth'
  },
  'notification-center': {
    title: 'Notification Center',
    content: null,
    overlay: null,
    group: 'Account'
  }
};

async function loadFile(path) {
  try {
    const res = await fetch(path);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.text();
  } catch (e) {
    console.warn(`Cannot load ${path}:`, e);
    return null;
  }
}

function setInner(id, html) {
  const el = document.getElementById(id);
  if (el && html) el.innerHTML = html;
}

async function renderPage(pageName) {
  const page = PAGE_REGISTRY[pageName];
  if (!page) { console.error('Unknown page:', pageName); return; }

  // 1. Load phone frame
  const frame = await loadFile('components/page-frame.html');
  setInner('app', frame);

  // 2. Load & inject status bar
  const sb = await loadFile('components/status-bar.html');
  setInner('statusBarContainer', sb);

  // 3. Load & inject page content
  const content = await loadFile(page.content);
  setInner('pageContentContainer', content);

  // 4. Init Lucide
  if (typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons();

  // 5. Load any overlay
  if (page.overlay) {
    const overlay = await loadFile(page.overlay);
    setInner('pageOverlayContainer', overlay);
  }

  document.title = page.title;
}

// Auto-init
document.addEventListener('DOMContentLoaded', () => {
  const app = document.getElementById('app');
  const page = app?.getAttribute('data-page');
  if (page && PAGE_REGISTRY[page]) renderPage(page);
});