# pi-backend — FastAPI + SQLModel + SQLite (Raspberry Pi)

Backend nghiệp vụ **local-first** cho đồ án nhà hàng chay QR theo bàn. Pi là nguồn sự thật (web + DB + logic); vòng này **chưa** nối NRF thật — lớp `PicBridge` chỉ **stub/log** (khớp `EVT_ORDER_NEW`, `EVT_PAYMENT_PENDING` + retry 1 lần theo D-19).

## Yêu cầu

- Python **3.11+**

## Cài đặt & chạy local

```bash
cd pi-backend
python -m venv .venv
.venv\Scripts\activate          # Windows
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

- OpenAPI: http://127.0.0.1:8000/docs  
- Health: `GET /api/v1/health`

## Biến môi trường (tuỳ chọn)

| Biến | Mặc định | Ý nghĩa |
|------|----------|---------|
| `PI_DATABASE_URL` | `sqlite:///./data/restaurant.db` | Chuỗi SQLAlchemy (SQLite file) |
| `PI_DEBUG` | (tắt) | `1`/`true` bật echo SQL |
| `PI_CORS_ORIGINS` | localhost Vite 5173/5174 | Danh sách origin CORS, phân tách bằng dấu phẩy |

## Seed demo

Lần đầu chạy (DB trống), `lifespan` tạo bảng và gọi `seed_if_empty`: vài bàn (01–06, 12), món chay khớp `customer-web` mock, vài đơn/thanh toán phục vụ 4 màn Stitch/admin.

## Kiểm thử

```bash
pytest -q
```

## Tài liệu kiến trúc (repo gốc)

- `docs/architecture/db-schema.md`
- `docs/architecture/api-contract.md`
- `docs/architecture/pi-backend-flow.md`

## Stub Pi ↔ PIC

- `app/services/pic_bridge.py` — gửi sự kiện (stub + retry ngủ 120ms).  
- `app/services/pic_commands.py` — xử lý `CMD_KITCHEN_DONE`, `CMD_COUNTER_LOOKUP`, `CMD_COUNTER_PAID` (gọi từ worker RF sau; **chưa** expose HTTP trong MVP).
