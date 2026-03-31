function formatPrice(price) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(Number(price) || 0);
}

function getLocationText(value) {
  return value || '';
}

function displayOrderDetails(order) {
  if (!order || typeof order !== 'object') {
    return;
  }

  const orderIdEl = document.getElementById('order-id');
  const shippingEl = document.getElementById('shipping-details');
  const paymentEl = document.getElementById('payment-details');
  const orderItemsEl = document.getElementById('order-items');

  if (!orderIdEl || !shippingEl || !paymentEl || !orderItemsEl) {
    return;
  }

  orderIdEl.textContent = `Mã đơn: #${order.orderId || ''}`;

  const shipping = order.shipping || {};
  shippingEl.innerHTML = `
    <p><strong>${shipping.fullName || 'Chưa cập nhật'}</strong></p>
    <p>${shipping.phoneNumber || 'Chưa cập nhật'}</p>
    <p>${shipping.street || 'Chưa cập nhật'}</p>
    <p>${getLocationText(shipping.ward)}, ${getLocationText(shipping.district)}, ${getLocationText(shipping.province)}</p>
    ${shipping.note ? `<p><em>Ghi chú: ${shipping.note}</em></p>` : ''}
  `;

  const paymentNames = {
    cod: 'COD - Thanh toán khi nhận hàng',
    vnpay: 'VNPay - Chuyển khoản QR Code',
    momo: 'MoMo - Ví điện tử',
    bank_transfer: 'Chuyển khoản ngân hàng',
    installment: 'Trả góp 0%'
  };
  paymentEl.innerHTML = `<p>${paymentNames[order.payment] || paymentNames.cod}</p>`;

  const cart = order.cart || { items: [], discount: 0 };
  const itemsHtml = (cart.items || [])
    .map(
      (item) => `
    <tr>
      <td>
        ${item.name || item.title || 'Sản phẩm'}<br>
        <small style="color: var(--text-secondary)">${item.variant || 'Phiên bản tiêu chuẩn'}</small>
      </td>
      <td style="text-align: center">${Number(item.quantity) || 1}</td>
      <td style="text-align: right">${formatPrice((Number(item.price) || 0) * (Number(item.quantity) || 1))}</td>
    </tr>
  `
    )
    .join('');

  const subtotal = (cart.items || []).reduce(
    (sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 0),
    0
  );
  const discount = Number(cart.discount) || 0;
  const total = subtotal - discount;

  let tableHtml = itemsHtml;

  if (discount > 0) {
    tableHtml += `
      <tr>
        <td colspan="2"><strong>Tạm tính</strong></td>
        <td style="text-align: right">${formatPrice(subtotal)}</td>
      </tr>
      <tr>
        <td colspan="2"><strong>Giảm giá</strong></td>
        <td style="text-align: right; color: #30d158">-${formatPrice(discount)}</td>
      </tr>
    `;
  }

  tableHtml += `
    <tr class="order-total-row">
      <td colspan="2"><strong>Tổng cộng</strong></td>
      <td style="text-align: right" class="price">${formatPrice(total)}</td>
    </tr>
  `;

  orderItemsEl.innerHTML = tableHtml;
}

function displayMockOrder(orderId) {
  const orderIdEl = document.getElementById('order-id');
  const shippingEl = document.getElementById('shipping-details');
  const paymentEl = document.getElementById('payment-details');
  const orderItemsEl = document.getElementById('order-items');

  if (!orderIdEl || !shippingEl || !paymentEl || !orderItemsEl) {
    return;
  }

  orderIdEl.textContent = `Mã đơn: #${orderId || 'ILUX-2026-00342'}`;

  shippingEl.innerHTML = `
    <p><strong>Nguyễn Văn A</strong></p>
    <p>0912345678</p>
    <p>123 Nguyễn Huệ</p>
    <p>Hàng Bạc, Hoàn Kiếm, Hà Nội</p>
  `;

  paymentEl.innerHTML = '<p>COD - Thanh toán khi nhận hàng</p>';

  orderItemsEl.innerHTML = `
    <tr>
      <td>
        iPhone 16 Pro Max<br>
        <small style="color: var(--text-secondary)">256GB / Titan Tự Nhiên</small>
      </td>
      <td style="text-align: center">1</td>
      <td style="text-align: right">${formatPrice(29990000)}</td>
    </tr>
    <tr>
      <td>
        MacBook Pro 14" M3<br>
        <small style="color: var(--text-secondary)">16GB / 512GB / Space Black</small>
      </td>
      <td style="text-align: center">1</td>
      <td style="text-align: right">${formatPrice(39990000)}</td>
    </tr>
    <tr class="order-total-row">
      <td colspan="2"><strong>Tổng cộng</strong></td>
      <td style="text-align: right" class="price">${formatPrice(69980000)}</td>
    </tr>
  `;
}

export function initOrderConfirmationPage(options = {}) {
  const orderId = options.orderId || new URLSearchParams(window.location.search).get('id') || '';

  const detailLink = document.getElementById('btn-order-detail');
  if (detailLink) {
    detailLink.setAttribute('href', `./index.html?page=order-detail&id=${encodeURIComponent(orderId)}`);
  }

  let order = null;
  try {
    const raw = localStorage.getItem('iluxury_last_order');
    order = raw ? JSON.parse(raw) : null;
  } catch (error) {
    order = null;
  }

  if (order) {
    displayOrderDetails(order);
  } else {
    displayMockOrder(orderId);
  }

  if (window.lucide) {
    window.lucide.createIcons();
  }
}

if (document.getElementById('order-id')) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initOrderConfirmationPage();
    });
  } else {
    initOrderConfirmationPage();
  }
}
