# iLuxury — Tài Liệu Thiết Kế UI/UX (Customer)

> **Thương hiệu:** iLuxury — Apple Premium Reseller  
> **Phong cách:** Luxury Dark · iOS 26 Blur · Minimalist Premium  
> **Phiên bản:** 1.0

---

## Mục Lục

1. [Design System](#1-design-system)
2. [Layout & Grid System](#2-layout--grid-system)
3. [Shared Components](#3-shared-components)
4. [Trang & Cấu Trúc](#4-trang--cấu-trúc)
5. [Responsive Breakpoints](#5-responsive-breakpoints)
6. [Accessibility & SEO](#6-accessibility--seo)
7. [Animation & Motion](#7-animation--motion)

---

## 1. Design System

### 1.1 Color Palette

```css
:root {
  /* Core */
  --deep-black:    #050505;   /* Nền chính toàn trang */
  --pure-white:    #ffffff;   /* Text chính, icon active */
  --luxury-gold:   #fca311;   /* Accent — CTA, badge, highlight */

  /* Surfaces */
  --card-bg:       #111111;   /* Card, panel nền */
  --surface-02:    #161616;   /* Surface lớp 2 — hover, input bg */
  --surface-03:    #1c1c1e;   /* Surface lớp 3 — dropdown, modal */

  /* Borders */
  --border-color:  #222222;   /* Viền thường */
  --border-subtle: #1a1a1a;   /* Viền phân cách nhẹ (divider) */
  --border-gold:   rgba(252, 163, 17, 0.3); /* Viền accent mờ */

  /* Text */
  --text-primary:  #f5f5f7;   /* Tiêu đề, text chính */
  --text-secondary:#a0a0a0;   /* Mô tả, label phụ */
  --text-muted:    #555555;   /* Placeholder, text tắt */
  --text-gold:     #fca311;   /* Text accent */

  /* iOS 26 Blur Glass */
  --glass-bg:      rgba(255, 255, 255, 0.04);
  --glass-border:  rgba(255, 255, 255, 0.08);
  --glass-blur:    blur(24px) saturate(180%);

  /* Status */
  --success:       #30d158;
  --warning:       #ffd60a;
  --error:         #ff453a;
  --info:          #0a84ff;

  /* Overlay */
  --overlay-light: rgba(255, 255, 255, 0.05);
  --overlay-dark:  rgba(0, 0, 0, 0.6);

  /* Transition */
  --transition:    all 0.4s ease;
  --transition-fast: all 0.2s ease;
  --transition-spring: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}
```

### 1.2 Typography

```css
/* Font Stack */
--font-display:  'SF Pro Display', 'Helvetica Neue', sans-serif;
--font-text:     'SF Pro Text', 'Helvetica Neue', sans-serif;
--font-mono:     'SF Mono', 'Fira Code', monospace;

/* Scale */
--text-xs:    0.75rem;    /* 12px — caption, badge */
--text-sm:    0.875rem;   /* 14px — label, tag */
--text-base:  1rem;       /* 16px — body */
--text-lg:    1.125rem;   /* 18px — body large */
--text-xl:    1.25rem;    /* 20px — subtitle */
--text-2xl:   1.5rem;     /* 24px — section title nhỏ */
--text-3xl:   1.875rem;   /* 30px — section title */
--text-4xl:   2.25rem;    /* 36px — page title */
--text-5xl:   3rem;       /* 48px — hero title */
--text-6xl:   3.75rem;    /* 60px — hero large */
--text-7xl:   4.5rem;     /* 72px — hero xl */

/* Weight */
--font-regular:  400;
--font-medium:   500;
--font-semibold: 600;
--font-bold:     700;
--font-black:    900;

/* Line Height */
--leading-tight:  1.2;
--leading-snug:   1.375;
--leading-normal: 1.5;
--leading-relaxed: 1.625;
```

### 1.3 Spacing

```css
/* 8px base grid */
--space-1:   0.25rem;  /* 4px */
--space-2:   0.5rem;   /* 8px */
--space-3:   0.75rem;  /* 12px */
--space-4:   1rem;     /* 16px */
--space-5:   1.25rem;  /* 20px */
--space-6:   1.5rem;   /* 24px */
--space-8:   2rem;     /* 32px */
--space-10:  2.5rem;   /* 40px */
--space-12:  3rem;     /* 48px */
--space-16:  4rem;     /* 64px */
--space-20:  5rem;     /* 80px */
--space-24:  6rem;     /* 96px */
--space-32:  8rem;     /* 128px */
```

### 1.4 Border Radius

```css
--radius-sm:   0.375rem;  /* 6px — input, tag nhỏ */
--radius-md:   0.75rem;   /* 12px — card nhỏ, button */
--radius-lg:   1rem;      /* 16px — card chính */
--radius-xl:   1.5rem;    /* 24px — card lớn, modal */
--radius-2xl:  2rem;      /* 32px — hero section */
--radius-full: 9999px;    /* Pill — badge, avatar */
```

### 1.5 Shadow & Elevation

```css
--shadow-sm:   0 1px 2px rgba(0,0,0,0.5);
--shadow-md:   0 4px 16px rgba(0,0,0,0.4);
--shadow-lg:   0 8px 32px rgba(0,0,0,0.5);
--shadow-xl:   0 16px 48px rgba(0,0,0,0.6);
--shadow-gold: 0 0 24px rgba(252, 163, 17, 0.2);
--shadow-glow: 0 0 40px rgba(252, 163, 17, 0.12);
```

### 1.6 Z-Index Scale

```css
--z-base:     0;
--z-raised:   10;
--z-dropdown: 100;
--z-sticky:   200;
--z-modal:    300;
--z-toast:    400;
--z-tooltip:  500;
```

---

## 2. Layout & Grid System

### 2.1 Container

```css
/* Container có 3 cấp độ */
.container        { max-width: 1280px; margin: 0 auto; padding: 0 24px; }
.container-narrow { max-width: 960px;  margin: 0 auto; padding: 0 24px; }
.container-wide   { max-width: 1440px; margin: 0 auto; padding: 0 40px; }

/* Responsive padding */
@media (max-width: 768px) {
  .container, .container-narrow, .container-wide {
    padding: 0 16px;
  }
}
```

### 2.2 Grid

```css
/* Product Grid — tự adapt theo màn hình */
.product-grid {
  display: grid;
  gap: 20px;
  grid-template-columns: repeat(4, 1fr);   /* Desktop 1280px+ */
  /* 3 col tại 1024px, 2 col tại 640px, 1 col tại 480px */
}
```

### 2.3 Page Layout Pattern

```
┌─────────────────────────────────────────────────────────────┐
│  <Header />   fixed top, blur backdrop                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  <main>                                                     │
│    [Page-specific content]                                  │
│  </main>                                                    │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  <Footer />                                                 │
└─────────────────────────────────────────────────────────────┘
```

### 2.4 Section Spacing Pattern

```css
/* Mọi section đều dùng padding chuẩn */
.section        { padding: 80px 0; }
.section-sm     { padding: 48px 0; }
.section-lg     { padding: 120px 0; }

@media (max-width: 768px) {
  .section      { padding: 48px 0; }
  .section-lg   { padding: 64px 0; }
}
```

---

## 3. Shared Components

> Các component dùng lại ở nhiều trang — tách thành file riêng.

---

### 3.1 `<Header />`

**Vị trí:** Fixed top, `z-index: 200`  
**Hiệu ứng:** iOS 26 blur glass khi scroll xuống

**Cấu trúc:**
```
┌──────────────────────────────────────────────────────────────┐
│  [Logo: iLuxury]    [Nav: Mac iPhone iPad Watch Âm thanh     │
│                      Phụ kiện]          [Search] [User] [Cart]│
└──────────────────────────────────────────────────────────────┘
```

**Chi tiết:**
- **Logo:** Text "iLuxury" với "i" màu `--luxury-gold`, weight 700, font-size 22px. Click → `/`
- **Nav links:** Font-size 15px, color `--text-secondary`, hover → `--pure-white` với underline vàng dày 2px. Active page có màu `--pure-white`
- **Mega Dropdown:** Hover vào nav item → panel blur glass xuất hiện dưới navbar. Hiển thị sub-categories và featured product (ảnh + tên + giá). Animation: slide down 200ms + opacity
- **Search icon:** Click → overlay search toàn màn hình (xem `<SearchOverlay />`)
- **User icon:** Guest → dropdown "Đăng nhập / Đăng ký". Logged in → dropdown với "Tài khoản", "Đơn hàng", "Trả góp", "Đăng xuất"
- **Cart icon:** Hiển thị badge số lượng item (màu `--luxury-gold`). Click → sidebar cart trượt từ phải (xem `<CartSidebar />`)
- **Scroll behavior:** Khi scroll > 60px: `backdrop-filter: blur(24px) saturate(180%)`, `background: rgba(5,5,5,0.8)`, thêm bottom border `var(--border-color)`

**Responsive Mobile:**
- Nav links ẩn, thay bằng hamburger icon (3 dấu gạch)
- Click hamburger → `<MobileMenu />` full-screen slide từ trái

---

### 3.2 `<Footer />`

**Cấu trúc 4 cột:**
```
┌──────────────┬──────────────┬──────────────┬──────────────┐
│  Brand       │  Sản Phẩm    │  Hỗ Trợ      │  Nhận Tin    │
│  Logo        │  MacBook     │  Bảo hành    │  Email input │
│  Tagline     │  iPhone      │  Đổi trả     │  + Submit    │
│  Địa chỉ     │  iPad        │  Trả góp     │              │
│  Hotline     │  Watch       │  Tra đơn     │              │
│              │  Âm thanh    │  Liên hệ     │              │
└──────────────┴──────────────┴──────────────┴──────────────┘
│ © 2026 iLuxury. Đã đăng ký bản quyền.      [FB][Zalo][IG][YT] │
```

**Chi tiết:**
- **Email subscription:** Input với placeholder "Email của bạn...", button icon arrow màu `--luxury-gold`
- **Social icons:** Circular button 40x40, `--glass-bg` background, hover → `--luxury-gold`
- **Link hover:** Color transition sang `--luxury-gold`
- **Bottom bar:** Divider `--border-subtle`, font-size 13px, color `--text-muted`
- **Responsive:** 4 cột → 2 cột (tablet) → 1 cột stack (mobile)

---

### 3.3 `<ProductCard />`

**Variants:** `default` | `compact` | `featured`

**Cấu trúc (default):**
```
┌─────────────────────────────┐
│  [Badge: TOP 1 / SALE / NEW]│  ← absolute top-left, pill gold
│                             │
│       [Product Image]       │  ← aspect-ratio 1:1, object-fit contain
│       (hover: scale 1.05)   │
│                             │
├─────────────────────────────┤
│  Tên sản phẩm               │  ← 2 dòng max, font-weight 600
│  iPhone 16 Pro Max          │
│                             │
│  ⭐ 4.8  (128 đánh giá)     │  ← star vàng, text-sm gray
│                             │
│  ~~38.990.000đ~~            │  ← giá gốc gạch ngang, text-sm gray
│  29.990.000đ                │  ← giá bán, font-weight 700, gold
│                             │
│  [Thêm vào giỏ]  [♡]       │  ← button full-width + wishlist icon
└─────────────────────────────┘
```

**States:**
- **Default:** border `--border-color`, bg `--card-bg`
- **Hover:** border `--border-gold`, shadow `--shadow-gold`, image scale 1.05
- **Out of stock:** Overlay mờ 50%, badge "Hết hàng", button disabled
- **On sale:** Badge "SALE -15%" màu đỏ `#ff453a`
- **Flash sale:** Badge "⚡ FLASH" nhấp nháy nhẹ + countdown timer

---

### 3.4 `<Button />`

```
Variants:
  primary   → bg: --luxury-gold,  text: --deep-black,  font-weight: 700
  secondary → bg: transparent, border: --border-color, text: --text-primary
  ghost     → bg: transparent, text: --luxury-gold
  danger    → bg: --error, text: white
  glass     → bg: --glass-bg, backdrop-filter: blur, border: --glass-border

Sizes:
  sm  → height: 36px, padding: 0 16px, font-size: 14px, radius: --radius-md
  md  → height: 44px, padding: 0 24px, font-size: 15px, radius: --radius-md (default)
  lg  → height: 52px, padding: 0 32px, font-size: 16px, radius: --radius-lg
  xl  → height: 60px, padding: 0 40px, font-size: 18px, radius: --radius-xl

States:
  hover   → opacity 0.85, translateY(-1px), shadow-md
  active  → scale 0.97
  loading → spinner icon thay text, pointer-events: none
  disabled → opacity 0.4, cursor: not-allowed
```

---

### 3.5 `<SearchOverlay />`

**Trigger:** Click icon search trên header  
**Layout:** Full-screen overlay, `z-index: 300`, bg `rgba(5,5,5,0.95)`, blur

**Cấu trúc:**
```
┌──────────────────────────────────────────────────┐
│                              [✕ Đóng]             │
│                                                   │
│    🔍  [_________________________]                │
│         Tìm kiếm sản phẩm...                     │
│                                                   │
│    Tìm kiếm phổ biến:                            │
│    [iPhone 16] [MacBook M3] [AirPods Pro]...      │
│                                                   │
│    ─────────── Kết quả ─────────────             │
│    [ProductCard compact] x N                      │
│                                                   │
│    [Xem tất cả kết quả →]                        │
└──────────────────────────────────────────────────┘
```

**Behavior:**
- Typing debounce 300ms → gọi API search
- Kết quả hiển thị realtime dưới input
- Nhấn Enter → chuyển sang trang `/search?q=...`
- Click ngoài overlay → đóng lại

---

### 3.6 `<CartSidebar />`

**Trigger:** Click cart icon header  
**Layout:** Fixed sidebar bên phải, width 420px, `z-index: 300`  
**Animation:** Slide in từ phải 300ms, overlay backdrop bên trái

**Cấu trúc:**
```
┌──────────────────────────────┐
│  Giỏ Hàng (3)          [✕]  │
├──────────────────────────────┤
│  [Ảnh] Tên SP                │
│         Màu: Natural, 256GB  │
│         [−] 1 [+]   29.990k  │
│                         [🗑]  │
├──────────────────────────────┤
│  (lặp lại cho item tiếp theo)│
├──────────────────────────────┤
│  Tạm tính:      89.970.000đ  │
│  (Voucher chưa được áp dụng) │
│                              │
│  [Tiến hành thanh toán →]    │
│  [Tiếp tục mua sắm]          │
└──────────────────────────────┘
```

---

### 3.7 `<MobileMenu />`

**Trigger:** Hamburger icon, mobile only  
**Layout:** Full-screen overlay từ trái, `z-index: 300`

**Cấu trúc:**
```
[✕]  iLuxury
──────────────
MAC
IPHONE
IPAD
WATCH
ÂM THANH
PHỤ KIỆN
──────────────
🔍 Tìm kiếm
👤 Đăng nhập
🛒 Giỏ hàng (3)
```

---

### 3.8 `<Breadcrumb />`

**Dùng trên:** Trang danh mục, chi tiết sản phẩm, checkout, tài khoản

```
Trang chủ  /  iPhone  /  iPhone 16 Pro Max
```

- Font-size: 13px, color `--text-muted`
- Dấu phân cách: `/` màu `--border-color`
- Active (trang hiện tại): color `--text-secondary`, không có link
- Microdata: `schema.org/BreadcrumbList` để SEO

---

### 3.9 `<RatingStars />`

**Dùng trên:** ProductCard, ProductDetail, ReviewList

- 5 ngôi sao SVG, filled = `--luxury-gold`, empty = `--border-color`
- Half-star support
- Sizes: `sm` (12px) | `md` (16px) | `lg` (20px)
- Interactive mode (cho form đánh giá): hover highlight + click chọn

---

### 3.10 `<Badge />`

**Variants:**
```
gold    → bg: --luxury-gold,    text: --deep-black   (TOP 1, FLASH, HOT)
red     → bg: rgba(255,69,58,0.15), text: #ff453a   (SALE, Hết hàng)
green   → bg: rgba(48,209,88,0.15), text: #30d158   (Còn hàng, Mới)
glass   → bg: --glass-bg, backdrop-blur              (Overlay badge)
```

---

### 3.11 `<Toast />`

**Vị trí:** Fixed bottom-right, `z-index: 400`  
**Types:** `success` | `error` | `warning` | `info`  
**Auto-dismiss:** 3 giây  
**Animation:** Slide up + fade in, slide down khi dismiss

---

### 3.12 `<Modal />`

**Layout:** Centered overlay, max-width 560px (có thể override), `z-index: 300`  
**Backdrop:** `rgba(0,0,0,0.6)` blur 8px  
**Animation:** Scale từ 0.95 → 1 + opacity  
**Dùng cho:** Xác nhận huỷ đơn, đăng nhập nhanh, confirm address

---

### 3.13 `<Pagination />`

```
← Trước  [1] [2] [3] ... [10]  Tiếp →
```

- Active page: bg `--luxury-gold`, text `--deep-black`
- Hover: bg `--surface-02`
- Disabled: opacity 0.4

---

### 3.14 `<SectionHeader />`

**Dùng trên:** Mọi section có tiêu đề trên homepage và listing page

```
┌──────────────────────────────────────────────┐
│  Sản Phẩm Bán Chạy              [Xem tất cả →]│
│  ──────────────────────────────              │
└──────────────────────────────────────────────┘
```

- Tiêu đề: font-size `--text-3xl`, weight 700, color `--text-primary`
- Accent: underline vàng dày 3px dưới tiêu đề (đoạn đầu ~60px)
- Link "Xem tất cả": font-size 14px, color `--luxury-gold`

---

### 3.15 `<EmptyState />`

**Dùng cho:** Giỏ hàng trống, đơn hàng rỗng, kết quả tìm kiếm rỗng

```
        [Icon minh hoạ SVG]
        Tiêu đề thông báo
        Mô tả ngắn
        [CTA Button]
```

---

### 3.16 `<SkeletonLoader />`

**Dùng khi:** API đang load, thay thế ProductCard, content block  
**Style:** Shimmer animation gradient từ `--card-bg` → `--surface-02` → `--card-bg`

---

## 4. Trang & Cấu Trúc

---

### 4.1 Trang Chủ — `index.html` | `/`

**SEO:** `<title>iLuxury — Mua Apple Chính Hãng | iPhone iPad Mac AirPods Watch</title>`  
**Canonical:** `/`

**Cấu trúc sections (theo thứ tự):**

#### Section 1 — Hero Banner (Slider)
```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   [Full-width slide, height: 100vh]                        │
│                                                             │
│   ┌──────────────────────────────────────────┐            │
│   │                                          │            │
│   │   Sức Mạnh. Đẳng Cấp.                   │            │
│   │   Vượt Mọi Giới Hạn.                     │            │
│   │                                          │            │
│   │   Khám phá MacBook Pro M3 Max...         │            │
│   │                                          │            │
│   │   [Mua Ngay MacBook Pro]                 │            │
│   │                                          │            │
│   └──────────────────────────────────────────┘            │
│                                                             │
│   ○ ● ○ ○    (dot indicators)                             │
└─────────────────────────────────────────────────────────────┘
```
- Mỗi slide: full-viewport, ảnh product/hero, text overlay
- Gradient overlay từ trái: `linear-gradient(to right, rgba(5,5,5,0.85) 40%, transparent)`
- Text căn trái-giữa (vertically centered)
- Auto-play 5s, pause khi hover
- Swipe gesture trên mobile
- Mỗi slide có CTA riêng trỏ đến sản phẩm / danh mục
- **SEO:** Slider ảnh dùng `<img>` với `alt` mô tả, không dùng `background-image` cho ảnh chính

#### Section 2 — Category Icons
```
[MAC] [IPHONE] [IPAD] [WATCH] [ÂM THANH] [PHỤ KIỆN]
```
- 6 icon tròn 80x80, bg `--card-bg`, border `--border-color`
- Icon SVG bên trong, size 32px, màu `--text-secondary`
- Hover: border `--border-gold`, icon → `--luxury-gold`, shadow `--shadow-gold`
- Label: font-size 11px, tracking 0.1em, uppercase, font-weight 700
- Responsive: 3 cột x 2 hàng trên mobile

#### Section 3 — Sản Phẩm Bán Chạy
- `<SectionHeader />` với "Sản Phẩm Bán Chạy"
- Horizontal scroll trên tablet/mobile (snap scroll)
- Desktop: 3 ProductCard `featured` (TOP 1, TOP 2, TOP 3)
- Badge TOP N: tuyệt đối góc trái, pill màu vàng

#### Section 4 — Flash Sale (conditional, chỉ hiện khi có promotion active)
```
┌─────────────────────────────────────────────────────┐
│  ⚡ FLASH SALE   Kết thúc sau: 02 : 34 : 17        │
│  ─────────────────────────────────────────────────  │
│  [Card] [Card] [Card] [Card]  →                    │
└─────────────────────────────────────────────────────┘
```
- Countdown timer realtime (HH:MM:SS)
- Background: subtle gold gradient `rgba(252,163,17,0.05)`
- Horizontal scroll carousel

#### Section 5 — iPhone Mới Nhất
- `<SectionHeader />` + 4 ProductCard
- Filter tab: Tất cả | iPhone 16 | iPhone 15 | iPhone SE

#### Section 6 — MacBook / iPad / Watch / AirPods
- Lặp lại pattern: `<SectionHeader />` + grid 4 ProductCard
- Alternate layout: Chẵn (hình trái, text phải) / Lẻ (text trái, hình phải) dạng split-section

#### Section 7 — Banner Quảng Cáo
- 2 cột: banner lớn trái + 2 banner nhỏ stack bên phải
- Border radius `--radius-xl`, overflow hidden
- Hover: scale 1.02 nhẹ

#### Section 8 — Phụ Kiện Nổi Bật
- 6 ProductCard `compact` dạng grid 6 cột (desktop), 3 cột (tablet), 2 cột (mobile)

#### Section 9 — Tại Sao Chọn iLuxury
```
┌──────────┬──────────┬──────────┬──────────┐
│ 🏆        │ 🛡        │ 🚚        │ 🔧        │
│ Chính hãng│ Bảo hành │ Giao ngay │ 1-1 lỗi  │
│ 100%      │ 12 tháng  │ trong 4h  │ 30 ngày  │
└──────────┴──────────┴──────────┴──────────┘
```
- 4 item grid, icon + tiêu đề + mô tả ngắn
- bg: `--card-bg`, border `--border-subtle`, border-radius `--radius-lg`

#### Section 10 — Đánh Giá Khách Hàng
- Carousel 3 testimonial card
- Avatar (letter avatar nếu không có ảnh), tên, `<RatingStars />`, nội dung trích dẫn
- Quote mark lớn màu `--luxury-gold` decor

---

### 4.2 Trang Danh Mục — `/[category-slug]`

**Ví dụ:** `/iphone`, `/macbook`, `/ipad`  
**SEO:** `<title>[Tên danh mục] Chính Hãng Giá Tốt | iLuxury</title>`

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│  <Breadcrumb />                                             │
├──────────────┬──────────────────────────────────────────────┤
│              │                                              │
│  [Sidebar    │  [SectionHeader: iPhone | 42 sản phẩm]      │
│   Filter]    │                                              │
│              │  Sort: [Phổ biến ▾] [Giá tăng] [Mới nhất]   │
│  Danh mục    │  ─────────────────────────────────────────   │
│  con         │  [ProductCard] [ProductCard] [ProductCard]   │
│              │  [ProductCard] [ProductCard] [ProductCard]   │
│  Khoảng giá  │  [ProductCard] [ProductCard] [ProductCard]   │
│  slider      │  [ProductCard] [ProductCard] [ProductCard]   │
│              │                                              │
│  Màu sắc     │  <Pagination />                             │
│  checkboxes  │                                              │
│              │                                              │
│  Dung lượng  │                                              │
│  checkboxes  │                                              │
│              │                                              │
│  [Áp dụng]   │                                              │
│  [Xóa lọc]   │                                              │
└──────────────┴──────────────────────────────────────────────┘
```

**Sidebar Filter (desktop: 260px fixed | mobile: bottom sheet):**
- Bộ lọc: Danh mục con, Khoảng giá (range slider), Màu sắc (swatches), Dung lượng (chips), Đánh giá
- Sticky khi scroll
- Mobile: bottom drawer kéo lên, trigger "Lọc & Sắp xếp" button

**Sort bar:**
- Select dropdown hoặc tab-style buttons
- Options: Phổ biến nhất | Mới nhất | Giá: Thấp → Cao | Giá: Cao → Thấp | Đánh giá cao nhất

---

### 4.3 Trang Chi Tiết Sản Phẩm — `/products/[slug]`

**SEO:** `<title>[Tên SP] [Variant] — Giá [X]đ | iLuxury</title>`  
**Schema:** `Product`, `AggregateRating`, `Offer`

**Layout:**
```
<Breadcrumb />

┌──────────────────────────┬─────────────────────────────────┐
│                          │                                 │
│  [Image Gallery]         │  Tên sản phẩm đầy đủ           │
│                          │  ⭐⭐⭐⭐⭐ 4.8 (128 đánh giá)    │
│  [Main Image - lg]       │                                 │
│                          │  ~~38.990.000đ~~                │
│  [Thumb] [Thumb] [Thumb] │  29.990.000đ                   │
│                          │  ✓ Tiết kiệm 9.000.000đ        │
│                          │                                 │
│                          │  Màu sắc:                       │
│                          │  ● ● ● ○  (color swatches)     │
│                          │                                 │
│                          │  Dung lượng:                    │
│                          │  [128GB] [256GB✓] [512GB] [1TB]│
│                          │                                 │
│                          │  Số lượng: [−] 1 [+]           │
│                          │                                 │
│                          │  [🛒 Thêm vào giỏ]  ← primary  │
│                          │  [⚡ Mua ngay]       ← gold     │
│                          │  [💳 Trả góp từ 2.5tr/tháng]   │
│                          │                                 │
│                          │  ✓ Bảo hành 12 tháng           │
│                          │  ✓ Đổi trả 30 ngày lỗi 1-1     │
│                          │  ✓ Giao hàng trong 4 giờ (HCM) │
└──────────────────────────┴─────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  [Tab: Thông Số] [Tab: Mô Tả] [Tab: Đánh Giá (128)]       │
│  ─────────────────────────────────────────────────────────  │
│  [Tab content]                                              │
└─────────────────────────────────────────────────────────────┘

[Sản Phẩm Liên Quan — 4 ProductCard]
[Khách Hàng Đã Xem — 4 ProductCard]
```

**Image Gallery:**
- Main image: `aspect-ratio: 1`, rounded corners `--radius-xl`
- Thumbnails: horizontal scroll dưới main image
- Click thumbnail → main image đổi với fade transition
- Click main image → lightbox full-screen với zoom

**Variant Selector:**
- Color swatches: 32x32 tròn với border khi selected (3px `--luxury-gold`)
- Storage chips: pill button, selected = bg `--luxury-gold`, text `--deep-black`
- Khi chọn variant → URL update (`?color=natural&storage=256`) để SEO & share

**Tab section:**
- "Thông số kỹ thuật": bảng 2 cột key-value, zebra striping `--surface-02`
- "Mô tả chi tiết": rich text HTML từ CMS
- "Đánh giá": summary (điểm trung bình + bar chart theo sao) + danh sách review

---

### 4.4 Trang Tìm Kiếm — `/search?q=`

**SEO:** `<title>Kết quả tìm kiếm "[q]" | iLuxury</title>` (noindex nếu q rỗng)

**Layout:** Tương tự trang danh mục (sidebar filter + product grid) nhưng:
- Thêm header: `Kết quả cho "[từ khoá]" — 24 sản phẩm`
- Nếu 0 kết quả: `<EmptyState />` với gợi ý từ khoá thay thế + sản phẩm phổ biến

---

### 4.5 Trang Giỏ Hàng — `/cart`

**Layout:**
```
┌──────────────────────────────┬──────────────────────────────┐
│  Giỏ Hàng (3 sản phẩm)       │  Tóm Tắt Đơn Hàng           │
│  ────────────────────────    │  ──────────────────────────  │
│  [Ảnh] Tên SP              │  Tạm tính:    89.970.000đ    │
│         Màu: Natural, 256GB  │  Phí giao hàng:   Miễn phí   │
│         [−] 1 [+]  29.990k   │  ────────────────────────   │
│                         [🗑]  │  Tổng cộng:   89.970.000đ   │
│  ────────────────────────    │                              │
│  (item 2...)                 │  [Nhập mã voucher]  [Áp dụng]│
│  ────────────────────────    │                              │
│  (item 3...)                 │  [Tiến hành thanh toán →]   │
│                              │                              │
│  [← Tiếp tục mua sắm]        │  Hoặc mua trả góp:          │
│                              │  [💳 Trả góp 0% lãi suất]   │
└──────────────────────────────┴──────────────────────────────┘

[Có thể bạn cũng thích — 4 ProductCard]
```

- Thay đổi quantity → realtime update tổng tiền
- Xoá item → animation slide out
- Voucher: input + nút áp dụng, hiển thị discount inline
- Sticky summary box khi scroll

---

### 4.6 Trang Checkout — `/checkout`

**Layout:** Single-column, không có header/footer phức tạp (focus mode)  
**Stepper:** `1. Địa chỉ → 2. Thanh toán → 3. Xác nhận`

```
Bước 1: Thông Tin Giao Hàng
┌──────────────────────────────┬──────────────────────────────┐
│  [Họ tên]  [Số điện thoại]   │                              │
│  [Tỉnh/TP ▾] [Quận/Huyện ▾]  │  Tóm Tắt Đơn               │
│  [Phường/Xã ▾]               │  (sticky sidebar)            │
│  [Số nhà, tên đường]         │                              │
│  [Ghi chú...]                │  [iPhone 16] x1  29.990k    │
│                              │  [MacBook]  x1  39.990k    │
│  Địa chỉ đã lưu:             │                              │
│  ○ 123 Nguyễn Huệ (Nhà)      │  Tạm tính: 69.980.000đ     │
│  ○ 456 Lê Lợi (Văn phòng)    │  Voucher:  -5.000.000đ     │
│                              │  Tổng:     64.980.000đ     │
│  [→ Tiếp tục]                │                              │
└──────────────────────────────┴──────────────────────────────┘

Bước 2: Phương Thức Thanh Toán
  ○ 💵 COD — Thanh toán khi nhận hàng
  ○ 🏦 VNPay — Chuyển khoản / QR code
  ○ 📱 MoMo — Ví điện tử MoMo
  ○ 💳 Trả góp 0% — Nộp hồ sơ online

Bước 3: Xác Nhận
  [Tóm tắt toàn bộ thông tin]
  [✓ Đặt Hàng]
```

**Validation:**
- Realtime validate input khi blur
- Error message màu `--error` bên dưới input
- Required fields: outline đỏ khi submit rỗng

---

### 4.7 Trang Xác Nhận Đơn Hàng — `/orders/confirmation/[id]`

```
┌─────────────────────────────────────────────────────────────┐
│  ✅                                                          │
│  Đặt Hàng Thành Công!                                       │
│  Mã đơn: #iLUX-2026-00342                                   │
│                                                             │
│  Chúng tôi sẽ liên hệ xác nhận trong vòng 30 phút.        │
│                                                             │
│  Chi tiết đơn hàng...                                       │
│                                                             │
│  [Xem Đơn Hàng]    [Tiếp Tục Mua Sắm]                    │
└─────────────────────────────────────────────────────────────┘
```

---

### 4.8 Trang Đăng Nhập & Đăng Ký — `/login`, `/register`

**Layout:** Centered card, max-width 480px, trên nền tối blur

**Đăng nhập:**
```
         iLuxury
  ──────────────────────
  Email
  [________________________]

  Mật khẩu
  [________________________] [👁]

  [Quên mật khẩu?]

  [Đăng Nhập]

  ──── hoặc ────

  [G] Tiếp tục với Google

  Chưa có tài khoản? [Đăng ký]
```

**Đăng ký:**
```
  Họ và tên     Số điện thoại
  Email
  Mật khẩu      Nhập lại mật khẩu

  [✓] Tôi đồng ý Điều khoản & Chính sách

  [Tạo Tài Khoản]

  Đã có tài khoản? [Đăng nhập]
```

---

### 4.9 Trang Tài Khoản — `/account`

**Layout:** Sidebar navigation + main content area

**Sidebar:**
```
  [Avatar + Tên user]
  ──────────────────
  👤 Hồ sơ của tôi
  📦 Đơn hàng
  💳 Trả góp
  📍 Địa chỉ
  🔔 Thông báo
  🔒 Bảo mật
  ─────────────────
  ↩ Đăng xuất
```

**4.9.1 Hồ sơ (`/account/profile`):**
- Form chỉnh sửa: avatar upload, tên, SĐT, ngày sinh, giới tính
- Nút "Lưu thay đổi"

**4.9.2 Đơn hàng (`/account/orders`):**
```
Lọc: [Tất cả] [Đang xử lý] [Đang giao] [Hoàn thành] [Đã huỷ]

┌─────────────────────────────────────────────────────────────┐
│  #iLUX-2026-00342              28/03/2026   [Đang giao hàng]│
│  iPhone 16 Pro Max 256GB                                     │
│  Tổng: 29.990.000đ                                          │
│                          [Chi tiết]  [Mua lại]  [Đánh giá] │
└─────────────────────────────────────────────────────────────┘
```

**Chi tiết đơn (`/account/orders/[id]`):**
- Stepper trạng thái: ⏳Đặt hàng → ✅Xác nhận → 📦Đang giao → ✅Hoàn thành
- Thông tin giao hàng, sản phẩm, thanh toán

**4.9.3 Trả góp (`/account/installments`):**
```
┌─────────────────────────────────────────────────────────────┐
│  Hồ sơ #IG-0042         iPhone 16 Pro Max    [Đang hoạt động]│
│  Gói 12 tháng · Còn 8 kỳ                                    │
│  Kỳ tiếp theo: 15/04/2026 — 2.500.000đ                      │
│                                          [Xem lịch trả góp] │
└─────────────────────────────────────────────────────────────┘
```

Lịch trả góp: Bảng timeline với kỳ đã thanh toán (✅), kỳ hiện tại (🔵), kỳ tương lai

**4.9.4 Thông báo (`/account/notifications`):**
- Danh sách notification, unread badge
- Click → đánh dấu đọc + navigate đến link liên quan
- Nút "Đánh dấu tất cả đã đọc"

---

### 4.10 Trang Đăng Ký Trả Góp — `/installment/apply`

**Layout:** Stepper 3 bước trên nền tối

**Bước 1 — Chọn gói:**
```
  Gói 3 tháng    Gói 6 tháng    Gói 12 tháng
  2.499.000đ/th  1.299.000đ/th  649.000đ/th
  Lãi suất 0%    Lãi suất 0%   Lãi suất 0%
  [Chọn]         [Chọn]         [Chọn ✓]
```

**Bước 2 — Thông tin cá nhân:**
```
  Họ tên     CCCD/CMND
  Số điện thoại   Thu nhập hàng tháng
  
  Upload ảnh CCCD:
  [+ Mặt trước]  [+ Mặt sau]  [+ Ảnh chân dung]
  (dashed border upload zone, drag & drop support)
```

**Bước 3 — Xác nhận:**
- Tóm tắt thông tin + gói đã chọn
- Disclaimer chính sách
- [✓ Nộp hồ sơ]

---

### 4.11 Trang Chính Sách — `/policy/[type]`

**Ví dụ:** `/policy/bao-hanh`, `/policy/doi-tra`, `/policy/bao-mat`

**Layout:** Single column, max-width 800px, centered

```
  <Breadcrumb />

  # Chính Sách Bảo Hành

  [Rich text content từ CMS — render HTML]

  ─────────────────────────────────
  Bài viết liên quan:
  [Chính sách đổi trả]  [Hướng dẫn trả góp]
```

---

### 4.12 Trang 404

```
     404
  Trang không tìm thấy

  Trang bạn đang tìm không tồn tại
  hoặc đã được di chuyển.

  [← Về Trang Chủ]  [Xem Sản Phẩm]
```

---

## 5. Responsive Breakpoints

```css
/* Mobile first approach */
--bp-xs:  480px;   /* Mobile nhỏ (iPhone SE, Galaxy A) */
--bp-sm:  640px;   /* Mobile lớn (iPhone Plus) */
--bp-md:  768px;   /* Tablet nhỏ (iPad mini) */
--bp-lg:  1024px;  /* Tablet lớn / Laptop nhỏ */
--bp-xl:  1280px;  /* Desktop */
--bp-2xl: 1536px;  /* Desktop lớn / 2K */
```

### Behavior theo breakpoint:

| Component | Mobile (<768px) | Tablet (768-1024px) | Desktop (>1024px) |
|-----------|----------------|---------------------|-------------------|
| Header nav | Ẩn → hamburger | Ẩn → hamburger | Hiển thị đầy đủ |
| Hero | Height 100svh, text nhỏ | 90vh | 100vh |
| Product grid | 2 cột | 3 cột | 4 cột |
| Category icons | 3x2 grid | 6 ngang | 6 ngang |
| Product detail | Stack dọc | Stack dọc | 2 cột ngang |
| Cart | Full page | Full page | 2 cột |
| Checkout | Single column | Single column | 2 cột |
| Footer | 1 cột stack | 2 cột | 4 cột |
| Sidebar filter | Bottom sheet | Bottom sheet | Sidebar cố định |

---

## 6. Accessibility & SEO

### 6.1 Accessibility (WCAG 2.1 AA)

- **Contrast ratio:** Text trên background `--deep-black` đạt tối thiểu 4.5:1
  - `--text-primary (#f5f5f7)` trên `--deep-black`: ✅ 18:1
  - `--text-secondary (#a0a0a0)` trên `--card-bg`: ✅ 5.2:1
  - `--luxury-gold (#fca311)` trên `--deep-black`: ✅ 8.9:1
- **Focus visible:** Tất cả interactive element có `:focus-visible` outline rõ ràng (2px `--luxury-gold`)
- **Alt text:** Tất cả `<img>` có `alt` mô tả. Product images: `alt="[Tên SP] [Màu] [Dung lượng]"`
- **Aria labels:** Cart button `aria-label="Giỏ hàng, 3 sản phẩm"`, icon buttons có label
- **Semantic HTML:** `<header>`, `<main>`, `<nav>`, `<footer>`, `<article>`, `<section>` đúng ngữ nghĩa
- **Keyboard nav:** Tab order logic, modal trap focus, Escape đóng overlay
- **Reduced motion:** `@media (prefers-reduced-motion: reduce)` tắt animation

### 6.2 SEO Technical

- **Meta tags đầy đủ mỗi trang:** `title`, `description` (150-160 ký tự), `canonical`, `og:*`, `twitter:*`
- **Structured Data (JSON-LD):**
  - Homepage: `Organization`, `WebSite` (với SearchAction)
  - Product page: `Product` (name, image, description, sku, offers, aggregateRating)
  - Category page: `BreadcrumbList`
- **Open Graph:** `og:title`, `og:description`, `og:image` (1200x630px), `og:url`, `og:type`
- **robots.txt:** Cho phép crawl tất cả, disallow `/account/`, `/checkout/`, `/admin/`
- **sitemap.xml:** Auto-generate từ products, categories, policy pages
- **Core Web Vitals:**
  - LCP: Preload hero image, critical CSS inline
  - CLS: Định sẵn dimensions cho images (`width`/`height` attribute)
  - FID/INP: Lazy load non-critical JS, code splitting theo route

### 6.3 Performance

- **Images:** WebP format, `srcset` cho responsive images, lazy load (`loading="lazy"`) cho ảnh below-fold
- **Fonts:** Self-host SF Pro hoặc fallback Helvetica Neue; `font-display: swap`
- **Critical CSS:** Inline CSS cho above-fold content
- **Preconnect:** `<link rel="preconnect">` cho CDN, API domain
- **Caching:** Static assets với cache-busting hash, API responses cached phù hợp

---

## 7. Animation & Motion

### 7.1 Nguyên Tắc

- **Purposeful:** Animation chỉ tồn tại khi phục vụ UX (không animate cho có)
- **Subtle:** Tránh quá mức — người dùng đến mua hàng, không để xem animation
- **Consistent:** Dùng easing/duration chuẩn dưới đây

### 7.2 Duration & Easing

```css
--duration-instant:  100ms;  /* Micro-interaction: toggle, checkbox */
--duration-fast:     200ms;  /* Hover state, dropdown */
--duration-normal:   300ms;  /* Modal open/close, toast, sidebar */
--duration-slow:     500ms;  /* Page transition, hero */
--duration-slower:   800ms;  /* Scroll reveal, stagger */

--ease-default:    cubic-bezier(0.4, 0, 0.2, 1);   /* Smooth chung */
--ease-in:         cubic-bezier(0.4, 0, 1, 1);      /* Exit */
--ease-out:        cubic-bezier(0, 0, 0.2, 1);      /* Enter */
--ease-spring:     cubic-bezier(0.34, 1.56, 0.64, 1); /* Bounce nhẹ — button, modal */
```

### 7.3 Patterns Cụ Thể

| Element | Animation |
|---------|-----------|
| Page load | Fade in (0→1) + translateY(16px→0), 400ms, stagger children 50ms |
| ProductCard hover | translateY(-4px) + shadow 300ms `--ease-out` |
| Button press | scale(0.97) 100ms |
| Modal open | scale(0.95→1) + opacity, 300ms `--ease-spring` |
| Cart sidebar open | translateX(100%→0) 300ms `--ease-out` |
| Toast | translateY(16px→0) + opacity 250ms, auto-dismiss slide down |
| Dropdown | opacity + scaleY(0.95→1) origin-top 200ms |
| Hero slider | Cross-fade 800ms |
| Scroll reveal | Intersection Observer: opacity 0→1 + translateY(24→0) 500ms |
| Skeleton | shimmer gradient loop 1.5s |
| Search overlay | opacity 0→1 + backdrop blur 300ms |

### 7.4 iOS 26 Glass Effect

```css
/* Áp dụng cho: Header khi scroll, Dropdown, Sidebar, Modal backdrop */
.glass {
  background: var(--glass-bg);            /* rgba(255,255,255,0.04) */
  backdrop-filter: var(--glass-blur);     /* blur(24px) saturate(180%) */
  -webkit-backdrop-filter: var(--glass-blur);
  border: 1px solid var(--glass-border); /* rgba(255,255,255,0.08) */
}

/* ⚠️ KHÔNG lạm dụng — chỉ dùng cho overlay/floating elements */
/* Tránh nest glass-in-glass (hiệu suất kém) */
```

---

## 8. Ràng Buộc Bổ Sung

### 8.1 Nguyên Tắc Màu

- **Gradient bị hạn chế nghiêm ngặt.** Chỉ dùng gradient trong:
  - Hero image overlay (text readability)
  - Flash sale section background (rất mờ)
  - Không dùng gradient trên button, card, text
- **Gold (`--luxury-gold`) là màu accent duy nhất.** Không thêm màu accent khác
- **Tuyệt đối không:** Purple, blue gradient, neon, quá nhiều màu cùng lúc

### 8.2 Nguyên Tắc Layout

- Section padding đồng nhất theo `--space-*` scale
- Không dùng text center cho đoạn văn dài (>2 dòng) — chỉ dùng cho hero, empty states
- Line-length tối đa: 75 ký tự cho body text (`max-width: 65ch`)

### 8.3 Nguyên Tắc Component

- Mọi trạng thái interactive (hover, focus, active, disabled, loading) phải được thiết kế
- Không để trạng thái loading trắng trơn — luôn dùng `<SkeletonLoader />`
- Form validation: realtime sau blur, không chỉ khi submit
- Confirmation dialog bắt buộc cho action destructive (xoá, huỷ đơn)

### 8.4 Trust & Conversion

- Price formatting: `29.990.000đ` (không phải 29990000 hay 29,990,000)
- Luôn hiển thị "Tiết kiệm X đ" khi có giá gốc
- Stock indicator: `Còn X sản phẩm` khi số lượng < 5 (tạo urgency)
- Shipping estimate: Hiện ước tính ngay trên trang product
- Security badges: 🔒 SSL, bảo mật thanh toán trên trang checkout

---

*Tài liệu thiết kế UI/UX — iLuxury Apple Shop · Customer Interface · v1.0*  
*Cập nhật: 03/2026*
