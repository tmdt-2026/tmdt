export function renderCartDropdown(cartItems) {
    if (cartItems.length === 0) {
        return `
            <div class="dropdown-menu cart-dropdown">
                <div class="dropdown-empty">
                    <p>Giỏ hàng trống</p>
                </div>
            </div>
        `;
    }

    const cartItemsMarkup = cartItems
        .map(
            (item) => `
                <div class="cart-item">
                    <img src="${item.image}" alt="${item.title}" class="cart-item-image" onerror="this.style.opacity='0'">
                    <div class="cart-item-info">
                        <h4>${item.title}</h4>
                        <p class="cart-item-price">${item.price}${
                        item.originalPrice ? ` <span class="cart-original-price">${item.originalPrice}</span>` : ''
                    }</p>
                        <div class="cart-item-quantity">
                            <button class="qty-btn qty-decrease" data-item-id="${item.id}">-</button>
                            <span>${item.quantity}</span>
                            <button class="qty-btn qty-increase" data-item-id="${item.id}">+</button>
                        </div>
                    </div>
                    <button class="cart-item-remove" data-item-id="${item.id}" title="Xóa">×</button>
                </div>
            `
        )
        .join('');

    const totals = calcTotals(cartItems);

    return `
        <div class="dropdown-menu cart-dropdown">
            <div class="cart-items-container">
                ${cartItemsMarkup}
            </div>
            <div class="cart-summary">
                <div class="cart-summary-row">
                    <span>Tổng tiền gốc:</span>
                    <span>${totals.original}</span>
                </div>
                <div class="cart-summary-row">
                    <span>Tổng tiền sau giảm:</span>
                    <span class="cart-total-price">${totals.current}</span>
                </div>
                ${
                    totals.savings > 0
                        ? `<div class="cart-summary-row savings">
                        <span>Tiết kiệm:</span>
                        <span>${totals.savings}</span>
                    </div>`
                        : ''
                }
            </div>
            <button class="btn-checkout">Thanh Toán</button>
        </div>
    `;
}

function calcTotals(items) {
    let original = 0;
    let current = 0;

    items.forEach((item) => {
        const price = parseInt(item.price.replace(/[^\d]/g, ''));
        const origPrice = parseInt(
            item.originalPrice
                ? item.originalPrice.replace(/[^\d]/g, '')
                : item.price.replace(/[^\d]/g, '')
        );

        current += price * item.quantity;
        original += origPrice * item.quantity;
    });

    const savings = original - current;

    const formatter = new Intl.NumberFormat('vi-VN');
    return {
        original: formatter.format(original) + '₫',
        current: formatter.format(current) + '₫',
        savings: formatter.format(savings) + '₫'
    };
}
