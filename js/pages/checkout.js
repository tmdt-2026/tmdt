// Checkout Page Logic
export class CheckoutPage {
  constructor(options = {}) {
    this.onNavigate = typeof options.onNavigate === 'function' ? options.onNavigate : null;
    this.onNotify = typeof options.onNotify === 'function' ? options.onNotify : null;
    this.currentStep = 1;
    this.cart = this.loadCart();
    this.formData = {
      shipping: {},
      payment: 'cod',
      voucher: null
    };
    this.init();
  }

  init() {
    this.renderOrderSummary();
    this.setupStepNavigation();
    this.setupFormValidation();
    this.setupPaymentSelection();
    this.setupVoucherHandling();
    this.loadSavedAddresses();
    this.setupProvinceData();
  }

  parsePrice(value) {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }
    const raw = String(value || '').replace(/[^\d]/g, '');
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  normalizeCartItem(item, index) {
    return {
      id: item?.id ?? `cart-item-${index + 1}`,
      name: item?.name || item?.title || 'Sản phẩm',
      variant: item?.variant || item?.sku || 'Phiên bản tiêu chuẩn',
      price: this.parsePrice(item?.price),
      quantity: Math.max(1, Number(item?.quantity) || 1),
      image: item?.image || ''
    };
  }

  loadCart() {
    const cartData = localStorage.getItem('cart');
    let parsed = [];
    try {
      parsed = cartData ? JSON.parse(cartData) : [];
    } catch (error) {
      parsed = [];
    }
    const items = Array.isArray(parsed)
      ? parsed.map((item, index) => this.normalizeCartItem(item, index))
      : [];

    return {
      items,
      discount: 0,
      shippingFee: 0
    };
  }

  renderOrderSummary() {
    if (!this.cart.items.length) {
      document.getElementById('summary-products').innerHTML = `
        <div class="summary-empty">
          <p>Giỏ hàng của bạn đang trống.</p>
          <a href="./index.html" class="btn btn-secondary btn-sm">Tiếp tục mua sắm</a>
        </div>
      `;
      this.updateTotals();
      return;
    }

    const productsHtml = this.cart.items.map(item => `
      <div class="summary-product">
        <img src="${item.image}" alt="${item.name}" class="summary-product-image" />
        <div class="summary-product-info">
          <div class="summary-product-name">${item.name}</div>
          <div class="summary-product-variant">${item.variant}</div>
          <div class="summary-product-price">
            <span class="summary-product-quantity">x${item.quantity}</span>
            <span class="summary-product-total">${this.formatPrice(item.price * item.quantity)}</span>
          </div>
        </div>
      </div>
    `).join('');

    document.getElementById('summary-products').innerHTML = productsHtml;
    this.updateTotals();
  }

  updateTotals() {
    const subtotal = this.cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const discount = this.cart.discount || 0;
    const total = subtotal - discount;

    document.getElementById('subtotal').textContent = this.formatPrice(subtotal);
    document.getElementById('total').textContent = this.formatPrice(total);

    if (discount > 0) {
      document.getElementById('discount').textContent = `-${this.formatPrice(discount)}`;
      document.getElementById('discount-line').style.display = 'flex';
    } else {
      document.getElementById('discount-line').style.display = 'none';
    }
  }

  formatPrice(price) {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  }

  setupStepNavigation() {
    // Continue to Payment
    document.getElementById('btn-continue-payment').addEventListener('click', () => {
      if (!this.cart.items.length) {
        this.showNotification('Giỏ hàng trống, vui lòng chọn sản phẩm trước khi đặt hàng.', 'error');
        return;
      }
      if (this.validateShippingForm()) {
        this.saveShippingData();
        this.goToStep(2);
      }
    });

    // Back to Shipping
    document.getElementById('btn-back-shipping').addEventListener('click', () => {
      this.goToStep(1);
    });

    // Continue to Confirmation
    document.getElementById('btn-continue-confirm').addEventListener('click', () => {
      this.savePaymentData();
      this.showConfirmation();
      this.goToStep(3);
    });

    // Back to Payment
    document.getElementById('btn-back-payment').addEventListener('click', () => {
      this.goToStep(2);
    });

    // Place Order
    document.getElementById('btn-place-order').addEventListener('click', () => {
      this.placeOrder();
    });
  }

  goToStep(step) {
    // Hide all steps
    document.querySelectorAll('.checkout-step').forEach(el => {
      el.style.display = 'none';
    });

    // Show current step
    document.querySelector(`.checkout-step[data-step="${step}"]`).style.display = 'block';

    // Update stepper
    document.querySelectorAll('.stepper-item').forEach((item, index) => {
      const stepNum = index + 1;
      item.classList.remove('active', 'completed');
      
      if (stepNum === step) {
        item.classList.add('active');
      } else if (stepNum < step) {
        item.classList.add('completed');
        item.querySelector('.stepper-circle').textContent = '✓';
      } else {
        item.querySelector('.stepper-circle').textContent = stepNum;
      }
    });

    this.currentStep = step;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  setupFormValidation() {
    const form = document.getElementById('shipping-form');
    const inputs = form.querySelectorAll('input, select, textarea');

    inputs.forEach(input => {
      // Validate on blur
      input.addEventListener('blur', () => {
        this.validateField(input);
      });

      // Clear error on input
      input.addEventListener('input', () => {
        const formGroup = input.closest('.form-group');
        formGroup.classList.remove('has-error');
        formGroup.querySelector('.form-error').textContent = '';
      });
    });
  }

  validateField(input) {
    const formGroup = input.closest('.form-group');
    const errorEl = formGroup.querySelector('.form-error');
    let error = '';

    if (input.hasAttribute('required') && !input.value.trim()) {
      error = 'Vui lòng nhập thông tin này';
    } else if (input.type === 'tel' && input.value) {
      const phoneRegex = /^0\d{9}$/;
      if (!phoneRegex.test(input.value)) {
        error = 'Số điện thoại không hợp lệ';
      }
    }

    if (error) {
      formGroup.classList.add('has-error');
      errorEl.textContent = error;
      return false;
    } else {
      formGroup.classList.remove('has-error');
      errorEl.textContent = '';
      return true;
    }
  }

  validateShippingForm() {
    const form = document.getElementById('shipping-form');
    const inputs = form.querySelectorAll('[required]');
    let isValid = true;

    inputs.forEach(input => {
      if (!this.validateField(input)) {
        isValid = false;
      }
    });

    if (!isValid) {
      const firstError = form.querySelector('.has-error');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }

    return isValid;
  }

  saveShippingData() {
    const form = document.getElementById('shipping-form');
    const formData = new FormData(form);
    
    this.formData.shipping = {
      fullName: formData.get('fullName'),
      phoneNumber: formData.get('phoneNumber'),
      province: formData.get('province'),
      district: formData.get('district'),
      ward: formData.get('ward'),
      street: formData.get('street'),
      note: formData.get('note')
    };
  }

  savePaymentData() {
    const selectedPayment = document.querySelector('input[name="payment"]:checked');
    this.formData.payment = selectedPayment ? selectedPayment.value : 'cod';
  }

  setupPaymentSelection() {
    const paymentMethods = document.querySelectorAll('.payment-method');

    const refreshSelectionState = () => {
      paymentMethods.forEach((method) => {
        const radio = method.querySelector('input[type="radio"]');
        method.classList.toggle('is-selected', Boolean(radio?.checked));
      });
    };

    paymentMethods.forEach((method) => {
      const radio = method.querySelector('input[type="radio"]');
      method.addEventListener('click', () => {
        if (!radio) {
          return;
        }
        radio.checked = true;
        refreshSelectionState();
      });
      radio?.addEventListener('change', refreshSelectionState);
    });

    refreshSelectionState();
  }

  setupVoucherHandling() {
    const applyBtn = document.getElementById('btn-apply-voucher');
    const removeBtn = document.getElementById('btn-remove-voucher');
    const voucherInput = document.getElementById('voucher-code');

    applyBtn.addEventListener('click', () => {
      const code = voucherInput.value.trim().toUpperCase();
      if (code) {
        this.applyVoucher(code);
      }
    });

    removeBtn.addEventListener('click', () => {
      this.removeVoucher();
    });

    voucherInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        applyBtn.click();
      }
    });
  }

  applyVoucher(code) {
    // Mock voucher validation
    const mockVouchers = {
      'ILUX5000': { discount: 5000000, name: 'Giảm 5 triệu' },
      'NEWUSER': { discount: 3000000, name: 'Giảm 3 triệu' }
    };

    const voucher = mockVouchers[code];
    
    if (voucher) {
      this.formData.voucher = { code, ...voucher };
      this.cart.discount = voucher.discount;
      
      // Update UI
      document.getElementById('voucher-code').value = '';
      document.querySelector('.voucher-input-wrapper').style.display = 'none';
      document.getElementById('voucher-applied').style.display = 'flex';
      document.getElementById('applied-voucher-code').textContent = code;
      
      this.updateTotals();
      this.showNotification('Áp dụng voucher thành công!', 'success');
    } else {
      this.showNotification('Mã giảm giá không hợp lệ', 'error');
    }
  }

  removeVoucher() {
    this.formData.voucher = null;
    this.cart.discount = 0;
    
    // Update UI
    document.querySelector('.voucher-input-wrapper').style.display = 'flex';
    document.getElementById('voucher-applied').style.display = 'none';
    
    this.updateTotals();
  }

  loadSavedAddresses() {
    // Mock saved addresses
    const addresses = [
      {
        id: 1,
        label: 'Nhà riêng',
        fullName: 'Nguyễn Văn A',
        phoneNumber: '0912345678',
        province: 'hanoi',
        district: 'hoan-kiem',
        districtName: 'Hoàn Kiếm',
        ward: 'hang-bac',
        wardName: 'Hàng Bạc',
        street: '123 Nguyễn Huệ',
        note: ''
      },
      {
        id: 2,
        label: 'Văn phòng',
        fullName: 'Nguyễn Văn A',
        phoneNumber: '0912345678',
        province: 'hcm',
        district: 'quan-1',
        districtName: 'Quận 1',
        ward: 'ben-nghe',
        wardName: 'Bến Nghé',
        street: '456 Lê Lợi',
        note: 'Giao trong giờ hành chính'
      }
    ];

    const addressListHtml = addresses.map(addr => `
      <label class="address-item">
        <input type="radio" name="saved-address" value="${addr.id}" />
        <div class="address-content">
          <div class="address-label">${addr.label}</div>
          <div class="address-detail">
            ${addr.fullName} | ${addr.phoneNumber}<br>
            ${addr.street}, ${addr.wardName}, ${addr.districtName}
          </div>
        </div>
      </label>
    `).join('');

    document.querySelector('.address-list').innerHTML = addressListHtml;

    // Handle saved address selection
    document.querySelectorAll('input[name="saved-address"]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        const selectedAddr = addresses.find(a => a.id == e.target.value);
        if (selectedAddr) {
          this.fillShippingForm(selectedAddr);
          this.showNotification(`Đã áp dụng địa chỉ: ${selectedAddr.label}`, 'success');
        }
      });
    });
  }

  fillShippingForm(address) {
    document.getElementById('fullName').value = address.fullName;
    document.getElementById('phoneNumber').value = address.phoneNumber;
    document.getElementById('province').value = address.province;
    document.getElementById('street').value = address.street;

    const noteInput = document.getElementById('note');
    if (noteInput) {
      noteInput.value = address.note || '';
    }

    const provinceSelect = document.getElementById('province');
    const districtSelect = document.getElementById('district');
    const wardSelect = document.getElementById('ward');

    provinceSelect.dispatchEvent(new Event('change'));
    districtSelect.value = address.district || '';
    districtSelect.dispatchEvent(new Event('change'));
    wardSelect.value = address.ward || '';

    document.querySelectorAll('#shipping-form .form-group').forEach((group) => {
      group.classList.remove('has-error');
      const error = group.querySelector('.form-error');
      if (error) {
        error.textContent = '';
      }
    });
  }

  setupProvinceData() {
    const provinceSelect = document.getElementById('province');
    const districtSelect = document.getElementById('district');
    const wardSelect = document.getElementById('ward');

    // Mock data for provinces -> districts -> wards
    const locationData = {
      hanoi: {
        name: 'Hà Nội',
        districts: {
          'hoan-kiem': { name: 'Hoàn Kiếm', wards: ['Hàng Bạc', 'Hàng Bài', 'Hàng Trống'] },
          'ba-dinh': { name: 'Ba Đình', wards: ['Phúc Xá', 'Trúc Bạch', 'Ngọc Hà'] },
          'dong-da': { name: 'Đống Đa', wards: ['Cát Linh', 'Văn Miếu', 'Quốc Tử Giám'] }
        }
      },
      hcm: {
        name: 'TP. Hồ Chí Minh',
        districts: {
          'quan-1': { name: 'Quận 1', wards: ['Bến Nghé', 'Bến Thành', 'Nguyễn Thái Bình'] },
          'quan-3': { name: 'Quận 3', wards: ['Võ Thị Sáu', 'Phường 1', 'Phường 2'] },
          'tan-binh': { name: 'Tân Bình', wards: ['Phường 1', 'Phường 2', 'Phường 3'] }
        }
      }
    };

    provinceSelect.addEventListener('change', (e) => {
      const provinceId = e.target.value;
      districtSelect.innerHTML = '<option value="">Chọn Quận/Huyện</option>';
      wardSelect.innerHTML = '<option value="">Chọn Phường/Xã</option>';
      wardSelect.disabled = true;

      if (provinceId && locationData[provinceId]) {
        const districts = locationData[provinceId].districts;
        Object.keys(districts).forEach(districtId => {
          const option = document.createElement('option');
          option.value = districtId;
          option.textContent = districts[districtId].name;
          districtSelect.appendChild(option);
        });
        districtSelect.disabled = false;
      } else {
        districtSelect.disabled = true;
      }
    });

    districtSelect.addEventListener('change', (e) => {
      const provinceId = provinceSelect.value;
      const districtId = e.target.value;
      wardSelect.innerHTML = '<option value="">Chọn Phường/Xã</option>';

      if (provinceId && districtId && locationData[provinceId]) {
        const wards = locationData[provinceId].districts[districtId]?.wards || [];
        wards.forEach(ward => {
          const option = document.createElement('option');
          option.value = ward.toLowerCase().replace(/\s+/g, '-');
          option.textContent = ward;
          wardSelect.appendChild(option);
        });
        wardSelect.disabled = false;
      } else {
        wardSelect.disabled = true;
      }
    });
  }

  showConfirmation() {
    const { shipping, payment } = this.formData;

    if (!this.cart.items.length) {
      document.getElementById('confirmation-products').innerHTML = '<p>Không có sản phẩm trong giỏ hàng.</p>';
      return;
    }
    
    // Render shipping summary
    const shippingHtml = `
      <p><strong>${shipping.fullName}</strong></p>
      <p>${shipping.phoneNumber}</p>
      <p>${shipping.street}</p>
      <p>${this.getLocationText(shipping.ward)}, ${this.getLocationText(shipping.district)}, ${this.getLocationText(shipping.province)}</p>
      ${shipping.note ? `<p><em>Ghi chú: ${shipping.note}</em></p>` : ''}
    `;
    document.getElementById('shipping-summary').innerHTML = shippingHtml;

    // Render payment summary
    const paymentNames = {
      cod: '💵 COD - Thanh toán khi nhận hàng',
      vnpay: '🏦 VNPay - Chuyển khoản QR Code',
      momo: '📱 MoMo - Ví điện tử',
      bank_transfer: '💳 Chuyển khoản ngân hàng',
      installment: '✨ Trả góp 0%'
    };
    document.getElementById('payment-summary').innerHTML = `<p>${paymentNames[payment]}</p>`;

    // Render products
    const productsHtml = this.cart.items.map(item => `
      <div class="confirmation-product">
        <img src="${item.image}" alt="${item.name}" class="confirmation-product-image" />
        <div class="confirmation-product-info">
          <div class="confirmation-product-name">${item.name}</div>
          <div class="confirmation-product-variant">${item.variant} × ${item.quantity}</div>
        </div>
        <div class="confirmation-product-price">${this.formatPrice(item.price * item.quantity)}</div>
      </div>
    `).join('');
    document.getElementById('confirmation-products').innerHTML = productsHtml;
  }

  getLocationText(value) {
    const select = document.querySelector(`select option[value="${value}"]`);
    return select ? select.textContent : value;
  }

  async placeOrder() {
    // Show loading
    document.getElementById('loading-overlay').style.display = 'flex';

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Create order object
      const order = {
        ...this.formData,
        cart: this.cart,
        orderId: 'ILUX' + Date.now(),
        createdAt: new Date().toISOString(),
        status: 'processing'
      };

      // Save to localStorage (in real app, send to backend)
      localStorage.setItem('iluxury_last_order', JSON.stringify(order));

      const historyKey = 'iluxury_order_history';
      let history = [];
      try {
        const rawHistory = localStorage.getItem(historyKey);
        history = rawHistory ? JSON.parse(rawHistory) : [];
      } catch (error) {
        history = [];
      }

      const normalizedHistory = Array.isArray(history) ? history : [];
      const deduped = normalizedHistory.filter((item) => item?.orderId !== order.orderId);
      deduped.unshift(order);
      localStorage.setItem(historyKey, JSON.stringify(deduped));
      
      // Clear cart
      localStorage.removeItem('cart');
      localStorage.removeItem('iluxury_cart');

      // Redirect to confirmation page
      if (this.onNavigate) {
        this.onNavigate({ page: 'order-confirmation', id: order.orderId });
      } else {
        window.location.href = `./index.html?page=order-confirmation&id=${encodeURIComponent(order.orderId)}`;
      }
    } catch (error) {
      console.error('Order placement failed:', error);
      this.showNotification('Đặt hàng thất bại. Vui lòng thử lại.', 'error');
    } finally {
      document.getElementById('loading-overlay').style.display = 'none';
    }
  }

  showNotification(message, type = 'info') {
    if (this.onNotify) {
      this.onNotify(message, type);
      return;
    }
    alert(message);
  }
}

export function initCheckoutPage(options = {}) {
  return new CheckoutPage(options);
}

// Initialize checkout page in standalone mode
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new CheckoutPage();
  });
}
