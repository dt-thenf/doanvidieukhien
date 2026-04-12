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

**Khi học / test full flow local (khuyến nghị):** bật `PI_DEBUG=1` để có **Swagger** nhóm **dev-only** (giả lập **bếp xong đơn** và **quầy đã thu tiền** — tương đương `CMD_KITCHEN_DONE` / `CMD_COUNTER_PAID` trong `pic_commands.py`).

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

## Luồng test local end-to-end (beginner)

Chuẩn bị:

1. Backend **`PI_DEBUG=1`** (xem trên).
2. (Tuỳ chọn) **customer-web** + **admin-web** trỏ `VITE_API_BASE_URL=http://127.0.0.1:8000`.
3. (Tuỳ chọn) Đặt **`VITE_ENABLE_E2E_DEV_PANEL=1`** trên frontend để có nút bấm gọi `/dev/*` (xem README từng app). Không đặt biến này → UI không lộ công cụ dev.

Dùng **Bàn 06** (`table_id` = `6`) trong seed — **IDLE**, phù hợp một vòng demo sạch.

| Bước | Việc làm | Ghi chú |
|------|----------|---------|
| 1 | (Tuỳ chọn) Xem thực đơn | `GET /api/v1/customer/menu` hoặc customer-web |
| 2 | Kiểm tra bàn | `GET /api/v1/customer/tables/6` |
| 3 | **Tạo / cập nhật đơn** (gửi bếp) | `POST /api/v1/customer/tables/6/orders/active` — ví dụ body: `{"lines":[{"menuItemId":"canh-rau","quantity":1,"lineNote":""}],"orderNote":""}` |
| 4 | **Bếp xong đơn** (giả PIC bếp) | **`POST /api/v1/dev/tables/6/kitchen-done`** — **chỉ khi `PI_DEBUG=1`** |
| 5 | Khách **yêu cầu thanh toán** | `POST /api/v1/customer/tables/6/payment/request` — đơn phải **DONE** |
| 6 | **Quầy đã thu** (giả PIC quầy, `CMD_COUNTER_PAID`) | **`POST /api/v1/dev/tables/6/counter-paid`** — **chỉ khi `PI_DEBUG=1`**; bàn → **SETTLED** |
| 7 | **Reset bàn** (nhân viên / sau kết sổ) | `POST /api/v1/admin/tables/6/reset` — **chỉ khi** bàn **SETTLED** → **IDLE** |

Sau bước 5 có thể mở admin-web **Chờ thanh toán** hoặc `GET /api/v1/admin/payments/queue`.  
**Lưu ý:** trên bản thật, bước 6 do **thiết bị PIC quầy**, không phải web admin; route dev chỉ để tập trước firmware.

## Biến môi trường (tuỳ chọn)

| Biến | Mặc định | Ý nghĩa |
|------|----------|---------|
| `PI_DATABASE_URL` | `sqlite:///./data/restaurant.db` | Chuỗi SQLAlchemy (SQLite file) |
| `PI_DEBUG` | (tắt) | `1`/`true`: echo SQL + **bật** `POST /api/v1/dev/...` (chỉ máy dev) |
| `PI_CORS_ORIGINS` | localhost Vite 5173/5174 | Danh sách origin CORS, phân tách bằng dấu phẩy |

## Seed demo

Lần đầu chạy (DB trống), `lifespan` tạo bảng và gọi `seed_if_empty`: vài bàn (01–06, 12), món chay, vài đơn/thanh toán phục vụ demo.

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
- `app/services/pic_commands.py` — xử lý `CMD_KITCHEN_DONE`, `CMD_COUNTER_LOOKUP`, `CMD_COUNTER_PAID`.  
- `app/services/pic_ingress/` — **ingress** thống nhất: parse (ví dụ JSON mock) → `handle_pic_ingress` → cùng các `apply_*` ở trên; HTTP dev chỉ gọi ingress. Chi tiết: `docs/architecture/pic-ingress.md`.
