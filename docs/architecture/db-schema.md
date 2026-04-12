# Schema cơ sở dữ liệu — pi-backend (SQLite + SQLModel)

**Trạng thái:** MVP demo local — `create_all` khi khởi động, **chưa** bắt buộc Alembic.

**Nguồn sự thật (góc DB):** mô tả bảng/trường trong file này phải khớp **mã** `pi-backend/app/models/`. **Quyết định** (1 bàn = 1 order active, `total_minor` VND, …) lấy từ `docs/decisions/decision-log.md`. **API & luồng HTTP** xem `api-contract.md`, `pi-backend-flow.md` và OpenAPI `/docs`.

**Tham chiếu thiết kế / RF:** `.stitch/DESIGN.md` (trạng thái hiển thị UI), `restaurant-pi-pic/docs/architecture/pi-pic-protocol.md` (`total_minor` VND nguyên trên payload).

## Quy ước chung

- **`total_minor` / `price_minor` / `unit_price_minor`:** số nguyên **VND (đồng)** — không nhân hệ số 100 (D-18).  
- **`table_id` trong QR/API khách:** trường `dining_table.code` (số nguyên, ví dụ `1` → nhãn `Bàn 01`).  
- **Một bàn = một order “active”** trong phiên: `dining_table.active_order_id` trỏ tới đơn hiện tại; không tạo đơn thứ hai khi đơn còn `NEW`/`IN_KITCHEN` (D-16).  
- **`active_order_id`:** không dùng FK DB (tránh vòng phụ thuộc SQLite); ràng buộc do tầng service.

## Bảng `dining_table`

| Cột | Kiểu | Mô tả |
|-----|------|--------|
| `id` | INTEGER PK | Khóa nội bộ |
| `code` | INTEGER UNIQUE | Mã bàn (QR / API) |
| `label` | TEXT | Hiển thị, ví dụ `Bàn 01` |
| `state` | TEXT | `IDLE` · `OPEN` · `PAYMENT_REQUESTED` · `SETTLED` |
| `active_order_id` | INTEGER NULL | Đơn phiên hiện tại (logic) |
| `updated_at` | DATETIME | Cập nhật gần nhất |

## Bảng `menu_item`

| Cột | Kiểu | Mô tả |
|-----|------|--------|
| `id` | TEXT PK | Slug ổn định (khớp seed / `customer-web` & `admin-web`) |
| `name` | TEXT | Tên món |
| `price_minor` | INTEGER | Giá VND nguyên |
| `category_id` | TEXT | Nhóm menu |
| `image_url` | TEXT | URL ảnh (có thể rỗng) |
| `tags_json` | TEXT | JSON mảng chuỗi tag |

## Bảng `restaurant_order`

| Cột | Kiểu | Mô tả |
|-----|------|--------|
| `id` | INTEGER PK | Mã đơn nội bộ |
| `table_db_id` | INTEGER FK → `dining_table.id` | Bàn |
| `status` | TEXT | `NEW` · `IN_KITCHEN` · `DONE` |
| `note` | TEXT | Ghi chú đơn |
| `created_at` / `updated_at` | DATETIME | Thời gian |

**Ghi chú MVP:** sau khi khách gửi đơn qua web, service đặt `IN_KITCHEN` để đồng bộ seed và màn admin (bếp đã nhận).

## Bảng `order_item`

| Cột | Kiểu | Mô tả |
|-----|------|--------|
| `id` | INTEGER PK | |
| `order_id` | INTEGER FK → `restaurant_order.id` | |
| `menu_item_id` | TEXT FK → `menu_item.id` | |
| `quantity` | INTEGER | ≥ 1 |
| `unit_price_minor` | INTEGER | Snapshot giá lúc gọi |
| `line_note` | TEXT | Ghi chú dòng |

## Bảng `payment`

| Cột | Kiểu | Mô tả |
|-----|------|--------|
| `id` | INTEGER PK | |
| `order_id` | INTEGER UNIQUE FK | Một dòng thanh toán / đơn |
| `table_db_id` | INTEGER FK | Denormalize tra cứu nhanh |
| `status` | TEXT | `NONE` · `REQUESTED` · `PAID` — **không** dùng `PENDING_AT_COUNTER` trong vòng MVP này |
| `total_minor` | INTEGER | Tổng VND snapshot khi yêu cầu thanh toán |
| `requested_at` / `updated_at` | DATETIME | |

## Liên kết với RF (tham chiếu)

- `order_id` / `table_id` (code) trong payload `pi-pic-protocol.md` map trực tiếp sang `restaurant_order.id` và `dining_table.code`.
