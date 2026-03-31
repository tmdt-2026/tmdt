const STATUS_LABELS = {
  pending: 'Chờ xử lý',
  processing: 'Đang xử lý',
  shipped: 'Đang giao',
  completed: 'Hoàn thành',
  cancelled: 'Đã hủy'
};

const PAYMENT_LABELS = {
  cod: 'COD',
  vnpay: 'VNPay',
  momo: 'MoMo',
  bank_transfer: 'Chuyển khoản',
  installment: 'Trả góp 0%'
};

function formatPrice(price) {
  const numeric = Number(price) || 0;
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(numeric);
}

function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'Không rõ thời gian';
  }
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

function normalizeOrder(order) {
  if (!order || typeof order !== 'object') {
    return null;
  }

  const items = Array.isArray(order?.cart?.items) ? order.cart.items : [];
  const subtotal = items.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 0), 0);
  const discount = Number(order?.cart?.discount) || 0;
  const total = subtotal - discount;

  return {
    orderId: order.orderId || `ILUX-${Date.now()}`,
    createdAt: order.createdAt || new Date().toISOString(),
    status: order.status || 'processing',
    payment: order.payment || 'cod',
    itemCount: items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0),
    subtotal,
    discount,
    total,
    raw: order
  };
}

function loadOrders() {
  let history = [];
  let lastOrder = null;

  try {
    const raw = localStorage.getItem('iluxury_order_history');
    history = raw ? JSON.parse(raw) : [];
  } catch (error) {
    history = [];
  }

  try {
    const rawLast = localStorage.getItem('iluxury_last_order');
    lastOrder = rawLast ? JSON.parse(rawLast) : null;
  } catch (error) {
    lastOrder = null;
  }

  const merged = Array.isArray(history) ? [...history] : [];
  if (lastOrder && !merged.some((item) => item?.orderId === lastOrder.orderId)) {
    merged.unshift(lastOrder);
  }

  return merged
    .map(normalizeOrder)
    .filter(Boolean)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

function renderEmpty() {
  return `
    <article class="order-empty-state">
      <i data-lucide="shopping-bag"></i>
      <h3>Bạn chưa có đơn hàng nào</h3>
      <p>Hãy khám phá các sản phẩm Apple chính hãng tại iLuxury.</p>
      <a href="./index.html" class="btn btn-primary">Mua sắm ngay</a>
    </article>
  `;
}

function renderOrderCard(order) {
  const statusClass = `order-status-badge status-${order.status}`;
  return `
    <article class="order-card">
      <div class="order-card-head">
        <div>
          <p class="order-id">#${order.orderId}</p>
          <p class="order-date">${formatDate(order.createdAt)}</p>
        </div>
        <span class="${statusClass}">${STATUS_LABELS[order.status] || STATUS_LABELS.processing}</span>
      </div>
      <div class="order-card-meta">
        <span>${order.itemCount} sản phẩm</span>
        <span>•</span>
        <span>${PAYMENT_LABELS[order.payment] || PAYMENT_LABELS.cod}</span>
      </div>
      <div class="order-card-total">Tổng thanh toán: <strong>${formatPrice(order.total)}</strong></div>
      <div class="order-card-actions">
        <a href="./index.html?page=order-detail&id=${encodeURIComponent(order.orderId)}" class="btn btn-secondary btn-sm">
          Xem chi tiết
        </a>
        <a href="./index.html" class="btn btn-primary btn-sm">Mua lại</a>
      </div>
    </article>
  `;
}

function renderOrders(orders, statusFilter) {
  const listRoot = document.getElementById('order-list');
  if (!listRoot) {
    return;
  }

  const filtered = statusFilter === 'all'
    ? orders
    : orders.filter((item) => item.status === statusFilter);

  if (!filtered.length) {
    listRoot.innerHTML = renderEmpty();
    if (window.lucide) {
      window.lucide.createIcons();
    }
    return;
  }

  listRoot.innerHTML = filtered.map(renderOrderCard).join('');
}

function setupOrderFilters(orders) {
  const filterRoot = document.getElementById('order-filter-bar');
  if (!filterRoot) {
    return;
  }

  let currentFilter = 'all';
  renderOrders(orders, currentFilter);

  filterRoot.addEventListener('click', (event) => {
    const button = event.target.closest('.order-filter-btn[data-status]');
    if (!button) {
      return;
    }

    currentFilter = button.dataset.status || 'all';
    filterRoot.querySelectorAll('.order-filter-btn').forEach((item) => {
      item.classList.toggle('active', item === button);
    });
    renderOrders(orders, currentFilter);
  });
}

export function initOrderHistoryPage() {
  const orders = loadOrders();
  setupOrderFilters(orders);
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initOrderHistoryPage();
  });
}
