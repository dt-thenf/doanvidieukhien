# pi-backend — FastAPI + SQLModel + SQLite (Raspberry Pi)

Backend nghiệp vụ **local-first** cho đồ án nhà hàng chay QR theo bàn. Pi là nguồn sự thật (web + DB + logic); vòng này **chưa** nối NRF thật — lớp `PicBridge` chỉ **stub/log** (khớp `EVT_ORDER_NEW`, `EVT_PAYMENT_PENDING` + retry 1 lần theo D-19).

## Yêu cầu

- Python **3.11+**

## Cài đặt & chạy local

**Mặc định (giống production nhỏ):** không có route `/dev/*`.

```bash
cd pi-backend
python -m venv .venv
.venv\Scripts\activate          # Windows
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Khi học / test tay (khuyến nghị):** bật `PI_DEBUG=1` để có **Swagger** hiện nhóm **dev-only** (giả lập bếp xong đơn).

```bash
# Windows PowerShell
$env:PI_DEBUG="1"; uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

```bash
# macOS / Linux
PI_DEBUG=1 uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

- OpenAPI: http://127.0.0.1:8000/docs  
- Health: `GET /api/v1/health`

## Test local từng bước (beginner)

Chuẩn bị: chạy server với **`PI_DEBUG=1`**, mở http://127.0.0.1:8000/docs .

Dùng **Bàn 06** (`table_id` = `6`) trong seed — đang **IDLE**, thích hợp tạo phiên mới.

| Bước | Việc làm | Endpoint (nhóm trên Swagger) |
|------|----------|------------------------------|
| 1 | Xem thực đơn (tuỳ chọn) | `GET /api/v1/customer/menu` |
| 2 | Kiểm tra bàn | `GET /api/v1/customer/tables/6` |
| 3 | **Tạo / cập nhật đơn** (giỏ gửi bếp) | `POST /api/v1/customer/tables/6/orders/active` — body ví dụ: `{"lines":[{"menuItemId":"canh-rau","quantity":1,"lineNote":""}],"orderNote":""}` |
| 4 | **Bếp xong đơn** (local: giả PIC) | `POST /api/v1/dev/tables/6/kitchen-done` — chỉ có khi `PI_DEBUG=1` |
| 5 | Khách **yêu cầu thanh toán** | `POST /api/v1/customer/tables/6/payment/request` |
| 6 | **Reset bàn** (admin) — chỉ khi bàn **SETTLED** | Với luồng trên, bàn đang **PAYMENT_REQUESTED**; chốt tiền thật là **PIC** (`CMD_COUNTER_PAID`). Để tập **reset** mà không cần PIC: dùng bàn seed **đã SETTLED**, ví dụ **Bàn 03**: `POST /api/v1/admin/tables/3/reset` |

Gợi ý: sau bước 3–5 có thể xem **`GET /api/v1/admin/tables/overview`** và **`GET /api/v1/admin/payments/queue`** để quen dữ liệu admin.

## Biến môi trường (tuỳ chọn)

| Biến | Mặc định | Ý nghĩa |
|------|----------|---------|
| `PI_DATABASE_URL` | `sqlite:///./data/restaurant.db` | Chuỗi SQLAlchemy (SQLite file) |
| `PI_DEBUG` | (tắt) | `1`/`true`: echo SQL + **bật** `POST /api/v1/dev/...` (chỉ máy dev) |
| `PI_CORS_ORIGINS` | localhost Vite 5173/5174 | Danh sách origin CORS, phân tách bằng dấu phẩy |

## Seed demo

Lần đầu chạy (DB trống), `lifespan` tạo bảng và gọi `seed_if_empty`: vài bàn (01–06, 12), món chay khớp `customer-web` mock, vài đơn/thanh toán phục vụ 4 màn Stitch/admin.

## Kiểm thử

```bash
pytest -q
```

## Tài liệu kiến trúc (repo gốc)

**Nguồn sự thật cho “hợp đồng” tĩnh:** `docs/architecture/api-contract.md` + `db-schema.md` + `pi-backend-flow.md` (đồng bộ với `docs/decisions/decision-log.md`). **Hành vi chi tiết** xem OpenAPI `/docs` và mã trong `pi-backend/app/`.

- `docs/architecture/db-schema.md`
- `docs/architecture/api-contract.md`
- `docs/architecture/pi-backend-flow.md`

## Stub Pi ↔ PIC

- `app/services/pic_bridge.py` — gửi sự kiện (stub + retry ngủ 120ms).  
- `app/services/pic_commands.py` — xử lý `CMD_KITCHEN_DONE`, `CMD_COUNTER_LOOKUP`, `CMD_COUNTER_PAID`. Trên HTTP: **chỉ** `CMD_KITCHEN_DONE` được giả lập qua **`POST /api/v1/dev/.../kitchen-done`** khi `PI_DEBUG=1`; các `CMD_*` khác vẫn chờ worker NRF.
