export function renderHeader({ logoText, navLinks, actions }) {
    const navMarkup = navLinks
        .map((item) => `<a href="${item.href}">${item.label}</a>`)
        .join('');

    const mobileQuickActions = `
        <div class="mobile-menu-quick-actions">
            <a href="#" class="mobile-quick-link"><i data-lucide="search"></i> Tìm kiếm</a>
            <a href="./index.html?page=login" class="mobile-quick-link"><i data-lucide="user"></i> Đăng nhập</a>
            <a href="#" class="mobile-quick-link"><i data-lucide="shopping-bag"></i> Giỏ hàng (<span id="mobile-cart-count">0</span>)</a>
        </div>
    `;

    const actionsMarkup = actions
        .map(
            (item) => {
                const isCart = item.icon === 'shopping-bag';
                const isAccount = item.icon === 'user';
                const isSearch = item.icon === 'search';
                const dropdownAttr = isCart ? 'data-dropdown="cart"' : isAccount ? 'data-dropdown="account"' : '';
                const wrapperClass = isCart || isAccount ? 'header-action-dropdown' : '';
                const cartBadge = isCart ? '<span class="cart-count" id="cart-count">0</span>' : '';
                return wrapperClass
                    ? `<div class="${wrapperClass}" ${dropdownAttr}>
                        <button aria-label="${item.ariaLabel}" class="header-action-btn">
                            <i data-lucide="${item.icon}"></i>
                            ${cartBadge}
                        </button>
                        <div class="dropdown-content" id="${isCart ? 'cart-dropdown' : 'account-dropdown'}"></div>
                    </div>`
                    : isSearch
                        ? `<button type="button" aria-label="${item.ariaLabel}" class="header-action-btn search-trigger"><i data-lucide="${item.icon}"></i></button>`
                        : `<a href="${item.href}" aria-label="${item.ariaLabel}"><i data-lucide="${item.icon}"></i></a>`;
            }
        )
        .join('');

    return `
        <header>
            <div class="header-container">
                <a href="#" class="logo">${logoText}</a>
                <button class="mobile-menu-btn" aria-label="Mở menu điều hướng">
                    <i data-lucide="menu"></i>
                </button>
                <nav class="nav-links">
                    <div class="mobile-menu-head">
                        <span class="mobile-menu-logo">i<span>Luxury</span></span>
                        <button class="mobile-menu-close" aria-label="Đóng menu điều hướng"><i data-lucide="x"></i></button>
                    </div>
                    ${navMarkup}
                    ${mobileQuickActions}
                </nav>
                <div class="header-actions">
                    ${actionsMarkup}
                </div>
            </div>
        </header>
    `;
}
