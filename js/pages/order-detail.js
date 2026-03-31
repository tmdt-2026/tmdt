const STATUS_FLOW = ['pending', 'processing', 'shipped', 'completed'];

const STATUS_LABELS = {
  pending: 'Chờ xử lý',
  processing: 'Đang xử lý',
  shipped: 'Đang giao',
  completed: 'Hoàn thành',
  cancelled: 'Đã hủy'
};

const PAYMENT_LABELS = {
  cod: 'COD - Thanh toán khi nhận hàng',
  vnpay: 'VNPay',
  momo: 'MoMo',
  bank_transfer: 'Chuyển khoản ngân hàng',
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

function readOrderPool() {
  let history = [];
  let last = null;

  try {
    const raw = localStorage.getItem('iluxury_order_history');
    history = raw ? JSON.parse(raw) : [];
  } catch (error) {
    history = [];
  }

  try {
    const raw = localStorage.getItem('iluxury_last_order');
    last = raw ? JSON.parse(raw) : null;
  } catch (error) {
    last = null;
  }

  const pool = Array.isArray(history) ? [...history] : [];
  if (last && !pool.some((item) => item?.orderId === last.orderId)) {
    pool.unshift(last);
  }
  return pool;
}

function normalizeOrder(order) {
  if (!order || typeof order !== 'object') {
    return null;
  }

  const items = Array.isArray(order?.cart?.items) ? order.cart.items : [];
  const subtotal = items.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 0), 0);
  const discount = Number(order?.cart?.discount) || 0;

  return {
    orderId: order.orderId || 'ILUX-UNKNOWN',
    createdAt: order.createdAt || new Date().toISOString(),
    status: order.status || 'processing',
    payment: order.payment || 'cod',
    shipping: order.shipping || {},
    items,
    subtotal,
    discount,
    total: subtotal - discount
  };
}

function findOrderById(orderId) {
  if (!orderId) {
    return null;
  }
  const pool = readOrderPool();
  const hit = pool.find((item) => item?.orderId === orderId);
  return normalizeOrder(hit);
}

function getOrderFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id') || '';
}

function renderStatusTimeline(status) {
  if (status === 'cancelled') {
    return `
      <div class="order-status-cancelled">
        <i data-lucide="x-circle"></i>
        <span>Đơn hàng đã bị hủy</span>
      </div>
    `;
  }

  const activeIndex = Math.max(0, STATUS_FLOW.indexOf(status));
  return `
    <div class="order-timeline">
      ${STATUS_FLOW.map((step, index) => {
        const stateClass = index <= activeIndex ? 'is-active' : '';
        return `
          <div class="order-timeline-step ${stateClass}">
            <span class="dot"></span>
            <span class="label">${STATUS_LABELS[step]}</span>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

function renderOrder(order) {
  const title = document.getElementById('detail-order-title');
  const subtitle = document.getElementById('detail-order-subtitle');
  const statusRoot = document.getElementById('order-detail-status');
  const shippingRoot = document.getElementById('detail-shipping');
  const paymentRoot = document.getElementById('detail-payment');
  const itemsRoot = document.getElementById('detail-items');
  const totalsRoot = document.getElementById('detail-totals');

  if (!title || !subtitle || !statusRoot || !shippingRoot || !paymentRoot || !itemsRoot || !totalsRoot) {
    return;
  }

  title.textContent = `Đơn hàng #${order.orderId}`;
  subtitle.textContent = `Đặt lúc ${formatDate(order.createdAt)} • ${STATUS_LABELS[order.status] || STATUS_LABELS.processing}`;
  statusRoot.innerHTML = renderStatusTimeline(order.status);

  const shipping = order.shipping || {};
  shippingRoot.innerHTML = `
    <p><strong>${shipping.fullName || 'Chưa cập nhật'}</strong></p>
    <p>${shipping.phoneNumber || 'Chưa cập nhật'}</p>
    <p>${shipping.street || 'Chưa cập nhật'}</p>
    <p>${shipping.ward || ''} ${shipping.district ? `, ${shipping.district}` : ''} ${shipping.province ? `, ${shipping.province}` : ''}</p>
    ${shipping.note ? `<p><em>Ghi chú: ${shipping.note}</em></p>` : ''}
  `;

  paymentRoot.innerHTML = `
    <p><strong>${PAYMENT_LABELS[order.payment] || PAYMENT_LABELS.cod}</strong></p>
    <p>Trạng thái đơn: ${STATUS_LABELS[order.status] || STATUS_LABELS.processing}</p>
  `;

  if (!order.items.length) {
    itemsRoot.innerHTML = '<p class="order-empty-inline">Không có sản phẩm trong đơn hàng.</p>';
  } else {
    itemsRoot.innerHTML = order.items.map((item) => `
      <div class="order-detail-item-row">
        <img src="${item.image || ''}" alt="${item.name || 'Sản phẩm'}" onerror="this.style.opacity='0'" />
        <div class="info">
          <p class="name">${item.name || 'Sản phẩm'}</p>
          <p class="variant">${item.variant || 'Phiên bản tiêu chuẩn'}</p>
        </div>
        <div class="qty">x${Number(item.quantity) || 1}</div>
        <div class="price">${formatPrice((Number(item.price) || 0) * (Number(item.quantity) || 0))}</div>
      </div>
    `).join('');
  }

  totalsRoot.innerHTML = `
    <div class="order-total-line"><span>Tạm tính</span><strong>${formatPrice(order.subtotal)}</strong></div>
    <div class="order-total-line"><span>Giảm giá</span><strong class="success">-${formatPrice(order.discount)}</strong></div>
    <div class="order-total-line grand"><span>Tổng thanh toán</span><strong>${formatPrice(order.total)}</strong></div>
  `;
}

function renderNotFound() {
  const title = document.getElementById('detail-order-title');
  const subtitle = document.getElementById('detail-order-subtitle');
  const statusRoot = document.getElementById('order-detail-status');
  const sections = document.querySelectorAll('.order-detail-card');

  if (title) {
    title.textContent = 'Không tìm thấy đơn hàng';
  }
  if (subtitle) {
    subtitle.textContent = 'Đơn hàng không tồn tại hoặc đã bị xóa khỏi lịch sử local.';
  }
  if (statusRoot) {
    statusRoot.innerHTML = `
      <article class="order-empty-state">
        <i data-lucide="alert-circle"></i>
        <h3>Không tìm thấy dữ liệu đơn hàng</h3>
        <p>Vui lòng quay lại lịch sử đơn hàng để chọn đơn khác.</p>
        <a href="./index.html?page=order-history" class="btn btn-primary">Về lịch sử đơn hàng</a>
      </article>
    `;
  }
  sections.forEach((section) => {
    section.style.display = 'none';
  });
}

export function initOrderDetailPage(options = {}) {
  const orderId = options.orderId || getOrderFromUrl();
  const order = findOrderById(orderId);

  if (!order) {
    renderNotFound();
  } else {
    renderOrder(order);
  }

  if (window.lucide) {
    window.lucide.createIcons();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initOrderDetailPage();
  });
}
