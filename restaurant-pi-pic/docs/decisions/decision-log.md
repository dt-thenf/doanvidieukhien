# Decision Log — Restaurant Pi + PIC (demo đồ án)

> **Đồng bộ GitHub (A01.6):** bản publish chính tại **root repo** `docs/decisions/decision-log.md` trên `dt-thenf/doanvidieukhien`. File này (`restaurant-pi-pic/docs/decisions/decision-log.md`) phải **đồng bộ nội dung** với bản publish khi chỉnh sửa.

Mục đích: ghi các quyết định kiến trúc / giao thức để tránh “đổi ngầm” giữa các agent và giữa các phiên làm việc.

**Nguồn tham chiếu (tương đối thư mục `restaurant-pi-pic/`):** `AGENTS.md`, `docs/architecture/PRODUCT_HANDOFF.md`, `docs/architecture/pi-pic-protocol.md`, `docs/architecture/event-mapping.md`, `docs/architecture/golden-demo-flow.md`. **Stack & design workflow (root repo):** `docs/architecture/stack-decision.md`, `docs/architecture/design-workflow.md`.

---

## Phụ lục — Khởi tạo dự án (tóm tắt ban đầu, giữ từ lịch sử repo)

> Các ý sau **vẫn đúng**; chi tiết kỹ thuật đã được mở rộng thành các mục **D-xx** phía dưới.

### Đã chấp nhận
1. **Kiến trúc tổng thể:** Raspberry Pi làm trung tâm (web + CSDL + logic); một PIC16F887; NRF24L01 làm kênh Pi–PIC.
2. **Không MCU tại bàn:** khách chỉ dùng điện thoại + QR + web.
3. **Một PIC cho hai cụm IO:** bếp (buzzer, LCD, nút) và quầy (keypad 4×4, LCD) — firmware phải có **chế độ** rõ ràng.
4. **Phạm vi đồ án:** ưu tiên đơn giản, dễ demo; không mở rộng đa chi nhánh hay thanh toán trực tuyến thật.
5. **Nguồn sự thật trên Pi:** mọi trạng thái nghiệp vụ có nghĩa do Pi quyết định sau lệnh hợp lệ từ web hoặc PIC.

### Để mở rộng sau (lịch sử — phần lớn đã có bản chi tiết trong D-xx)
- Danh sách mã lệnh RF và giới hạn payload → **D-2026-04-12-01**, **D-04**.
- Một phiên / nhiều đơn; thanh toán → **D-2026-04-12-16** và các mục Payment/Table liên quan.
- ACK/retry/timeout RF → **D-2026-04-12-02**, **D-03**, **D-19**.

---

## Quy tắc ghi log

- Mỗi mục có **ID** cố định, **trạng thái** (Đã chốt / Tạm thời / Huỷ), **bối cảnh**, **quyết định**, **Hệ quả**.
- Ưu tiên ngắn gọn, phục vụ demo và báo cáo.

---

## D-2026-04-12-01 — Phiên bản giao thức Pi↔PIC `v1`

| Trường | Nội dung |
|--------|----------|
| Trạng thái | **Đã chốt** |
| Bối cảnh | Cần “hợp đồng” RF trước khi code Pi/PIC; NRF24 giới hạn payload. |
| Quyết định | Dùng header cố định 4 byte (`VER`, `MSG_TYPE`, `SEQ`, `FLAGS`) + payload ≤ 28 byte; tổng gói ≤ 32 byte. |
| Hệ quả | Triển khai không được phân mảnh payload trong phạm vi demo tối thiểu. |

---

## D-2026-04-12-02 — Mô hình ACK/NACK và hướng tin

| Trường | Nội dung |
|--------|----------|
| Trạng thái | **Đã chốt** |
| Bối cảnh | RF không tin cậy; PIC không được tự suy luận nghiệp vụ khi mất kết nối. |
| Quyết định | Mọi `CMD_*` từ PIC tới Pi đều nhận `ACK` hoặc `NACK` với **cùng `SEQ`**. `PING`/`PONG` tương tự. Các `EVT_*` từ Pi→PIC **không bắt buộc** ACK ngược trong demo tối thiểu. |
| Hệ quả | Firmware PIC phải có state timeout/retry cho lệnh; Pi phải log `SEQ`. |

---

## D-2026-04-12-03 — Timeout / retry tối thiểu (PIC)

| Trường | Nội dung |
|--------|----------|
| Trạng thái | **Đã chốt (mức đề xuất triển khai)** |
| Bối cảnh | Cần tham số cố định để demo ổn định. |
| Quyết định | Timeout một lần chờ phản hồi: **250 ms**; **3** retry; backoff cố định **50–100 ms** (chọn một giá trị trong code). |
| Hệ quả | Có thể tinh chỉnh sau khi đo thực tế bench, nhưng không đổi mô hình mà không cập nhật tài liệu. |

---

## D-2026-04-12-04 — Danh pháp bản tin nghiệp vụ tối thiểu

| Trường | Nội dung |
|--------|----------|
| Trạng thái | **Đã chốt** |
| Bối cảnh | `PRODUCT_HANDOFF.md` gợi ý mã lệnh nhưng chưa gán payload. |
| Quyết định | Bộ bản tin tối thiểu: `PING`/`PONG`, `EVT_ORDER_NEW`, `CMD_KITCHEN_DONE`, `EVT_PAYMENT_PENDING`, `CMD_COUNTER_LOOKUP`, `CMD_COUNTER_PAID`, `ACK`, `NACK`. |
| Hệ quả | Mở rộng thêm `CMD_KITCHEN_GET_QUEUE` chỉ khi còn thời gian (should-have). |

---

## D-2026-04-12-05 — Luồng quầy trong demo vàng

| Trường | Nội dung |
|--------|----------|
| Trạng thái | **Đã chốt** |
| Bối cảnh | Cần thao tác quầy dễ kể trong bảo vệ. |
| Quyết định | **Khuyến nghị** NV quầy thực hiện `CMD_COUNTER_LOOKUP` trước `CMD_COUNTER_PAID` để minh họa đối soát. |
| Hệ quả | Pi backend nên hỗ trợ lookup trả snapshot ngắn trong `ACK`. |

---

## D-2026-04-12-06 — Nhánh `PENDING_AT_COUNTER` của Payment

| Trường | Nội dung |
|--------|----------|
| Trạng thái | **Tạm thời — khuyến nghị demo** |
| Bối cảnh | `PRODUCT_HANDOFF.md` mô tả state machine Payment đầy đủ hơn demo tối thiểu. |
| Quyết định | Với **demo tối thiểu**, cho phép chuyển thẳng `REQUESTED` → `PAID` khi nhận `CMD_COUNTER_PAID` hợp lệ; nhánh `PENDING_AT_COUNTER` chỉ bật nếu team muốn mô phỏng “quầy đang mở hồ sơ”. |
| Hệ quả | `event-mapping.md` ghi rõ tuỳ chọn; tránh tranh luận khi slide chỉ nói “chờ quầy”. |

---

## D-2026-04-12-07 — Chuyển chế độ Bếp ↔ Quầy trên một PIC

| Trường | Nội dung |
|--------|----------|
| Trạng thái | **Đã chốt (kiến trúc)** |
| Bối cảnh | Một PIC16F887 phục vụ hai cụm ngoại vi; rủi ro UX. |
| Quyết định | Dùng **một nút / tổ hợp nút cố định** chuyển chế độ hiển thị và routing keypad; không tách thành hai MCU. |
| Hệ quả | Tài liệu demo cần một dòng hướng dẫn “đang ở chế độ nào” trên LCD. |

---

## D-2026-04-12-08 — Đồng bộ với Notion / bộ tài liệu `docs/planning/*.md` tên chuẩn

| Trường | Nội dung |
|--------|----------|
| Trạng thái | **Chờ xác nhận** |
| Bối cảnh | Yêu cầu dự án tham chiếu các trang Notion (01, 02, 03, 06) và các file `project-brief.md`, `prd.md`, … — trong repo hiện có nội dung tương đương tập trung ở `PRODUCT_HANDOFF.md` và `PROJECT-SUMMARY.md`. |
| Quyết định | **Chưa chốt** việc tạo thêm file tên dài hoặc mirror Notion; ưu tiên giữ một nguồn markdown trong repo để agent không fork tài liệu. |
| Hệ quả | Owner dự án cần xác nhận: (a) import Notion vào `docs/planning/`, hoặc (b) đặt `PRODUCT_HANDOFF.md` làm SoT và cập nhật link Notion trỏ về repo. |

---

## D-2026-04-12-09 — Stack frontend (A01.5)

| Trường | Nội dung |
|--------|----------|
| Trạng thái | **Đã chốt** |
| Bối cảnh | Cần một stack thống nhất cho 2 web, mobile-first cho QR, và khớp shadcn/Stitch. |
| Quyết định | **Vite + React 18 + TypeScript**, tách `customer-web` và `admin-web`. |
| Hệ quả | UI triển khai theo pipeline trong `design-workflow.md`; không chọn Next.js full SSR làm mặc định. |

---

## D-2026-04-12-10 — Stack backend + DB + ORM trên Pi (A01.5)

| Trường | Nội dung |
|--------|----------|
| Trạng thái | **Đã chốt** |
| Bối cảnh | Local-first, OpenAPI cho báo cáo, đồng bộ với luồng vàng và giao thức RF. |
| Quyết định | **FastAPI + Uvicorn** (Python 3.11+); **SQLite**; **SQLModel** làm ORM/query layer chính. |
| Hệ quả | `pi-backend/` là host HTTP + nguồn sự thật; module RF nằm cùng hệ sinh thái triển khai Python (chi tiết tách file là việc triển khai). |

---

## D-2026-04-12-11 — Cấu trúc repo tối thiểu (A01.5)

| Trường | Nội dung |
|--------|----------|
| Trạng thái | **Đã chốt** |
| Bối cảnh | Cần ranh giới thư mục khớp 4 agent (customer / admin / Pi / firmware). |
| Quyết định | Một repo với cấu trúc phẳng: `customer-web/`, `admin-web/`, `pi-backend/`, `firmware/`, `.stitch/`, `docs/`, `AGENTS.md` (xem **D-2026-04-12-15** cho vai trò `.stitch/`). |
| Hệ quả | Chưa bắt buộc `packages/` workspace; có thể sinh client từ OpenAPI sau. |

---

## D-2026-04-12-12 — Workflow Stitch → React (A01.5)

| Trường | Nội dung |
|--------|----------|
| Trạng thái | **Đã chốt** |
| Bối cảnh | Định hướng dùng Stitch MCP + stitch-skills (enhance-prompt → stitch-design → design-md → react:components → shadcn-ui). |
| Quyết định | Áp dụng chuỗi **D1–D5** trong `design-workflow.md`; token UI đồng bộ Notion **04** vào `.stitch/DESIGN.md`. |
| Hệ quả | Agent UI/FE không tự đặt palette lệch SoT; mọi màn hình đi qua cổng kiểm tra golden flow. |

---

## D-2026-04-12-13 — Thứ tự triển khai tổng thể (A01.5)

| Trường | Nội dung |
|--------|----------|
| Trạng thái | **Đã chốt** |
| Bối cảnh | Giảm rủi ro demo: cần thứ tự hợp lý giữa stack, design, backend, frontend, firmware. |
| Quyết định | **(1)** Chốt stack + giao thức (đã có `pi-pic-protocol.md`) → **(2)** Design Stitch/DESIGN.md theo ưu tiên backlog → **(3)** Pi backend (DB + API + log + RF bridge) → **(4)** Nối 2 frontend vào API → **(5)** Firmware PIC + tích hợp RF; song song sớm: **T1 PING** trong `golden-demo-flow.md` khi backend có cổng RF tối thiểu. |
| Hệ quả | Cho phép UI và RF bring-up song song sau khi stack chốt; không đảo ngược nghiệp vụ xuống PIC. |

---

## D-2026-04-12-14 — Ánh xạ tài liệu planning tên chuẩn ↔ repo hiện tại (A01.5)

| Trường | Nội dung |
|--------|----------|
| Trạng thái | **Đã chốt (quy tắc làm việc)** |
| Bối cảnh | Checklist dự án tham chiếu `project-brief.md`, `prd.md`, `backlog-overview.md` nhưng các file đó **chưa** có trong tree `restaurant-pi-pic/`. |
| Quyết định | Khi agent được yêu cầu bám các file trên, **mặc định** đọc: `PRODUCT_HANDOFF.md` (brief+PRD+backlog thô), `PROJECT-SUMMARY.md`, `ROADMAP.md`. Khi owner thêm đủ `docs/planning/*.md` tên chuẩn, cập nhật `stack-decision.md` bảng SoT và (tuỳ chọn) rút gọn trùng lặp trong `PRODUCT_HANDOFF.md`. |
| Hệ quả | Tránh fork nội dung giữa hai bộ tên; agent A01.5 coi `stack-decision.md` + bảng SoT là điểm vào. |

---

## D-2026-04-12-15 — Thư mục `.stitch/` và tên skill **react:components** (A01.5)

| Trường | Nội dung |
|--------|----------|
| Trạng thái | **Đã chốt** |
| Bối cảnh | Workflow Stitch trong skill manifest dùng tên `react:components` (dấu hai chấm); cần thống nhất với tài liệu repo. |
| Quyết định | Repo **bao gồm** `.stitch/` (DESIGN.md + `designs/`) trong cấu trúc tối thiểu; chuỗi D1–D5 trong `design-workflow.md` gọi đúng skill **react:components** (không đổi tên nội bộ skill). |
| Hệ quả | Agent FE biết nơi lưu artifact và tên skill khi hướng dẫn Cursor/Claude. |

---

## D-2026-04-12-16 — Chính sách đơn theo bàn (demo đơn giản) (A01.6)

| Trường | Nội dung |
|--------|----------|
| Trạng thái | **Đã chốt** |
| Bối cảnh | Cần giảm nhánh nghiệp vụ “nhiều Order song song” cho bàn demo và cho payload RF gọn. |
| Quyết định | **1 bàn = 1 Order “active”** trong một phiên mở: tại mỗi thời điểm chỉ tồn tại **tối đa một** Order chưa kết thúc bếp (`NEW` hoặc `IN_KITCHEN`). Khách gọi thêm món **chỉ được bổ sung dòng (order line) vào Order đó**, không tạo Order thứ hai. Khi Order đã `DONE` (và luồng thanh toán/chốt bàn theo golden flow), phiên mới hoặc reset bàn mới tạo Order kế tiếp. |
| Hệ quả | API/web từ chối hoặc gộp logic tạo Order lần 2 trong cùng phiên; PIC và `EVT_*` có thể giả định một `order_id` active rõ ràng. |

---

## D-2026-04-12-17 — Quầy: tra cứu mặc định theo `table_id` (A01.6)

| Trường | Nội dung |
|--------|----------|
| Trạng thái | **Đã chốt** |
| Bối cảnh | Keypad quầy cần một quy ước mặc định để demo nhất quán với QR theo bàn. |
| Quyết định | **`CMD_COUNTER_LOOKUP` mặc định theo `table_id`** (định danh bàn nội bộ); tra theo `order_id` **không** là luồng mặc định demo (chỉ dùng nếu team bật chế độ debug/should-have). |
| Hệ quả | Firmware quầy và kịch bản demo huấn luyện NV nhập **mã bàn**; payload RF khớp `lookup_kind = 0` trong `pi-pic-protocol.md`. |

---

## D-2026-04-12-18 — Đơn vị `total_minor` (A01.6)

| Trường | Nội dung |
|--------|----------|
| Trạng thái | **Đã chốt** |
| Bối cảnh | Tránh nhập nhằng “minor unit” khiến PIC hiển thị sai tiền. |
| Quyết định | **`total_minor` = số nguyên VND** (đồng, không nhân hệ số 100); truyền RF theo **little-endian** như đã quy ước chung giao thức. |
| Hệ quả | LCD quầy hiển thị đúng đơn vị tiền Việt Nam trong phạm vi demo; API snapshot đồng bộ cùng quy ước. |

---

## D-2026-04-12-19 — Pi retry tin đẩy `EVT_*` (A01.6)

| Trường | Nội dung |
|--------|----------|
| Trạng thái | **Đã chốt** |
| Bối cảnh | NRF mất gói; PIC không bắt buộc ACK `EVT_*` (D-01-02); vẫn cần hành vi Pi đơn giản để demo ổn định. |
| Quyết định | Pi **gửi lại tối đa 1 lần** cho mỗi sự kiện **`EVT_ORDER_NEW`** và **`EVT_PAYMENT_PENDING`** nếu lần gửi đầu được coi là chưa chắc chắn (mức demo: **một lần lặp sau backoff cố định ~100–200 ms**, không exponential, không vòng lặp vô hạn). Không áp dụng retry tự động cho toàn bộ loại tin khác nếu không có quyết định bổ sung. |
| Hệ quả | Giảm rủi ro bếp/quầy “không thấy” sự kiện do mất một gói; vẫn giữ kiến trúc không yêu cầu ACK ngược từ PIC cho `EVT_*`. |

---

## Mục chờ chốt bổ sung (backlog quyết định)

1. **File UI/UX trong repo:** có tạo `docs/design/ui-ux-direction.md` (mirror Notion **04**) hay chỉ giữ Notion + `.stitch/DESIGN.md`.  
2. **Triển khai tĩnh trên Pi:** nginx riêng phục vụ `dist/` hay do FastAPI mount static — một phương án triển khai demo.

---

*Cập nhật gần nhất: agent **A01.6** (đồng bộ repo + chốt D-16–D-19); A01.5 (stack + design workflow); A01 (giao thức `v1`).*
