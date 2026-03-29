-- ============================================================
-- APPLE SHOP DATABASE - MICROSERVICES ARCHITECTURE (FULL)
-- ============================================================
-- Kiến trúc: Microservices — mỗi service có DB độc lập
-- Stack: NestJS, Prisma, MySQL, RabbitMQ
--
-- Danh sách databases:
--   1.  db_users          → User Service
--   2.  db_products       → Product Service
--   3.  db_inventory      → Inventory Service  ← MỚI
--   4.  db_orders         → Order Service
--   5.  db_payments       → Payment Service
--   6.  db_installments   → Installment Service ← MỚI
--   7.  db_promos         → Promotion Service
--   8.  db_carts          → Cart Service        ← MỚI
--   9.  db_notifications  → Notification Service ← MỚI
--   10. db_reviews        → Review Service
--   11. db_config         → Config Service
--
-- ⚠️  FK CROSS-SERVICE: Tất cả FK trỏ sang DB khác đều bị XOÁ BỎ.
--     Tính toàn vẹn dữ liệu được đảm bảo ở tầng APPLICATION
--     thông qua RabbitMQ events + validation logic trong mỗi service.
-- ============================================================


-- ============================================================
-- DATABASE 1: db_users
-- Service: User Service
-- Quản lý: USERS, ROLES, USER_ROLES, USER_DETAILS, USER_ADDRESSES
-- Thay đổi: Tách address thành bảng USER_ADDRESSES hỗ trợ nhiều địa chỉ
-- ============================================================

CREATE DATABASE IF NOT EXISTS `db_users`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `db_users`;

-- ------------------------------------------------------------
-- ROLES
-- ------------------------------------------------------------
CREATE TABLE `ROLES` (
  `id`         CHAR(36)     PRIMARY KEY DEFAULT (UUID()),
  `name`       VARCHAR(255) NOT NULL COMMENT 'VD: admin, staff, customer',
  `created_at` DATETIME     DEFAULT (NOW())
);

-- ------------------------------------------------------------
-- USERS
-- ------------------------------------------------------------
CREATE TABLE `USERS` (
  `id`            CHAR(36)     PRIMARY KEY DEFAULT (UUID()),
  `user_name`     VARCHAR(255) NOT NULL,
  `hash_password` VARCHAR(255) NOT NULL,
  `email`         VARCHAR(255) UNIQUE NOT NULL,
  `phone_number`  VARCHAR(20)  UNIQUE,
  `is_active`     BOOLEAN      DEFAULT TRUE COMMENT 'Khoá/mở tài khoản',
  `created_at`    DATETIME     DEFAULT (NOW()),
  `updated_at`    DATETIME     DEFAULT (NOW())
);

-- ------------------------------------------------------------
-- USER_ROLES (junction)
-- ------------------------------------------------------------
CREATE TABLE `USER_ROLES` (
  `user_id` CHAR(36) NOT NULL,
  `role_id` CHAR(36) NOT NULL,
  PRIMARY KEY (`user_id`, `role_id`),
  FOREIGN KEY (`user_id`) REFERENCES `USERS`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`role_id`) REFERENCES `ROLES`(`id`) ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- USER_DETAILS
-- ------------------------------------------------------------
CREATE TABLE `USER_DETAILS` (
  `id`           CHAR(36)     PRIMARY KEY DEFAULT (UUID()),
  `user_id`      CHAR(36)     UNIQUE NOT NULL,
  `full_name`    VARCHAR(255),
  `avatar_url`   VARCHAR(500),
  `date_of_birth` DATE,
  `gender`       ENUM('male', 'female', 'other'),
  `created_at`   DATETIME     DEFAULT (NOW()),
  `updated_at`   DATETIME     DEFAULT (NOW()),
  FOREIGN KEY (`user_id`) REFERENCES `USERS`(`id`) ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- USER_ADDRESSES
-- Hỗ trợ address book: nhiều địa chỉ / 1 user
-- Khi đặt hàng, khách có thể chọn địa chỉ này HOẶC nhập mới
-- Order Service snapshot địa chỉ riêng → không phụ thuộc bảng này
-- ------------------------------------------------------------
CREATE TABLE `USER_ADDRESSES` (
  `id`           CHAR(36)     PRIMARY KEY DEFAULT (UUID()),
  `user_id`      CHAR(36)     NOT NULL,
  `label`        VARCHAR(100) COMMENT 'Tên gợi nhớ: Nhà, Công ty...',
  `full_name`    VARCHAR(255) NOT NULL COMMENT 'Tên người nhận tại địa chỉ này',
  `phone_number` VARCHAR(20)  NOT NULL COMMENT 'SĐT người nhận',
  `province`     VARCHAR(255) NOT NULL,
  `district`     VARCHAR(255) NOT NULL,
  `ward`         VARCHAR(255) NOT NULL,
  `street`       VARCHAR(500) NOT NULL COMMENT 'Số nhà, tên đường',
  `is_default`   BOOLEAN      DEFAULT FALSE,
  `created_at`   DATETIME     DEFAULT (NOW()),
  `updated_at`   DATETIME     DEFAULT (NOW()),
  FOREIGN KEY (`user_id`) REFERENCES `USERS`(`id`) ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- FCM_TOKENS
-- Lưu Firebase Cloud Messaging token theo thiết bị
-- ------------------------------------------------------------
CREATE TABLE `FCM_TOKENS` (
  `id`         CHAR(36)     PRIMARY KEY DEFAULT (UUID()),
  `user_id`    CHAR(36)     NOT NULL    COMMENT '[REF: db_users.USERS.id]',
  `token`      VARCHAR(500) NOT NULL,
  `device_type` ENUM('android', 'ios', 'web') NOT NULL,
  `created_at` DATETIME     DEFAULT (NOW()),
  `updated_at` DATETIME     DEFAULT (NOW()),
  FOREIGN KEY (`user_id`) REFERENCES `USERS`(`id`) ON DELETE CASCADE
);

-- Indexes
CREATE UNIQUE INDEX `uq_fcm_token` ON `FCM_TOKENS` (`token`);
CREATE INDEX `idx_users_email`      ON `USERS` (`email`);
CREATE INDEX `idx_users_active`     ON `USERS` (`is_active`);
CREATE INDEX `idx_addresses_user`   ON `USER_ADDRESSES` (`user_id`, `is_default`);


-- ============================================================
-- DATABASE 2: db_products
-- Service: Product Service
-- Quản lý: CATEGORIES, MODEL, PRODUCTS, PRODUCT_VARIANTS,
--          PRODUCT_IMAGES, PROMOTION_PRODUCTS, PRICE_HISTORIES
-- Thay đổi:
--   + PRODUCT_IMAGES: hỗ trợ nhiều ảnh / sản phẩm
--   + PRODUCT_PROMOTIONS: scope promotion tới từng sản phẩm
--   - stock_quantity: chuyển sang db_inventory
-- ============================================================

CREATE DATABASE IF NOT EXISTS `db_products`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `db_products`;

-- ------------------------------------------------------------
-- CATEGORIES (hỗ trợ danh mục lồng nhau qua parent_id)
-- ------------------------------------------------------------
CREATE TABLE `CATEGORIES` (
  `id`          CHAR(36)     PRIMARY KEY DEFAULT (UUID()),
  `name`        VARCHAR(255) NOT NULL COMMENT 'VD: iPhone, iPad, Mac, AirPods, Watch, Phụ kiện',
  `slug`        VARCHAR(255) UNIQUE NOT NULL,
  `parent_id`   CHAR(36)     DEFAULT NULL COMMENT 'NULL = danh mục gốc',
  `sort_order`  INT          DEFAULT 0,
  `is_active`   BOOLEAN      DEFAULT TRUE,
  `created_at`  DATETIME     DEFAULT (NOW()),
  FOREIGN KEY (`parent_id`) REFERENCES `CATEGORIES`(`id`)
);

-- ------------------------------------------------------------
-- MODEL
-- Thông số kỹ thuật chung của một dòng sản phẩm
-- ------------------------------------------------------------
CREATE TABLE `MODEL` (
  `id`           CHAR(36)     PRIMARY KEY DEFAULT (UUID()),
  `model_name`   VARCHAR(255) NOT NULL COMMENT 'VD: iPhone 16 Pro Max',
  `model_number` VARCHAR(255),
  `brand`        VARCHAR(255) NOT NULL DEFAULT 'Apple',
  `cpu`          VARCHAR(255),
  `screen_size`  DECIMAL(5,2),
  `opera_system` VARCHAR(255),
  `is_active`    BOOLEAN      DEFAULT TRUE,
  `deleted_at`   DATETIME     DEFAULT NULL,
  `created_at`   DATETIME     DEFAULT (NOW())
);

-- ------------------------------------------------------------
-- PRODUCTS
-- ------------------------------------------------------------
CREATE TABLE `PRODUCTS` (
  `id`          CHAR(36)     PRIMARY KEY DEFAULT (UUID()),
  `name`        VARCHAR(255) NOT NULL,
  `model_id`    CHAR(36),
  `category_id` CHAR(36)     NOT NULL,
  `thumbnail`   VARCHAR(500) COMMENT 'Ảnh đại diện chính',
  `description` TEXT,
  `is_active`   BOOLEAN      DEFAULT TRUE,
  `deleted_at`  DATETIME     DEFAULT NULL,
  `created_at`  DATETIME     DEFAULT (NOW()),
  `updated_at`  DATETIME     DEFAULT (NOW()),
  FOREIGN KEY (`model_id`)    REFERENCES `MODEL`(`id`),
  FOREIGN KEY (`category_id`) REFERENCES `CATEGORIES`(`id`)
);

-- ------------------------------------------------------------
-- PRODUCT_IMAGES
-- Nhiều ảnh / 1 sản phẩm (gallery)
-- ------------------------------------------------------------
CREATE TABLE `PRODUCT_IMAGES` (
  `id`         CHAR(36)     PRIMARY KEY DEFAULT (UUID()),
  `product_id` CHAR(36)     NOT NULL,
  `image_url`  VARCHAR(500) NOT NULL,
  `alt_text`   VARCHAR(255),
  `sort_order` INT          DEFAULT 0,
  `created_at` DATETIME     DEFAULT (NOW()),
  FOREIGN KEY (`product_id`) REFERENCES `PRODUCTS`(`id`) ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- PRODUCT_VARIANTS
-- Mỗi variant = 1 SKU cụ thể (màu + dung lượng)
-- stock_quantity đã CHUYỂN sang db_inventory.INVENTORY
-- ------------------------------------------------------------
CREATE TABLE `PRODUCT_VARIANTS` (
  `id`             CHAR(36)      PRIMARY KEY DEFAULT (UUID()),
  `product_id`     CHAR(36)      NOT NULL,
  `sku`            VARCHAR(100)  UNIQUE NOT NULL COMMENT 'Mã SKU duy nhất',
  `color`          VARCHAR(100),
  `ram`            INT           COMMENT 'GB',
  `storage`        INT           COMMENT 'GB: 64, 128, 256, 512, 1024',
  `import_price`   DECIMAL(18,2) NOT NULL COMMENT 'Giá vốn',
  `original_price` DECIMAL(18,2)           COMMENT 'Giá niêm yết (gạch ngang)',
  `price`          DECIMAL(18,2) NOT NULL  COMMENT 'Giá bán thực tế',
  `is_active`      BOOLEAN       DEFAULT TRUE,
  `deleted_at`     DATETIME      DEFAULT NULL,
  `created_at`     DATETIME      DEFAULT (NOW()),
  FOREIGN KEY (`product_id`) REFERENCES `PRODUCTS`(`id`)
);

-- ------------------------------------------------------------
-- PRICE_HISTORIES
-- Audit trail thay đổi giá
-- ⚠️  changed_by: [REF: db_users.USERS.id] — không có FK vật lý
-- ------------------------------------------------------------
CREATE TABLE `PRICE_HISTORIES` (
  `id`                  CHAR(36)      PRIMARY KEY DEFAULT (UUID()),
  `product_variant_id`  CHAR(36)      NOT NULL,
  `changed_by`          CHAR(36)      NOT NULL COMMENT '[REF: db_users.USERS.id]',
  `old_import_price`    DECIMAL(18,2),
  `new_import_price`    DECIMAL(18,2),
  `old_original_price`  DECIMAL(18,2),
  `new_original_price`  DECIMAL(18,2),
  `old_price`           DECIMAL(18,2),
  `new_price`           DECIMAL(18,2),
  `reason`              VARCHAR(500),
  `changed_at`          DATETIME      DEFAULT (NOW()),
  FOREIGN KEY (`product_variant_id`) REFERENCES `PRODUCT_VARIANTS`(`id`)
);

-- Indexes
CREATE INDEX `idx_products_category`  ON `PRODUCTS`          (`category_id`);
CREATE INDEX `idx_products_active`    ON `PRODUCTS`          (`is_active`, `deleted_at`);
CREATE INDEX `idx_variants_product`   ON `PRODUCT_VARIANTS`  (`product_id`);
CREATE INDEX `idx_price_history`      ON `PRICE_HISTORIES`   (`product_variant_id`, `changed_at`);
CREATE INDEX `idx_product_images`     ON `PRODUCT_IMAGES`    (`product_id`, `sort_order`);


-- ============================================================
-- DATABASE 3: db_inventory  ← MỚI
-- Service: Inventory Service
-- Quản lý: INVENTORY, INVENTORY_TRANSACTIONS
-- Tách riêng khỏi Product Service để có thể scale độc lập
-- ============================================================

CREATE DATABASE IF NOT EXISTS `db_inventory`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `db_inventory`;

-- ------------------------------------------------------------
-- INVENTORY
-- Tồn kho hiện tại theo từng variant
-- ⚠️  variant_id: [REF: db_products.PRODUCT_VARIANTS.id]
-- ------------------------------------------------------------
CREATE TABLE `INVENTORY` (
  `id`                 CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  `product_variant_id` CHAR(36) UNIQUE NOT NULL COMMENT '[REF: db_products.PRODUCT_VARIANTS.id]',
  `quantity`           INT      NOT NULL DEFAULT 0 COMMENT 'Số lượng tồn kho hiện tại',
  `reserved_quantity`  INT      NOT NULL DEFAULT 0 COMMENT 'Đã đặt hàng nhưng chưa xác nhận',
  `updated_at`         DATETIME DEFAULT (NOW())
);

-- ------------------------------------------------------------
-- INVENTORY_TRANSACTIONS
-- Lịch sử nhập/xuất kho
-- ⚠️  reference_id: có thể là order_id, import_id tuỳ type
-- ⚠️  created_by: [REF: db_users.USERS.id]
-- ------------------------------------------------------------
CREATE TABLE `INVENTORY_TRANSACTIONS` (
  `id`                 CHAR(36)     PRIMARY KEY DEFAULT (UUID()),
  `product_variant_id` CHAR(36)     NOT NULL    COMMENT '[REF: db_products.PRODUCT_VARIANTS.id]',
  `type`               ENUM('import', 'export_sale', 'export_return', 'adjustment') NOT NULL,
  `quantity_change`    INT          NOT NULL COMMENT 'Dương = nhập, Âm = xuất',
  `quantity_before`    INT          NOT NULL,
  `quantity_after`     INT          NOT NULL,
  `reference_id`       CHAR(36)     COMMENT 'order_id hoặc import_bill_id tuỳ type',
  `note`               VARCHAR(500),
  `created_by`         CHAR(36)     NOT NULL COMMENT '[REF: db_users.USERS.id]',
  `created_at`         DATETIME     DEFAULT (NOW())
);

-- Indexes
CREATE INDEX `idx_inv_variant`    ON `INVENTORY`              (`product_variant_id`);
CREATE INDEX `idx_inv_txn_variant` ON `INVENTORY_TRANSACTIONS` (`product_variant_id`, `created_at`);
CREATE INDEX `idx_inv_txn_type`   ON `INVENTORY_TRANSACTIONS` (`type`);


-- ============================================================
-- DATABASE 4: db_orders
-- Service: Order Service
-- Quản lý: ORDERS, ORDER_DETAILS
-- Thay đổi: Thêm payment_method, installment_id snapshot
-- ============================================================

CREATE DATABASE IF NOT EXISTS `db_orders`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `db_orders`;

-- ------------------------------------------------------------
-- ORDERS
-- ⚠️  Cross-service refs (lưu ID, không có FK vật lý):
--   user_id      → db_users.USERS
--   promotion_id → db_promos.PROMOTIONS
-- ------------------------------------------------------------
CREATE TABLE `ORDERS` (
  `id`                   CHAR(36)     PRIMARY KEY DEFAULT (UUID()),
  `user_id`              CHAR(36)     NOT NULL    COMMENT '[REF: db_users.USERS.id]',
  `promotion_id`         CHAR(36)     DEFAULT NULL COMMENT '[REF: db_promos.PROMOTIONS.id]',
  `payment_type`         ENUM('full', 'installment') NOT NULL DEFAULT 'full',
  `payment_method`       ENUM('cod', 'vnpay', 'momo', 'bank_transfer') COMMENT 'NULL nếu là installment',
  `subtotal_price`       DECIMAL(18,2) NOT NULL,
  `discount_amount`      DECIMAL(18,2) DEFAULT 0,
  `total_price`          DECIMAL(18,2) NOT NULL  COMMENT 'Tiền thực tế khách trả (hoặc tổng trả góp)',
  `total_product`        INT,
  `status`               ENUM('pending', 'processing', 'shipped', 'completed', 'cancelled') DEFAULT 'pending',
  -- Snapshot địa chỉ giao hàng tại thời điểm đặt
  `shipping_name`        VARCHAR(255) NOT NULL,
  `shipping_phone`       VARCHAR(20)  NOT NULL,
  `shipping_province`    VARCHAR(255) NOT NULL,
  `shipping_district`    VARCHAR(255) NOT NULL,
  `shipping_ward`        VARCHAR(255) NOT NULL,
  `shipping_street`      VARCHAR(500) NOT NULL,
  `note`                 VARCHAR(500),
  `created_at`           DATETIME     DEFAULT (NOW()),
  `updated_at`           DATETIME     DEFAULT (NOW())
);

-- ------------------------------------------------------------
-- ORDER_DETAILS
-- ⚠️  product_variant_id → db_products.PRODUCT_VARIANTS
--     Snapshot tên + giá tại thời điểm đặt
-- ------------------------------------------------------------
CREATE TABLE `ORDER_DETAILS` (
  `id`                   CHAR(36)      PRIMARY KEY DEFAULT (UUID()),
  `order_id`             CHAR(36)      NOT NULL,
  `product_variant_id`   CHAR(36)      NOT NULL COMMENT '[REF: db_products.PRODUCT_VARIANTS.id]',
  -- Snapshot để không bị ảnh hưởng khi Product Service thay đổi giá sau này
  `product_name`         VARCHAR(255)  NOT NULL COMMENT 'Snapshot tên sản phẩm',
  `variant_label`        VARCHAR(255)  COMMENT 'Snapshot: VD "256GB / Titan Tự Nhiên"',
  `quantity`             INT           NOT NULL,
  `import_price`         DECIMAL(18,2) NOT NULL COMMENT 'Snapshot giá vốn lúc bán',
  `price`                DECIMAL(18,2) NOT NULL COMMENT 'Snapshot giá bán lúc bán',
  `item_discount`        DECIMAL(18,2) DEFAULT 0 COMMENT 'Giảm trực tiếp trên item (flash sale)',
  FOREIGN KEY (`order_id`) REFERENCES `ORDERS`(`id`) ON DELETE CASCADE
);

-- Indexes
CREATE UNIQUE INDEX `uq_order_details`   ON `ORDER_DETAILS` (`order_id`, `product_variant_id`);
CREATE INDEX `idx_orders_user`           ON `ORDERS`        (`user_id`);
CREATE INDEX `idx_orders_status`         ON `ORDERS`        (`status`);
CREATE INDEX `idx_orders_payment_type`   ON `ORDERS`        (`payment_type`);


-- ============================================================
-- DATABASE 5: db_payments
-- Service: Payment Service
-- ============================================================

CREATE DATABASE IF NOT EXISTS `db_payments`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `db_payments`;

-- ------------------------------------------------------------
-- PAYMENTS
-- ⚠️  order_id → db_orders.ORDERS — validate qua Order Service
-- ------------------------------------------------------------
CREATE TABLE `PAYMENTS` (
  `id`                CHAR(36)     PRIMARY KEY DEFAULT (UUID()),
  `order_id`          CHAR(36)     NOT NULL COMMENT '[REF: db_orders.ORDERS.id]',
  `amount`            DECIMAL(18,2) NOT NULL,
  `payment_method`    ENUM('cod', 'vnpay', 'momo', 'bank_transfer') NOT NULL,
  `status`            ENUM('pending', 'success', 'failed', 'refunded') DEFAULT 'pending',
  `transaction_code`  VARCHAR(255)  COMMENT 'Mã GD từ cổng thanh toán',
  `provider_response` TEXT          COMMENT 'Raw JSON từ VNPay/MoMo để debug',
  `paid_at`           DATETIME      DEFAULT NULL COMMENT 'Thời điểm thanh toán thành công',
  `created_at`        DATETIME      DEFAULT (NOW()),
  `updated_at`        DATETIME      DEFAULT (NOW())
);

-- Indexes
CREATE INDEX `idx_payments_order`  ON `PAYMENTS` (`order_id`);
CREATE INDEX `idx_payments_status` ON `PAYMENTS` (`status`);


-- ============================================================
-- DATABASE 6: db_installments  ← MỚI
-- Service: Installment Service
-- Quản lý: INSTALLMENT_PLANS, INSTALLMENT_APPLICATIONS,
--          INSTALLMENT_SCHEDULES, INSTALLMENT_PAYMENTS
-- ============================================================

CREATE DATABASE IF NOT EXISTS `db_installments`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `db_installments`;

-- ------------------------------------------------------------
-- INSTALLMENT_PLANS
-- Các gói trả góp admin cấu hình (3 tháng, 6 tháng, 12 tháng,...)
-- ------------------------------------------------------------
CREATE TABLE `INSTALLMENT_PLANS` (
  `id`               CHAR(36)      PRIMARY KEY DEFAULT (UUID()),
  `name`             VARCHAR(255)  NOT NULL COMMENT 'VD: Trả góp 12 tháng 0%',
  `duration_months`  INT           NOT NULL COMMENT 'Số kỳ thanh toán (tháng)',
  `interest_rate`    DECIMAL(5,2)  NOT NULL DEFAULT 0.00 COMMENT '% lãi suất / tháng. 0 = 0%',
  `min_order_value`  DECIMAL(18,2) DEFAULT 0 COMMENT 'Giá trị đơn tối thiểu để áp dụng',
  `down_payment_pct` DECIMAL(5,2)  DEFAULT 0 COMMENT '% đặt cọc/trả trước',
  `is_active`        BOOLEAN       DEFAULT TRUE,
  `created_at`       DATETIME      DEFAULT (NOW()),
  `updated_at`       DATETIME      DEFAULT (NOW())
);

-- ------------------------------------------------------------
-- INSTALLMENT_APPLICATIONS
-- Hồ sơ vay trả góp của từng đơn hàng
-- ⚠️  Cross-service refs:
--   user_id  → db_users.USERS
--   order_id → db_orders.ORDERS
-- ------------------------------------------------------------
CREATE TABLE `INSTALLMENT_APPLICATIONS` (
  `id`                    CHAR(36)      PRIMARY KEY DEFAULT (UUID()),
  `user_id`               CHAR(36)      NOT NULL COMMENT '[REF: db_users.USERS.id]',
  `order_id`              CHAR(36)      UNIQUE NOT NULL COMMENT '[REF: db_orders.ORDERS.id] — 1 đơn chỉ 1 hồ sơ',
  `plan_id`               CHAR(36)      NOT NULL,
  -- Thông tin hồ sơ cá nhân (snapshot tại thời điểm nộp)
  `applicant_name`        VARCHAR(255)  NOT NULL,
  `applicant_phone`       VARCHAR(20)   NOT NULL,
  `applicant_id_number`   VARCHAR(50)   NOT NULL COMMENT 'Số CCCD/CMND',
  `applicant_id_image_front` VARCHAR(500) COMMENT 'Ảnh CCCD mặt trước',
  `applicant_id_image_back`  VARCHAR(500) COMMENT 'Ảnh CCCD mặt sau',
  `applicant_selfie`      VARCHAR(500)  COMMENT 'Ảnh chân dung',
  `monthly_income`        DECIMAL(18,2) COMMENT 'Thu nhập khai báo',
  -- Tài chính
  `total_amount`          DECIMAL(18,2) NOT NULL COMMENT 'Tổng giá trị đơn hàng',
  `down_payment`          DECIMAL(18,2) NOT NULL DEFAULT 0 COMMENT 'Tiền trả trước',
  `loan_amount`           DECIMAL(18,2) NOT NULL COMMENT 'Số tiền vay = total - down_payment',
  `monthly_payment`       DECIMAL(18,2) NOT NULL COMMENT 'Số tiền mỗi kỳ (đã tính lãi)',
  -- Duyệt hồ sơ
  `status`                ENUM('pending', 'reviewing', 'approved', 'rejected', 'active', 'completed', 'defaulted') DEFAULT 'pending',
  `reviewed_by`           CHAR(36)      COMMENT '[REF: db_users.USERS.id] — admin duyệt',
  `reviewed_at`           DATETIME,
  `reject_reason`         VARCHAR(500),
  `approved_at`           DATETIME,
  `note`                  TEXT          COMMENT 'Ghi chú nội bộ của admin',
  `created_at`            DATETIME      DEFAULT (NOW()),
  `updated_at`            DATETIME      DEFAULT (NOW()),
  FOREIGN KEY (`plan_id`) REFERENCES `INSTALLMENT_PLANS`(`id`)
);

-- ------------------------------------------------------------
-- INSTALLMENT_SCHEDULES
-- Lịch trả nợ theo từng kỳ — tự động sinh khi hồ sơ được duyệt
-- ------------------------------------------------------------
CREATE TABLE `INSTALLMENT_SCHEDULES` (
  `id`              CHAR(36)      PRIMARY KEY DEFAULT (UUID()),
  `application_id`  CHAR(36)      NOT NULL,
  `term_number`     INT           NOT NULL COMMENT 'Kỳ thứ mấy (1, 2, 3...)',
  `due_date`        DATE          NOT NULL COMMENT 'Ngày đến hạn thanh toán kỳ này',
  `amount_due`      DECIMAL(18,2) NOT NULL COMMENT 'Số tiền phải trả kỳ này',
  `amount_paid`     DECIMAL(18,2) DEFAULT 0,
  `status`          ENUM('pending', 'paid', 'overdue', 'partially_paid') DEFAULT 'pending',
  `paid_at`         DATETIME      DEFAULT NULL,
  `late_fee`        DECIMAL(18,2) DEFAULT 0 COMMENT 'Phí phạt trễ hạn nếu có',
  `created_at`      DATETIME      DEFAULT (NOW()),
  `updated_at`      DATETIME      DEFAULT (NOW()),
  FOREIGN KEY (`application_id`) REFERENCES `INSTALLMENT_APPLICATIONS`(`id`)
);

-- ------------------------------------------------------------
-- INSTALLMENT_PAYMENTS
-- Ghi nhận từng lần thanh toán kỳ góp
-- ⚠️  collected_by: [REF: db_users.USERS.id] — nhân viên thu tiền (nếu có)
-- ------------------------------------------------------------
CREATE TABLE `INSTALLMENT_PAYMENTS` (
  `id`              CHAR(36)      PRIMARY KEY DEFAULT (UUID()),
  `schedule_id`     CHAR(36)      NOT NULL,
  `application_id`  CHAR(36)      NOT NULL,
  `amount`          DECIMAL(18,2) NOT NULL COMMENT 'Số tiền thực tế thanh toán lần này',
  `payment_method`  ENUM('cash', 'bank_transfer', 'vnpay', 'momo') NOT NULL,
  `transaction_ref` VARCHAR(255)  COMMENT 'Mã giao dịch ngân hàng/cổng TT',
  `collected_by`    CHAR(36)      COMMENT '[REF: db_users.USERS.id]',
  `note`            VARCHAR(500),
  `created_at`      DATETIME      DEFAULT (NOW()),
  FOREIGN KEY (`schedule_id`)    REFERENCES `INSTALLMENT_SCHEDULES`(`id`),
  FOREIGN KEY (`application_id`) REFERENCES `INSTALLMENT_APPLICATIONS`(`id`)
);

-- Indexes
CREATE UNIQUE INDEX `uq_schedule_term`   ON `INSTALLMENT_SCHEDULES`  (`application_id`, `term_number`);
CREATE INDEX `idx_app_user`              ON `INSTALLMENT_APPLICATIONS` (`user_id`);
CREATE INDEX `idx_app_order`             ON `INSTALLMENT_APPLICATIONS` (`order_id`);
CREATE INDEX `idx_app_status`            ON `INSTALLMENT_APPLICATIONS` (`status`);
CREATE INDEX `idx_schedule_due`          ON `INSTALLMENT_SCHEDULES`   (`due_date`, `status`);
CREATE INDEX `idx_instpay_app`           ON `INSTALLMENT_PAYMENTS`    (`application_id`);


-- ============================================================
-- DATABASE 7: db_promos
-- Service: Promotion Service
-- Quản lý: PROMOTIONS, PROMOTION_SCOPES, PROMOTION_USAGES
-- Thay đổi:
--   + PROMOTION_SCOPES: xác định phạm vi áp dụng
--   + type 'product_discount': flash sale / giảm theo item
-- ============================================================

CREATE DATABASE IF NOT EXISTS `db_promos`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `db_promos`;

-- ------------------------------------------------------------
-- PROMOTIONS
-- Bao gồm cả 2 loại:
--   1. voucher      : khách nhập mã, giảm theo đơn hàng
--   2. product_sale : flash sale, giảm trực tiếp vào giá item
-- ------------------------------------------------------------
CREATE TABLE `PROMOTIONS` (
  `id`                  CHAR(36)     PRIMARY KEY DEFAULT (UUID()),
  `type`                ENUM('voucher', 'product_sale') NOT NULL
                        COMMENT 'voucher=nhập mã giảm đơn, product_sale=flash sale giảm sản phẩm',
  `code`                VARCHAR(100) UNIQUE COMMENT 'Mã voucher (chỉ dùng với type=voucher)',
  `name`                VARCHAR(255) NOT NULL,
  `description`         TEXT,
  `discount_type`       ENUM('percentage', 'fixed_amount') NOT NULL,
  `discount_value`      DECIMAL(18,2) NOT NULL COMMENT 'Mức giảm (% hoặc tiền)',
  `max_discount_amount` DECIMAL(18,2) COMMENT 'Giảm tối đa (dùng khi discount_type=percentage)',
  `min_order_value`     DECIMAL(18,2) DEFAULT 0 COMMENT 'Đơn tối thiểu (chỉ áp dụng với voucher)',
  `scope`               ENUM('all_products', 'specific_products') NOT NULL DEFAULT 'all_products',
  `start_date`          DATETIME     NOT NULL,
  `end_date`            DATETIME     NOT NULL,
  `usage_limit`         INT          COMMENT 'Tổng lượt dùng tối đa (NULL = không giới hạn)',
  `usage_limit_per_user` INT         DEFAULT 1 COMMENT 'Mỗi user dùng tối đa bao nhiêu lần',
  `is_active`           BOOLEAN      DEFAULT TRUE,
  `created_at`          DATETIME     DEFAULT (NOW()),
  `updated_at`          DATETIME     DEFAULT (NOW())
);

-- ------------------------------------------------------------
-- PROMOTION_SCOPES
-- Khi scope = 'specific_products': gắn promotion với variant nào
-- ⚠️  product_variant_id → db_products.PRODUCT_VARIANTS
-- ------------------------------------------------------------
CREATE TABLE `PROMOTION_SCOPES` (
  `id`                  CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  `promotion_id`        CHAR(36) NOT NULL,
  `product_variant_id`  CHAR(36) NOT NULL COMMENT '[REF: db_products.PRODUCT_VARIANTS.id]',
  FOREIGN KEY (`promotion_id`) REFERENCES `PROMOTIONS`(`id`) ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- PROMOTION_USAGES
-- Track lượt dùng voucher — tránh race condition
-- ⚠️  user_id  → db_users.USERS
-- ⚠️  order_id → db_orders.ORDERS
-- ------------------------------------------------------------
CREATE TABLE `PROMOTION_USAGES` (
  `id`           CHAR(36)  PRIMARY KEY DEFAULT (UUID()),
  `promotion_id` CHAR(36)  NOT NULL,
  `user_id`      CHAR(36)  NOT NULL COMMENT '[REF: db_users.USERS.id]',
  `order_id`     CHAR(36)  NOT NULL COMMENT '[REF: db_orders.ORDERS.id]',
  `used_at`      DATETIME  DEFAULT (NOW()),
  FOREIGN KEY (`promotion_id`) REFERENCES `PROMOTIONS`(`id`)
);

-- Indexes
CREATE UNIQUE INDEX `uq_promo_scope`     ON `PROMOTION_SCOPES` (`promotion_id`, `product_variant_id`);
CREATE UNIQUE INDEX `uq_promotion_usage` ON `PROMOTION_USAGES`  (`promotion_id`, `order_id`);
CREATE INDEX `idx_promo_usage_user`      ON `PROMOTION_USAGES`  (`user_id`);
CREATE INDEX `idx_promo_dates`           ON `PROMOTIONS`        (`start_date`, `end_date`, `is_active`);
CREATE INDEX `idx_promo_type`            ON `PROMOTIONS`        (`type`, `is_active`);


-- ============================================================
-- DATABASE 8: db_carts  ← MỚI
-- Service: Cart Service
-- Quản lý: CARTS, CART_ITEMS
-- Note: Guest cart dùng Redis (không lưu DB)
--       User cart lưu DB để persistent across devices
-- ============================================================

CREATE DATABASE IF NOT EXISTS `db_carts`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `db_carts`;

-- ------------------------------------------------------------
-- CARTS
-- ⚠️  user_id → db_users.USERS
-- ------------------------------------------------------------
CREATE TABLE `CARTS` (
  `id`         CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  `user_id`    CHAR(36) UNIQUE NOT NULL COMMENT '[REF: db_users.USERS.id] — 1 user 1 cart',
  `created_at` DATETIME DEFAULT (NOW()),
  `updated_at` DATETIME DEFAULT (NOW())
);

-- ------------------------------------------------------------
-- CART_ITEMS
-- ⚠️  product_variant_id → db_products.PRODUCT_VARIANTS
-- ------------------------------------------------------------
CREATE TABLE `CART_ITEMS` (
  `id`                 CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  `cart_id`            CHAR(36) NOT NULL,
  `product_variant_id` CHAR(36) NOT NULL COMMENT '[REF: db_products.PRODUCT_VARIANTS.id]',
  `quantity`           INT      NOT NULL DEFAULT 1,
  `added_at`           DATETIME DEFAULT (NOW()),
  `updated_at`         DATETIME DEFAULT (NOW()),
  FOREIGN KEY (`cart_id`) REFERENCES `CARTS`(`id`) ON DELETE CASCADE
);

-- Indexes
CREATE UNIQUE INDEX `uq_cart_variant` ON `CART_ITEMS` (`cart_id`, `product_variant_id`);
CREATE INDEX `idx_cart_user`          ON `CARTS`      (`user_id`);


-- ============================================================
-- DATABASE 9: db_notifications  ← MỚI
-- Service: Notification Service
-- Quản lý: NOTIFICATION_TEMPLATES, NOTIFICATIONS
-- ============================================================

CREATE DATABASE IF NOT EXISTS `db_notifications`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `db_notifications`;

-- ------------------------------------------------------------
-- NOTIFICATION_TEMPLATES
-- Mẫu nội dung thông báo, admin có thể chỉnh trong trang admin
-- ------------------------------------------------------------
CREATE TABLE `NOTIFICATION_TEMPLATES` (
  `id`         CHAR(36)     PRIMARY KEY DEFAULT (UUID()),
  `type`       VARCHAR(100) UNIQUE NOT NULL
               COMMENT 'VD: order_pending, order_shipped, installment_reminder, promo_flash_sale',
  `title`      VARCHAR(255) NOT NULL COMMENT 'Tiêu đề thông báo (có thể dùng placeholder)',
  `body`       TEXT         NOT NULL COMMENT 'Nội dung (placeholder: {{order_id}}, {{amount}}...)',
  `updated_at` DATETIME     DEFAULT (NOW())
);

-- ------------------------------------------------------------
-- NOTIFICATIONS
-- Lịch sử thông báo đã gửi tới từng user
-- ⚠️  user_id       → db_users.USERS
-- ⚠️  reference_id  → có thể là order_id, application_id, promotion_id tuỳ type
-- ------------------------------------------------------------
CREATE TABLE `NOTIFICATIONS` (
  `id`             CHAR(36)     PRIMARY KEY DEFAULT (UUID()),
  `user_id`        CHAR(36)     NOT NULL COMMENT '[REF: db_users.USERS.id]',
  `template_type`  VARCHAR(100) NOT NULL COMMENT '[REF: NOTIFICATION_TEMPLATES.type]',
  `title`          VARCHAR(255) NOT NULL COMMENT 'Nội dung đã render (sau khi thay placeholder)',
  `body`           TEXT         NOT NULL,
  `reference_type` VARCHAR(50)  COMMENT 'order | installment | promotion',
  `reference_id`   CHAR(36)     COMMENT 'ID của đối tượng liên quan',
  `channel`        ENUM('push', 'email', 'sms') DEFAULT 'push',
  `is_read`        BOOLEAN      DEFAULT FALSE,
  `sent_at`        DATETIME     DEFAULT (NOW()),
  `read_at`        DATETIME     DEFAULT NULL
);

-- Indexes
CREATE INDEX `idx_notif_user`      ON `NOTIFICATIONS` (`user_id`, `is_read`);
CREATE INDEX `idx_notif_reference` ON `NOTIFICATIONS` (`reference_type`, `reference_id`);
CREATE INDEX `idx_notif_sent`      ON `NOTIFICATIONS` (`sent_at`);


-- ============================================================
-- DATABASE 10: db_reviews
-- Service: Review Service
-- Quản lý: REVIEWS, COMMENTS
-- ============================================================

CREATE DATABASE IF NOT EXISTS `db_reviews`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `db_reviews`;

-- ------------------------------------------------------------
-- REVIEWS
-- ⚠️  user_id    → db_users.USERS
-- ⚠️  product_id → db_products.PRODUCTS
-- ⚠️  order_id   → db_orders.ORDERS (chỉ review khi order completed)
-- ------------------------------------------------------------
CREATE TABLE `REVIEWS` (
  `id`         CHAR(36)  PRIMARY KEY DEFAULT (UUID()),
  `user_id`    CHAR(36)  NOT NULL COMMENT '[REF: db_users.USERS.id]',
  `product_id` CHAR(36)  NOT NULL COMMENT '[REF: db_products.PRODUCTS.id]',
  `order_id`   CHAR(36)  NOT NULL COMMENT '[REF: db_orders.ORDERS.id]',
  `rating`     TINYINT   NOT NULL CHECK (`rating` BETWEEN 1 AND 5),
  `content`    TEXT,
  `images`     JSON      COMMENT 'Mảng URL ảnh khách đính kèm',
  `is_visible` BOOLEAN   DEFAULT TRUE,
  `created_at` DATETIME  DEFAULT (NOW())
);

-- ------------------------------------------------------------
-- COMMENTS
-- Bình luận sản phẩm, hỗ trợ reply lồng nhau
-- ⚠️  product_id → db_products.PRODUCTS
-- ⚠️  user_id    → db_users.USERS
-- ------------------------------------------------------------
CREATE TABLE `COMMENTS` (
  `id`          CHAR(36)  PRIMARY KEY DEFAULT (UUID()),
  `product_id`  CHAR(36)  NOT NULL COMMENT '[REF: db_products.PRODUCTS.id]',
  `user_id`     CHAR(36)  NOT NULL COMMENT '[REF: db_users.USERS.id]',
  `parent_id`   CHAR(36)  DEFAULT NULL COMMENT 'NULL = bình luận gốc, có giá trị = reply',
  `content`     TEXT      NOT NULL,
  `is_visible`  BOOLEAN   DEFAULT TRUE,
  `created_at`  DATETIME  DEFAULT (NOW()),
  `updated_at`  DATETIME  DEFAULT (NOW()),
  FOREIGN KEY (`parent_id`) REFERENCES `COMMENTS`(`id`)
);

-- Indexes
CREATE UNIQUE INDEX `uq_reviews`        ON `REVIEWS`  (`user_id`, `product_id`, `order_id`);
CREATE INDEX `idx_reviews_product`      ON `REVIEWS`  (`product_id`);
CREATE INDEX `idx_comments_product`     ON `COMMENTS` (`product_id`, `parent_id`);


-- ============================================================
-- DATABASE 11: db_config
-- Service: Config Service
-- Quản lý: SETTINGS, BANNERS
-- ============================================================

CREATE DATABASE IF NOT EXISTS `db_config`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `db_config`;

-- ------------------------------------------------------------
-- SETTINGS
-- Key-value store cho cấu hình hệ thống
-- VD: hotline, store_address, facebook_url, zalo_url,
--     return_policy, privacy_policy, about_us, google_map_iframe
-- ------------------------------------------------------------
CREATE TABLE `SETTINGS` (
  `id`            CHAR(36)     PRIMARY KEY DEFAULT (UUID()),
  `setting_key`   VARCHAR(255) UNIQUE NOT NULL,
  `setting_value` TEXT,
  `setting_type`  ENUM('string', 'number', 'boolean', 'json', 'html') DEFAULT 'string'
                  COMMENT 'html: dùng cho nội dung chính sách dạng rich text',
  `group`         VARCHAR(100) DEFAULT 'general'
                  COMMENT 'Nhóm hiển thị trong admin: general, contact, social, policy',
  `description`   VARCHAR(500),
  `updated_at`    DATETIME     DEFAULT (NOW())
);

-- ------------------------------------------------------------
-- BANNERS
-- ------------------------------------------------------------
CREATE TABLE `BANNERS` (
  `id`          CHAR(36)     PRIMARY KEY DEFAULT (UUID()),
  `title`       VARCHAR(255),
  `image_url`   VARCHAR(500) NOT NULL,
  `target_url`  VARCHAR(500) COMMENT 'Link khi click vào banner',
  `position`    VARCHAR(100) DEFAULT 'home_main'
                COMMENT 'Vị trí: home_main, home_sub, category_top, popup',
  `sort_order`  INT          DEFAULT 0,
  `start_date`  DATETIME     DEFAULT NULL COMMENT 'NULL = hiển thị ngay',
  `end_date`    DATETIME     DEFAULT NULL COMMENT 'NULL = không hết hạn',
  `is_active`   BOOLEAN      DEFAULT TRUE,
  `created_at`  DATETIME     DEFAULT (NOW()),
  `updated_at`  DATETIME     DEFAULT (NOW())
);

-- Indexes
CREATE INDEX `idx_banners_active`  ON `BANNERS`  (`is_active`, `sort_order`);
CREATE INDEX `idx_banners_dates`   ON `BANNERS`  (`start_date`, `end_date`);
CREATE INDEX `idx_settings_key`    ON `SETTINGS` (`setting_key`);
CREATE INDEX `idx_settings_group`  ON `SETTINGS` (`group`);


-- ============================================================
-- TỔNG KẾT RABBITMQ EVENTS
-- ============================================================
--
-- [Order Service] PUBLISH:
--   • order_created          → Inventory (trừ stock), Payment, Promotion, Notification, Installment
--   • order_status_changed   → Notification
--   • order_cancelled        → Inventory (hoàn stock), Promotion (rollback usage), Notification
--   • order_completed        → Review (mở khoá cho phép review)
--
-- [Installment Service] PUBLISH:
--   • application_approved   → Order (cập nhật payment_type confirmed), Notification
--   • application_rejected   → Notification
--   • schedule_reminder      → Notification (nhắc trả kỳ góp — cron job hàng ngày)
--   • schedule_overdue       → Notification
--
-- [Payment Service] PUBLISH:
--   • payment_success        → Order (cập nhật status), Notification
--   • payment_failed         → Order, Notification
--   • payment_refunded       → Order, Notification
--
-- [Promotion Service] PUBLISH:
--   • flash_sale_started     → Notification (push cho user đã wishlist sản phẩm)
--
-- [Inventory Service] PUBLISH:
--   • stock_low_warning      → Notification (cảnh báo admin)
--   • stock_updated          → Product Service (đồng bộ số lượng nếu cần cache)
--
-- ============================================================
