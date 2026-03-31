export function renderProductCard(product, options = {}) {
    const variant = options.variant || 'default';
    const originalPriceValue =
        product.originalPrice ??
        product.original_price ??
        product.oldPrice ??
        product.compareAtPrice ??
        product.giaGoc;

    const ratingValue = product.rating ?? '4.8';
    const reviewCount = product.reviewCount ?? '128';
    const hasDiscount = Boolean(originalPriceValue);
    const isOutOfStock = product.stock === 0 || product.outOfStock === true;
    const isFlashBadge = String(product.badge || '').toUpperCase().includes('FLASH');
    const isSaleBadge = String(product.badge || '').includes('-');
    const lowStockMarkup = Number.isFinite(product.stock) && product.stock > 0 && product.stock < 5
        ? `<p class="card-stock-indicator">Còn ${product.stock} sản phẩm</p>`
        : '';
    const badgeClass = isFlashBadge
        ? 'card-badge card-badge--flash'
        : isSaleBadge
            ? 'card-badge card-badge--sale'
            : 'card-badge';

    const badgeMarkup = product.badge
        ? `<span class="${badgeClass}"${product.badgeStyle ? ` style="${product.badgeStyle}"` : ''}>${product.badge}</span>`
        : '';

    const imageStyle = product.imageStyle ? ` style="${product.imageStyle}"` : '';
    const originalPriceMarkup = originalPriceValue
        ? `<span class="card-original-price"><span class="card-original-price-text">Giá gốc:</span> <span class="card-original-price-value">${originalPriceValue}</span></span>`
        : '';

    const savingsMarkup = originalPriceValue
        ? `<p class="card-savings">Tiết kiệm ${calcSavings(originalPriceValue, product.price)}</p>`
        : '';

    const ratingMarkup = `
        <div class="card-rating" aria-label="Đánh giá sản phẩm">
            <span class="card-stars">★</span>
            <span>${ratingValue}</span>
            <span class="card-rating-count">(${reviewCount} đánh giá)</span>
        </div>
    `;

    const outOfStockMarkup = isOutOfStock
        ? '<div class="card-out-of-stock-overlay"><span>Hết hàng</span></div>'
        : '';

    const compactActionMarkup = variant === 'compact'
        ? ''
        : `
            <div class="card-actions">
                <button class="btn btn-primary btn-sm card-add-btn" ${isOutOfStock ? 'disabled' : ''}>Thêm vào giỏ</button>
                <button class="card-wishlist-btn" aria-label="Yêu thích sản phẩm">♡</button>
            </div>
        `;

    const encodedTitle = escapeAttribute(product.title || 'Sản phẩm');
    const encodedPrice = escapeAttribute(product.price || '0₫');
    const encodedImage = escapeAttribute(product.image || '');
    const encodedOriginalPrice = escapeAttribute(originalPriceValue || '');

    return `
        <article class="product-card product-card--${variant}${isOutOfStock ? ' is-out-of-stock' : ''}" data-product-title="${encodedTitle}" data-product-price="${encodedPrice}" data-product-image="${encodedImage}" data-product-original-price="${encodedOriginalPrice}">
            ${badgeMarkup}
            <div class="card-image-wrapper">
                <img src="${product.image}" alt="${product.title}" class="card-image"${imageStyle} onerror="this.style.opacity='0'">
                ${outOfStockMarkup}
            </div>
            <h3 class="card-title">${product.title}</h3>
            ${ratingMarkup}
            <div class="card-price">${originalPriceMarkup}<span class="card-sale-price">${product.price}</span></div>
            ${savingsMarkup}
            ${lowStockMarkup}
            ${compactActionMarkup}
        </article>
    `;
}

function escapeAttribute(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

function calcSavings(originalPrice, salePrice) {
    const original = parseInt(String(originalPrice).replace(/[^\d]/g, ''), 10);
    const sale = parseInt(String(salePrice).replace(/[^\d]/g, ''), 10);

    if (Number.isNaN(original) || Number.isNaN(sale) || original <= sale) {
        return '0đ';
    }

    return `${new Intl.NumberFormat('vi-VN').format(original - sale)}đ`;
}
