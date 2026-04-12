# Quyết định stack kỹ thuật (Agent A01.5)

> **Đồng bộ GitHub (A01.6):** bản publish tại `docs/architecture/stack-decision.md` trên repo `dt-thenf/doanvidieukhien`. Tài liệu kiến trúc đầy đủ (giao thức Pi–PIC, luồng vàng, handoff, planning) nằm trong thư mục ứng dụng **`restaurant-pi-pic/docs/`**.

**Trạng thái:** đã chốt phương án chính cho đồ án (local-first, demo-friendly).  
**Phạm vi:** chỉ mô tả lựa chọn và lý do — **không** chứa mã triển khai.

## Nguồn sự thật (bám theo yêu cầu dự án)

| Nguồn được yêu cầu | Trạng thái trong repo | Cách bám khi làm việc |
|--------------------|----------------------|------------------------|
| `restaurant-pi-pic/AGENTS.md` | Có | Ranh giới Pi / PIC / hai web; không đổi kiến trúc. |
| `restaurant-pi-pic/docs/architecture/pi-pic-protocol.md` | Có | RF `v1`; backend phải khớp `SEQ`, `ACK`/`NACK`, `EVT_*`. |
| `restaurant-pi-pic/docs/architecture/golden-demo-flow.md` | Có | Tiêu chí demo end-to-end + T1–T5 trước tích hợp. |
| `docs/planning/project-brief.md` | **Chưa có** | Dùng `restaurant-pi-pic/docs/architecture/PRODUCT_HANDOFF.md` §1 + `restaurant-pi-pic/docs/planning/PROJECT-SUMMARY.md`. |
| `docs/planning/prd.md` | **Chưa có** | Dùng `restaurant-pi-pic/docs/architecture/PRODUCT_HANDOFF.md` §2–§5. |
| `docs/planning/backlog-overview.md` | **Chưa có** | Dùng `PRODUCT_HANDOFF.md` §8–§9 + `restaurant-pi-pic/docs/planning/ROADMAP.md`. |
| Tài liệu UI/UX Direction | **Chưa có file cố định trong repo** | Ưu tiên Notion **04. UI/UX Direction**; đồng bộ token vào `.stitch/DESIGN.md` khi chạy pipeline (xem `design-workflow.md`). |
| Stitch MCP + stitch-skills | Ngoài repo (Cursor/Claude skills) | Chuỗi bước chốt tại `design-workflow.md`. |

---

## 1. Frontend (web khách + web quản trị)

**Phương án chính:** **Vite + React 18 + TypeScript**, hai ứng dụng độc lập (hoặc hai entry) cho **customer** và **admin**.

| Tiêu chí | Vì sao phù hợp đồ án |
|-----------|----------------------|
| Mobile-first / QR | Khách dùng điện thoại; React + TS giúp tái sử dụng pattern form/giỏ hàng, dễ tách route theo bàn. |
| Hệ sinh thái UI | Khớp định hướng dùng **shadcn/ui** (Radix + Tailwind) trong workflow Stitch → code. |
| Tài liệu & bảo vệ | Stack phổ biến, dễ giải thích pipeline build (`vite build`) và deploy tĩnh phía Pi (nginx phục vụ file hoặc do backend mount — chốt chi tiết triển khai sau). |

**Phương án loại:** SPA thuần không framework (HTML/JS) — **loại** vì hai web + trạng thái form dễ nợ kỹ thuật; Next.js full SSR — **loại** vì phức tạp hơn nhu cầu Pi chủ yếu LAN demo (ưu tiên đơn giản).

---

## 2. Backend trên Raspberry Pi

**Phương án chính:** **Python 3.11+** với **FastAPI** + **Uvicorn** (ASGI, một tiến trình cho demo).

| Tiêu chí | Vì sao phù hợp |
|-----------|----------------|
| OpenAPI tự sinh | Giúp viết báo cáo / bảo vệ: liệt kê endpoint khớp `golden-demo-flow.md` và backlog **Pi backend**. |
| Tích hợp tác vụ Pi | Dễ gói module **RF bridge** (đọc/ghi SPI, hàng đợi gửi `EVT_*`) trong cùng runtime hoặc tiến trình phụ được điều phối bởi cùng repo — không bắt buộc microservice. |
| Phòng lab VN | Python quen thuộc với sinh viên; giảm ma sát khi debug log nghiệp vụ. |

**Phương án loại:** **Node.js (Fastify/Nest)** — mạnh nếu muốn full TypeScript; **loại làm phương án chính** ở đây để tránh phân tán ngôn ngữ (Python cho SPI/tooling phổ biến tài liệu Pi) và giữ một “câu chuyện” stack rõ ràng cho giám khảo không cần biết cả hai hệ.

---

## 3. Cơ sở dữ liệu (local-first)

**Phương án chính:** **SQLite** (một file DB trên Pi, backup bằng copy file).

| Tiêu chí | Vì sao phù hợp |
|-----------|----------------|
| Local-first | Không phụ thuộc Docker DB hay cloud; đúng ràng buộc demo trong lab. |
| Golden flow | Giao dịch theo `order_id` / `table_id` trong `pi-pic-protocol.md` ánh xạ thẳng sang bảng quan hệ đơn giản. |
| Vận hành Pi | Nhẹ tài nguyên; phù hợp đồ án không cần replica. |

**Phương án loại:** PostgreSQL trên Pi — **loại** (thêm vận hành); Firebase — **loại** (trái local-first đã thống nhất trong brief/handoff).

---

## 4. ORM / query layer

**Phương án chính:** **SQLModel** (SQLAlchemy 2.x + Pydantic v2) làm lớp truy cập DB.

| Tiêu chí | Vì sao phù hợp |
|-----------|----------------|
| Khớp FastAPI | Model dùng chung cho validation API và persistence, giảm drift giữa “schema API” và “schema DB”. |
| Độ phức tạp | Ít boilerplate hơn SQLAlchemy thuần cho đồ án; vẫn đủ migration story qua Alembic **khi** cần (có thể bắt đầu bằng `create_all` cho demo sớm — chốt với giảng viên nếu yêu cầu migration nghiêm). |

**Phương án loại:** SQL thuần qua driver — **loại** (dễ lệch với OpenAPI); ORM nặng kiểu Django full — **loại** (vượt quá ranh giới “Pi là host logic” đã đủ với FastAPI).

---

## 5. Cấu trúc repo / monorepo tối thiểu

**Phương án chính:** **một Git repo** (monorepo “mềm” — **không** bắt buộc npm/pnpm workspace ngay đầu dự án), cấu trúc **phẳng tối thiểu** (dễ clone trên Pi), có thể nâng cấp workspace sau:

```text
customer-web/      # Vite + React + TS (khách, mobile-first)
admin-web/         # Vite + React + TS (quản trị)
pi-backend/        # FastAPI + SQLModel + SQLite + module RF/log
firmware/          # PIC16F887 (MPLAB X / toolchain nhóm chọn)
.stitch/           # DESIGN.md + designs (artifact Stitch) — theo workflow thiết kế
docs/              # Kiến trúc, quyết định, planning
AGENTS.md
```

- **Không** bắt buộc `packages/` shared ngay từ đầu; khi trùng type API ↔ web, ưu tiên **OpenAPI generate client** hoặc copy type tối thiểu (chấp nhận nợ nhỏ để giữ repo gọn).  
- **Tách biên** theo `AGENTS.md`: ranh giới thư mục = ranh giới agent (customer / admin / Pi / firmware).

---

## 6. Liên kết với giao thức RF và luồng vàng

- **pi-backend** giữ **nguồn sự thật**; mọi `CMD_*` từ PIC đi qua lớp xử lý đồng bộ với DB rồi mới trả `ACK`/`NACK` đúng `SEQ` (theo `pi-pic-protocol.md`).  
- **golden-demo-flow.md** là tiêu chí kiểm thử tích hợp; log nghiệp vụ + log RF nên cùng hệ thống logging của Pi backend (mức mô tả, không code tại đây).  
- Web chỉ gọi HTTP; **không** đưa logic nghiệp vụ xuống firmware.

---

## 7. UI/UX & Stitch (tham chiếu chéo)

- Token và tinh thần giao diện (organic minimal, palette sage/cream, Poppins/Inter — theo Notion **04**) được **đồng bộ** vào `.stitch/DESIGN.md` khi chạy pipeline Stitch; xem chi tiết bước trong `design-workflow.md`.

---

## 8. Tóm tắt một dòng

**React+Vite+TS (2 web) · FastAPI+Uvicorn (Pi) · SQLite+SQLModel · repo phẳng 4 khối + docs —** phục vụ demo LAN, bám giao thức `v1`, dễ bảo vệ.

---

## 9. Thứ tự triển khai tổng thể (A01.5 — stack → design → backend → frontend → firmware)

Thứ tự này tối ưu cho **đồ án**: giảm rework API, cho phép RF bring-up song song sau khi có lớp nghiệp vụ tối thiểu.

| Thứ tự | Giai đoạn | Việc chính | Đầu ra kiểm chứng |
|--------|-----------|------------|---------------------|
| 1 | **Stack + ranh giới** | Chốt stack (file này), đọc `pi-pic-protocol.md` `v1`, `golden-demo-flow.md`. | Cả nhóm cùng từ vựng: app, API, RF. |
| 2 | **Design (Stitch → DESIGN.md)** | Chạy chuỗi trong `design-workflow.md` (D1→D5), ưu tiên màn khách theo luồng vàng. | `.stitch/DESIGN.md` + artifact màn hình; token khớp Notion **04**. |
| 3 | **Backend Pi** | SQLite + model + API CRUD/đặt món/thanh toán; logging; RF bridge enqueue `EVT_*`. | OpenAPI; log thấy `ACK`/`NACK` khi mock PIC hoặc script gửi frame. |
| 4 | **Frontend** | `customer-web` / `admin-web` gọi API; không logic NRF trong browser. | Chạy thử QR → tạo đơn → trạng thái trên admin. |
| 5 | **Firmware PIC** | NRF + state nút/keypad; `PING`, `CMD_*`. | **T1–T5** trong `golden-demo-flow.md` với phần cứng thật. |

**Song song (không đảo thứ tự nghiệp vụ):** sau bước 3, có thể lập trình PIC **PING** (T1) ngay khi Pi có cổng RF tối thiểu — không cần chờ UI admin hoàn thiện.

Chi tiết quyết định có ID **D-2026-04-12-13** trong `docs/decisions/decision-log.md`.
