# Workflow design-to-code với Stitch + stitch-skills (Agent A01.5)

> **Đồng bộ GitHub (A01.6):** bản publish tại `docs/architecture/design-workflow.md` trên `dt-thenf/doanvidieukhien`. Tham chiếu `PRODUCT_HANDOFF.md` / `PROJECT-SUMMARY.md` / `ROADMAP.md` hiểu là dưới `restaurant-pi-pic/docs/`.

**Mục tiêu:** chuẩn hoá cách đi từ **ý tưởng UI** (Notion **04. UI/UX Direction**, PRD/brief trong `restaurant-pi-pic/docs/architecture/PRODUCT_HANDOFF.md` + `restaurant-pi-pic/docs/planning/PROJECT-SUMMARY.md`) đến **component React** trong `customer-web/` và `admin-web/`, **không** phá ràng buộc kiến trúc Pi/PIC/NRF.

**Phạm vi:** quy trình và trách nhiệm — **không** chứa mã triển khai.

**Ghi chú nguồn:** các file `docs/planning/project-brief.md`, `prd.md`, `backlog-overview.md` như trong checklist dự án **chưa có** trong tree `restaurant-pi-pic/`; khi làm UI/UX, vẫn bám Notion **04** và các mục tương đương trong `restaurant-pi-pic/docs/architecture/PRODUCT_HANDOFF.md` cho đến khi owner nhập các file đó.

---

## 1. Nguyên tắc

| Nguyên tắc | Nội dung |
|------------|----------|
| Một nguồn token | Sau khi chốt palette/typography trên Notion **04**, **ghi vào** `.stitch/DESIGN.md` để mọi màn hình Stitch và code React dùng cùng bảng màu / font role (skill **design-md** tổng hợp semantic design system; **taste-design** tuỳ chọn nếu muốn nâng chất visual). |
| Tách vai | **Khách:** mobile-first, ít bước (QR → menu → giỏ → gửi đơn → thanh toán). **Admin:** desktop/tablet, CRUD và danh sách đơn. Không trộn bundle production một app duy nhất nếu làm phức tạo deploy — giữ hai app theo `stack-decision.md`. |
| Khớp backlog | Ưu tiên màn hình theo backlog trong `restaurant-pi-pic/docs/architecture/PRODUCT_HANDOFF.md` §8–§9 + `restaurant-pi-pic/docs/planning/ROADMAP.md` (và `backlog-overview.md` khi có file); đồng thời bám thứ tự UI trong Notion **04**. |
| Không đổi kiến trúc | Stitch chỉ phục vụ **lớp web**; không sinh yêu cầu MCU bàn hay thêm PIC. |

---

## 2. Chuỗi skill / MCP (thứ tự khuyến nghị — design-to-code)

Thứ tự cố định cho agent UI/FE (khớp stitch-skills trong môi trường Cursor/Claude):

1. **enhance-prompt** — làm rõ prompt trước khi gọi Stitch.  
2. **stitch-design** — entry Stitch MCP (generate/edit + tải artifact).  
3. **design-md** — tổng hợp / cập nhật semantic design system vào **`.stitch/DESIGN.md`**.  
4. **react:components** — chuyển màn Stitch thành module Vite + React + TS (tên skill trong bộ cài đặt: `react:components`).  
5. **shadcn-ui** — lắp primitive bằng component shadcn (Radix + Tailwind), đồng bộ token với DESIGN.md.

| Bước | Skill / công cụ | Đầu vào | Đầu ra |
|------|-------------------|---------|--------|
| **D1** | **enhance-prompt** | Mô tả màn hình thô + actor (khách / NV / quản trị) + ràng buộc mobile/desktop + (nếu có) đoạn token từ Notion **04** | Prompt Stitch có khối **DESIGN SYSTEM (REQUIRED)** + **PAGE STRUCTURE** (theo `stitch-design` skill) |
| **D2** | **stitch-design** + **Stitch MCP** | Prompt D1 + `projectId` Stitch (một project chung khuyến nghị) | Screen HTML/screenshot; lưu artifact dưới `.stitch/designs/` (quy ước trong skill **react:components**) |
| **D3** | **design-md** | Metadata/screen từ Stitch MCP + artifact hiện có | **`.stitch/DESIGN.md`** — nguồn sự thật token cho prompt sau này |
| **D4** | **react:components** | HTML + PNG (nếu có) trong `.stitch/designs/` + DESIGN.md | Component tách file trong `customer-web/src/...` hoặc `admin-web/src/...` |
| **D5** | **shadcn-ui** | Component sau D4 | Dùng `Button`, `Input`, `Dialog`, `Table`, … đúng pattern shadcn; giữ spacing/typography theo DESIGN.md |

**Ghi chú vận hành:** nếu chỉnh sửa màn đã có, ưu tiên luồng **edit** trong **stitch-design** (theo bảng workflow của skill — *edit-design*) thay vì generate lại từ đầu.

---

## 3. Cổng kiểm tra giữa các bước (quality gate)

- Sau **D2:** so khớp nhanh với **golden-demo-flow** (đủ CTA “gửi đơn”, “yêu cầu thanh toán” trên khách; admin có màn danh sách tối thiểu).  
- Sau **D3:** đối chiếu token với Notion **04** (sage, cream, nâu gỗ nhạt, trạng thái màu).  
- Sau **D5:** checklist a11y tối thiểu (contrast, focus) — mức đồ án, không mở rộng audit WCAG đầy đủ trừ khi môn học yêu cầu.

---

## 4. Mapping vai → app → Stitch project (gợi ý)

| Vai | App | Ghi chú khi prompt Stitch |
|-----|-----|---------------------------|
| Khách | `customer-web` | Không hero lớn; action-first; rõ `table_id`/tên bàn trên header. |
| NV / quản trị | `admin-web` | Bảng trạng thái bàn/đơn; form CRUD đơn giản. |

Có thể dùng **một** Stitch `projectId` với tag page theo vai, hoặc tách project — chốt theo thói quen nhóm; khuyến nghị **một project** để DESIGN.md thống nhất.

---

## 5. Thứ tự triển khai tổng thể (stack → design → code nghiệp vụ)

Xem đồng bộ `stack-decision.md` mục tích hợp; ở đây chỉ nhắc phần **design**:

1. **Chốt stack** (đã có trong `stack-decision.md`).  
2. **Chạy D1→D5** cho **customer-web** theo ưu tiên màn hình backlog.  
3. **Chạy D1→D5** cho **admin-web** mức tối thiểu phục vụ demo.  
4. **Nối API** (sau khi Pi backend có endpoint — ngoài phạm vi file này).  
5. **Firmware** song song hoặc sau T1 RF trong `golden-demo-flow.md` — không chờ UI xong mới bring-up NRF.

---

## 6. Điều **không** làm trong pipeline Stitch

- Không tạo màn hình yêu cầu **MCU tại bàn** hoặc **ứng dụng native**.  
- Không đổi luồng **thanh toán thật** (PCI, cổng ví) — chỉ UI trạng thái “yêu cầu / chờ / đã chốt” khớp PRD.  
- Không nhập **payload RF** vào UI khách (tránh lộ implementation); RF chỉ thuộc `pi-backend` + PIC.

---

*Tài liệu này là “sổ tay vận hành” cho agent UI (A02) và agent frontend (A05), phụ thuộc quyết định stack A01.5.*
