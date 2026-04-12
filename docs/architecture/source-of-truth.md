# Nguồn sự thật (source of truth) — repo đồ án Pi + PIC

Mục đích: một chỗ tra cứu để agent/developer **không nhầm** giữa bản chính, bản mirror, và artifact cũ. Không thay đổi kiến trúc — chỉ quy ước đọc/ghi.

---

## 1. Tài liệu kiến trúc / backend / quyết định

| Vai trò | Đường dẫn | Ghi chú |
|--------|-----------|---------|
| **SoT chính** | `docs/` tại **root repo** | Ưu tiên đọc/sửa ở đây: `docs/architecture/*`, `docs/decisions/decision-log.md`, `docs/planning/*`. |
| **Mirror / bundle** | `restaurant-pi-pic/docs/` | Giữ planning (PROJECT-SUMMARY, ROADMAP, …) và một số file trùng tên với root. **Không** coi đây là SoT độc lập cho kiến trúc đã triển khai. |
| **Quy tắc khi có hai bản** | `decision-log.md`, `stack-decision.md`, `design-workflow.md`, `pi-pic-protocol.md` | Nếu tồn tại ở cả root và `restaurant-pi-pic/docs/…`, **bản root `docs/` là chuẩn**; mirror cần **đồng bộ nội dung** khi chỉnh (xem header từng file). |

**Đọc trước khi code backend / API / DB:**  
`AGENTS.md` → `docs/architecture/stack-decision.md` → `docs/architecture/api-contract.md` → `docs/architecture/db-schema.md` → `docs/architecture/pi-backend-flow.md` → `docs/architecture/pic-ingress.md` (và `pi-pic-protocol.md` cho frame 32 byte).

**Đọc trước khi làm UI:**  
`.stitch/DESIGN.md` + `docs/architecture/design-workflow.md` + `design-tokens/theme.css`.

---

## 2. Code ứng dụng

| Thành phần | Đường dẫn | Trạng thái (demo) |
|------------|-----------|-------------------|
| Backend Pi | `pi-backend/` | FastAPI + SQLite; nghiệp vụ và REST là SoT hành vi server. |
| Web khách | `customer-web/` | Vite + React; gọi API theo `api-contract.md`. |
| Web nhân viên | `admin-web/` | Vite + React; gọi API theo `api-contract.md`. |
| Firmware | `firmware/pic16f887/` | Skeleton / tiến hóa theo `docs/architecture/pi-pic-protocol.md`. |

**Debug / lab (không phải nghiệp vụ production đầy đủ):**

- Route `POST /api/v1/dev/...` chỉ khi `PI_DEBUG=1` (xem `api-contract.md`, `pi-backend/README.md`).
- **JSON UTF-8** qua ingress (`decode_pic_command_json`) là **lớp tương đương PIC** trước khi có firmware/NRF ổn định — không gọi là “mock data” của frontend; gọi là **debug / lab adapter** cùng pipeline `handle_pic_ingress` với binary.

---

## 3. Stitch — design system & màn hình chốt

| Vai trò | Vị trí |
|--------|--------|
| **SoT mô tả UI + artifact đang dùng** | `.stitch/DESIGN.md` |
| **Bản màn hình chốt cho map sang React (A02.3)** | `.stitch/designs/` — file `01-…` đến `04-…` (HTML + PNG), **không** prefix `v2-` |
| **Ảnh thế hệ / thử nghiệm cũ** | `.stitch/designs/archive/` — chỉ tham chiếu lịch sử, không dùng làm bản vẽ chính |

---

## 4. Rủi ro nhầm lẫn thường gặp

1. **Hai `docs/`** — nhớ: **root `docs/`** cho kiến trúc triển khai; `restaurant-pi-pic/docs/` là mirror/bundle planning.
2. **Hai `pi-pic-protocol.md`** — ưu tiên **`docs/architecture/pi-pic-protocol.md`**; nếu hash khác mirror, sửa root trước.
3. **“Mock”** — trong code/docs có thể nghĩ là dữ liệu giả; với PIC, ưu dùng từ **debug adapter / lab JSON** khi ý là ingress thử nghiệm.
4. **README root cũ** — xem mục “Giai đoạn hiện tại” trong `README.md` root; không dựa vào đoạn mô tả “chưa có mã” nếu đã được cập nhật.

---

## 5. Liên quan

- Chốt quyết định có mã **D-** trong `docs/decisions/decision-log.md`.
- Hygiene repo (archive Stitch, SoT): xem mục **D-2026-04-13-05** trong cùng file log.

*Cập nhật: Agent A05.2 (repo hygiene).*
