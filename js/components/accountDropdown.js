export function renderAccountDropdown(authState = {}) {
    const isAuthenticated = Boolean(authState?.isAuthenticated);
    const displayName = authState?.displayName || 'Khách hàng';

    if (!isAuthenticated) {
        return `
            <div class="dropdown-menu account-dropdown">
                <div class="dropdown-header">Xin chào!</div>
                <div class="dropdown-items">
                    <a href="./index.html?page=login" class="dropdown-item account-login">
                        <i data-lucide="log-in" style="width: 16px; height: 16px;"></i>
                        <span>Đăng Nhập</span>
                    </a>
                    <a href="./index.html?page=register" class="dropdown-item account-register">
                        <i data-lucide="user-plus" style="width: 16px; height: 16px;"></i>
                        <span>Đăng Ký</span>
                    </a>
                </div>
            </div>
        `;
    }

    return `
        <div class="dropdown-menu account-dropdown">
            <div class="dropdown-header">${displayName}</div>
            <div class="dropdown-items">
                <a href="./index.html?page=account-profile" class="dropdown-item account-info">
                    <i data-lucide="user" style="width: 16px; height: 16px;"></i>
                    <span>Thông Tin Tài Khoản</span>
                </a>
                <a href="./index.html?page=change-password" class="dropdown-item change-password">
                    <i data-lucide="lock" style="width: 16px; height: 16px;"></i>
                    <span>Đổi Mật Khẩu</span>
                </a>
                <a href="./index.html?page=order-history" class="dropdown-item order-history">
                    <i data-lucide="history" style="width: 16px; height: 16px;"></i>
                    <span>Lịch Sử Đặt Hàng</span>
                </a>
                <hr class="dropdown-divider">
                <a href="./index.html" class="dropdown-item logout" data-action="logout">
                    <i data-lucide="log-out" style="width: 16px; height: 16px;"></i>
                    <span>Đăng Xuất</span>
                </a>
            </div>
        </div>
    `;
}
