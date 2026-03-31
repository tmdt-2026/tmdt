import { renderHeader } from './components/header.js';
import { renderFooter } from './components/footer.js';
import { siteData } from './data/products.js';

function updateCartCountBadge(totalItems) {
  const cartCountEl = document.getElementById('cart-count');
  const mobileCartCountEl = document.getElementById('mobile-cart-count');
  if (cartCountEl) {
    cartCountEl.textContent = String(totalItems);
    cartCountEl.classList.toggle('is-empty', totalItems === 0);
  }
  if (mobileCartCountEl) {
    mobileCartCountEl.textContent = String(totalItems);
  }
}

function bindCartInteractions() {
  const cartContainer = document.querySelector('.cart-container');
  if (!cartContainer) {
    return;
  }
  const getTotalItems = () =>
    Array.from(cartContainer.querySelectorAll('.qty-val')).reduce((total, item) => {
      const quantity = Number.parseInt(item.textContent || '0', 10);
      return total + (Number.isNaN(quantity) ? 0 : quantity);
    }, 0);
  cartContainer.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) {
      return;
    }
    const qtyButton = target.closest('.qty-btn');
    if (qtyButton) {
      const qtyControl = qtyButton.closest('.qty-ctrl');
      const qtyValueEl = qtyControl?.querySelector('.qty-val');
      if (!qtyValueEl) {
        return;
      }
      const currentValue = Number.parseInt(qtyValueEl.textContent || '1', 10) || 1;
      const isIncrease = qtyButton.dataset.action === 'increase';
      const nextValue = isIncrease ? currentValue + 1 : Math.max(1, currentValue - 1);
      qtyValueEl.textContent = String(nextValue);
      updateCartCountBadge(getTotalItems());
      return;
    }
    const deleteButton = target.closest('.del-btn');
    if (deleteButton) {
      const cartItem = deleteButton.closest('.cart-item');
      cartItem?.remove();
      updateCartCountBadge(getTotalItems());
    }
  });
  updateCartCountBadge(getTotalItems());
}

function initLayout() {
  const headerRoot = document.getElementById('header-root');
  const footerRoot = document.getElementById('footer-root');
  if (headerRoot) {
    headerRoot.innerHTML = renderHeader(siteData.header);
  }
  if (footerRoot) {
    footerRoot.innerHTML = renderFooter(siteData.footer);
  }
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

function initCartPage() {
  initLayout();
  bindCartInteractions();
}

initCartPage();
