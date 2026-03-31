# iLuxury Frontend (SPA)

Frontend e-commerce cho iLuxury (Apple Premium Reseller) viết bằng **HTML + CSS + Vanilla JS**, đã được chuyển sang mô hình **SPA query-routing** trên `index.html`.

## 1. Mục tiêu dự án

- UI/UX bán hàng Apple theo phong cách premium.
- Điều hướng mượt bằng SPA (không reload toàn trang cho các màn chính).
- Hỗ trợ flow mua hàng: cart -> checkout -> order confirmation -> order history/detail.
- Hỗ trợ auth client-side demo: login/register, profile, change password.
- Hỗ trợ mock API qua `json-server`.

## 2. Công nghệ chính

- HTML5, CSS3, JavaScript (ES Modules)
- `json-server` cho mock backend
- `localStorage` cho state phía client
- Lucide icons (CDN)

## 3. Cấu trúc thư mục

```text
front-end/
  css/
    style.css
  js/
    main.js
    components/
    data/
    pages/
    services/
  mock-api/
    db.json
    README.md
  index.html
  checkout.html
  order-confirmation.html
  order-history.html
  order-detail.html
  account-profile.html
  change-password.html
  login.html
  register.html
```

Luu y:

- `index.html` + `js/main.js` là shell SPA chính.
- Các file `.html` còn lại được dùng như fragment source cho router SPA và có redirect về `index.html?page=...`.

## 4. Cách chạy dự án

### 4.1. Cài dependencies

```bash
npm install
```

### 4.2. Chạy mock API (tuỳ chọn nhưng khuyến nghị)

```bash
npm run mock:api
```

Mock endpoint:

- `GET http://localhost:3000/siteData`

### 4.3. Chạy frontend

Dùng một static server bất kỳ (ví dụ VS Code Live Server) và mở:

- `http://localhost:<port>/index.html`

Khuyến nghị:

- Không mở trực tiếp bằng `file://` để tránh lỗi fetch/module.

## 5. Routing SPA

App dùng query param `page` cho các màn nghiệp vụ:

- `?page=checkout`
- `?page=order-confirmation&id=<orderId>`
- `?page=order-history`
- `?page=order-detail&id=<orderId>`
- `?page=account-profile`
- `?page=change-password`
- `?page=login`
- `?page=register`

Ngoài ra, homepage còn hỗ trợ:

- `?category=<slug>`
- `?product=<slug>`

## 6. Auth guard

Các page yêu cầu đăng nhập:

- `checkout`
- `order-confirmation`
- `order-history`
- `order-detail`
- `account-profile`
- `change-password`

Nếu chưa đăng nhập, user sẽ được chuyển tới `?page=login`.
Sau khi login/register thành công, app sẽ quay về route protected trước đó (nếu có).

## 7. LocalStorage keys

- `cart`: giỏ hàng hiện tại
- `iluxury_last_order`: đơn gần nhất
- `iluxury_order_history`: lịch sử đơn
- `iluxury_profile`: thông tin hồ sơ user
- `iluxury_auth`: trạng thái đăng nhập
- `iluxury_auth_pending_route`: route protected chờ quay lại sau login

## 8. Scripts NPM

Trong `package.json`:

- `npm run mock:api`: chạy json-server tại cổng `3000`

## 9. Lưu ý phát triển

- Dự án dùng SPA routing ở `js/main.js`, nên khi thêm màn mới cần:
  1. thêm page vào `SPA_PAGES`
  2. thêm config vào `spaViewConfig`
  3. tạo module init trong `js/pages/`
  4. (tuỳ chọn) thêm redirect file standalone tương ứng
- Giữ naming và route nhất quán theo chuẩn `kebab-case`.

## 10. Tài liệu liên quan

- Thiết kế UI/UX: `iluxury-uiux-design.md`
- SQL tổng hợp microservices: `dbdesign_full (1).sql`
- Mock data: `mock-api/db.json`

---

Neu can, co the tach README thanh:

- `README.frontend.md` (team frontend)
- `README.api-mock.md` (mock data & contract)
  để dễ bảo trì hơn khi dự án lớn lên.
