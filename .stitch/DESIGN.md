# Design System — Nhà hàng chay QR theo bàn (Pi + PIC demo)

**Phiên bản tài liệu:** 1.3 (Agent **A02.3** — `edit_screens` chỉnh **4 màn lõi** + ghi đè artifact `.stitch/designs/`; không thêm màn)  
**Trước đó:** 1.2 (A02.2 generate), 1.1 (A02.1 branding), 1.0 (A02 spec).  
**Tham chiếu kiến trúc:** `AGENTS.md`, `docs/architecture/stack-decision.md`, `docs/architecture/design-workflow.md`, `restaurant-pi-pic/docs/architecture/pi-pic-protocol.md`, `restaurant-pi-pic/docs/architecture/event-mapping.md`, `restaurant-pi-pic/docs/architecture/golden-demo-flow.md`, `docs/decisions/decision-log.md`.  
**UI/UX Direction (repo):** chưa có file cố định — palette/typography + **giọng điệu chay** dưới đây bám Notion **04** + ràng buộc đồ án; không xung đột `decision-log` (chỉ lớp biểu diễn web).

**Stitch (Google Stitch) — project đồ án (A02.2)**  
- **projectId (số):** `10925855463627774179`  
- **Resource name:** `projects/10925855463627774179`  
- **Tiêu đề project:** *Nhà hàng chay QR bàn — Pi PIC (A02.2 core 4 màn)*  
- **Design system instance trên Stitch:** *Linen & Sage* (metadata theme; **HTML artifact A02.3** đã nhúng **Poppins + Inter** qua Google Fonts — khi D4 map Tailwind, ưu tiên khớp CSS artifact hơn metadata Stitch).

**Artifact đã lưu repo (HTML + PNG):** thư mục `.stitch/designs/` — **bản hiện tại = sau A02.3** (ghi đè cùng tên file). Các ảnh thử **`v2-*.png`** đã chuyển sang **`.stitch/designs/archive/`** (không dùng làm reference chính; có thể lệch font/style so với HTML hiện tại).

| # | Màn | `screenId` Stitch (bản **sau A02.3**) | PNG | HTML |
|---|-----|----------------------------------------|-----|------|
| 1 | Thực đơn (khách) | `ab3221bc9605425c9220cc1710891684` | `01-thuc-don-khach.png` | `01-thuc-don-khach.html` |
| 2 | Giỏ hàng (khách) | `a5b161dd95d34299b06d22e538b71ce7` | `02-gio-hang-khach.png` | `02-gio-hang-khach.html` |
| 3 | Tổng quan bàn (NV) | `8caafbddc75b4b579066a1a94fa75a58` | `03-tong-quan-ban-nv.png` | `03-tong-quan-ban-nv.html` |
| 4 | Chờ thanh toán (NV) | `c61d9c98629140cd9206bf25a895ab07` | `04-cho-thanh-toan-nv.png` | `04-cho-thanh-toan-nv.html` |

**Ghi chú hành vi Stitch:** `edit_screens` tạo **màn mới** (id mới); các `screenId` A02.2 (`6eade1ab…`, `18f300d0…`, `35ddba87…`, `a0a0f279…`) có thể vẫn tồn tại trong cùng project — có thể ẩn/xoá trên canvas Stitch để tránh nhầm. Nguồn sự thật artifact trong repo là bảng trên.

---

## 1. Khí chất thị giác và nguyên tắc UX

**Phong cách:** Flat Organic Minimal — bề mặt phẳng, đường cong tự nhiên vừa phải, hình học mềm (lá / bo tròn organic), **không** glassmorphism hay gradient “showcase”, **không** animation phô trương.

### 1.1 Tinh thần “nhà hàng chay” (không đổi layout, chỉ làm rõ bản sắc)

- **Vị thế:** quán chay **thanh đạm, ấm**, gần với *cơm nhà / bếp nhỏ* hơn là nhà hàng fine-dining hay dark-mode “tech”.  
- **Cam kết thể hiện qua UI:** rõ ràng là **đồ chay** (chữ + tag + ảnh), **sạch** (không hình ảnh gợi thịt), **dễ tin** (giá, tên món tiếng Việt tự nhiên).  
- **Tránh:** mockup generic (MacBook, skyline), steak plant-based kiểu marketing, vàng chrome, neon, pattern hoa rườm rà, stock “nhà hàng sang” vô danh.

**Đối tượng & layout:**
- **Khách (customer-web):** **mobile-first**, **action-first** — luồng QR → thực đơn → giỏ → gửi đơn → (sau vòng khác) yêu cầu thanh toán. Header luôn nhắc **bàn** + trạng thái phiên ngắn gọn.
- **Nhân viên / quản trị (admin-web):** **dashboard-first** — mật độ thông tin vừa phải, bảng + chip trạng thái, thao tác 1–2 cú click cho tác vụ demo.

**Ràng buộc đồ án (không phá trong UI):**
- Một **Order active** / bàn trong phiên (**D-16**); gọi thêm = **bổ sung dòng** cùng `order_id`.
- Thanh toán: **demo** — chỉ trạng thái *yêu cầu / chờ quầy / đã chốt*; **không** cổng ví/PCI.
- **Không** đưa payload RF, `SEQ`, hay chi tiết giao thức vào UI khách.

### 1.2 Brand keywords (dùng trong prompt Stitch / QA visual)

`thanh sạch` · `tự nhiên` · `organic minimal` · `flat` · `ấm` · `đất & lá` · `gỗ nhạt` · `sage & kem` · `quán chay nhỏ` · `bếp mở / phục vụ trong ngày` *(gợi không gian, không thêm màn)* · `không thịt` · `thuần chay` · `dễ đọc` · `không generic` · `không premium showcase`

### 1.3 Wording — danh mục thực đơn (tiếng Việt, gợi nội dung chip lọc)

Dùng **một** trong các nhóm sau (chọn 5–7 chip cho demo; không bắt buộc đủ):

| Chip / danh mục | Gợi ý nội dung món |
|------------------|---------------------|
| **Khai vị chay** | gỏi củ, nem cuốn, súp nhẹ |
| **Món nóng** | cà ri rau củ, kho tàu chay, xào nấm |
| **Cơm — phần ăn** | cơm tấm chay, cơm phần rau + đậu |
| **Bún — miến — cháo** | nước dùng nấm/rau củ, ít dầu |
| **Đồ uống** | trà, nước ép, đồ uống nóng |
| **Tráng miệng chay** | chè, bánh ít ngọt |
| **Món trong ngày** *(tuỳ chọn)* | rotation demo |

**Quy tắc đặt tên món:** ưu tiên **tên thật Việt Nam** (vd. “Canh rau củ nấu nấm”, “Cơm chiên rau củ”) — tránh tên kiểu quốc tế hời hợt nếu không khớp menu thật.

### 1.4 Wording — tag trên card món (ngắn, 1 hàng)

| Tag hiển thị | Khi nào dùng |
|--------------|--------------|
| **Thuần chay** | mặc định toàn menu demo *(có thể ẩn nếu 100% chay — thay bằng “Món chay” một lần ở header)* |
| **Cay nhẹ** / **Không cay** | có ớt / không |
| **Nóng** | cần dùng ngay |
| **Có đậu** | đậu phụ / đậu hũ / đậu nành |
| **Ít dầu** | nếu nổi bật nghiệp vụ |
| **Bán chạy** | dùng dè, không lạm dụng |

**Không** dùng tag kiểu “100% organic premium” — tránh marketing sáo.

### 1.5 Hướng ảnh món (Stitch / asset sau này)

- **Ánh sáng:** tự nhiên, soft daylight; **không** spotlight dramatique kiểu billboard.  
- **Bát đĩa:** gốm sứ mat, màu trung tính (kem, xám nhạt); nền gỗ hoặc vải linen **nhạt**, không marble đen sang chảnh.  
- **Góc máy:** 3/4 hoặc top-down vừa phải; **màu thật** của rau củ (xanh lá, cam cà rốt, nâu nấm).  
- **Nội dung:** rõ **đồ ăn chay** (rau, đậu, nấm, hạt); **tránh** hình gợi thịt/cá tổng quát; **tránh** “ảnh stock nhà hàng” vô cảm (ly champagne, steak).  
- **Placeholder (khi chưa có ảnh):** minh hoạ **line-art** lá / bát trống tinh khiết — không 3D glossy.

### 1.6 Icon & ornament

- **Kiểu:** line icon **mảnh**, stroke ~1.5px; bo góc organic; màu `color.primary` hoặc `color.accent-wood` trên nền sáng.  
- **Motif:** **một lá** đơn giản, nhánh mỏng, hoặc vòng tròn không đối xứng hoàn hảo (hand-drawn nhẹ) — **không** bộ icon office generic, không emoji lớn làm hero.  
- **Ornament:** divider ngang **mảnh** + chấm sage nhỏ; **không** khung vàng, không hoa văn baroque.

### 1.7 Microcopy khách (tiếng Việt — nhất quán trên 2 màn khách)

| Ngữ cảnh | Copy gợi ý |
|----------|------------|
| Tiêu đề khu vực menu | “Hôm nay bếp có” / “Chọn món cho bàn của bạn” |
| Giỏ rỗng | “Giỏ đang trống — chọn thêm món thanh đạm nhé?” |
| Đang gửi đơn | “Đang gửi xuống bếp…” |
| Gửi đơn thành công | “Đã gửi bếp — cảm ơn bạn, chúc ngon miệng!” |
| Lỗi / thử lại | “Chưa gửi được — bấm thử lại hoặc nhờ nhân viên.” |
| Bàn / QR lỗi | “Không mở được bàn này — nhờ nhân viên hỗ trợ giúp bạn.” |
| Ghi chú đơn (placeholder) | “Ghi chú cho bếp (không bắt buộc)” |

**Admin:** giữ copy trung tính nghiệp vụ (“Tổng quan bàn”, “Chờ thanh toán”) — không cần giọng “chay” quá đà trên dashboard.

---

## 2. Bảng màu và vai trò (Color roles)

| Token / vai trò | Tên mô tả | Hex | Dùng cho |
|-----------------|-----------|-----|----------|
| `bg.canvas` | Kem ấm (nền trang) | `#FAF7F2` | Nền chính khách & admin |
| `bg.surface` | Kem sáng (bề mặt thẻ) | `#FFFFFF` | Card, sheet, ô lưới bàn |
| `bg.muted` | Sage rất nhạt | `#EEF3EF` | Vùng nhóm, hàng xen kẽ bảng |
| `color.primary` | Sage chủ đạo | `#6B8F71` | CTA chính, thanh tiến trình nhẹ |
| `color.primary-hover` | Sage đậm hơn | `#557A5A` | Hover/active nút primary |
| `color.accent-wood` | Nâu gỗ nhạt | `#C4A882` | Viền nhẹ, icon fill phụ, divider ấm |
| `color.text` | Than mềm | `#2C2C2C` | Tiêu đề, số tiền |
| `color.text-muted` | Xám ôliu | `#5F665F` | Mô tả món, phụ đề |
| `color.border` | Viền organic | `#D9D4CC` | Input, card viền mảnh |
| `state.info` | Sage nhạt (nền chip) | `#E3EDE5` | Đang mở / đang xử lý |
| `state.warning` | Vàng đất nhạt | `#F2E8CF` | Chờ thanh toán |
| `state.success` | Sage xanh mạ | `#D6EAD9` | Đã chốt / ổn định |
| `state.danger` | Đỏ đất (dùng dè) | `#C45C4A` | Lỗi, huỷ — chỉ khi cần |

**Contrast (MVP):** chữ chính trên nền kem/sage đạt mức đọc được trong phòng lab; tránh chữ trắng trên kem.

---

## 3. Typography

| Vai trò | Font | Trọng số / quy tắc |
|---------|------|---------------------|
| **Display / tiêu đề màn** | **Poppins** | 600–700; tracking bình thường |
| **Body / số tiền / bảng** | **Inter** | 400–500; số tiền `tabular-nums` |
| **Nhãn phụ / chip** | Inter | 500, uppercase tuỳ chọn cho chip trạng thái (demo) |

**Scale gợi ý (mobile khách):**  
`text-xs` 12px nhãn — `text-sm` 14px body — `text-base` 16px CTA — `text-lg`/`xl` tiêu đề section.

**Scale gợi ý (admin dashboard):**  
Thêm `text-2xl` cho KPI dòng đầu; bảng giữ `sm`–`base`.

---

## 4. Spacing, radius, elevation

| Token | Giá trị / mô tả |
|-------|----------------|
| `space.1` | 4px |
| `space.2` | 8px |
| `space.3` | 12px |
| `space.4` | 16px — padding card chuẩn mobile |
| `space.5` | 20px — khoảng cách section |
| `space.6` | 24px — mép màn an toàn |
| `radius.sm` | 8px — input, chip |
| `radius.md` | 12px — card, nút |
| `radius.lg` | 16px — bottom sheet / panel |
| `radius.full` | pill — badge số lượng, filter |
| `shadow` | **Flat** — không đổ bóng nặng; tối đa `0 1px 2px` rgba đen ~6% cho card nổi nhẹ |

**Lưới:** mobile 1 cột + gutter `space.4`; admin: 12 cột desktop với sidebar mảnh hoặc top bar (MVP).

---

## 5. Trạng thái nghiệp vụ (hiển thị UI — khớp domain)

**Bàn (Table):** `IDLE` · `OPEN` · `PAYMENT_REQUESTED` · `SETTLED`  
**Đơn (Order):** `NEW` · `IN_KITCHEN` · `DONE` (+ `CANCELLED` nếu có policy sau)  
**Thanh toán (Payment):** `NONE` · `REQUESTED` · *(tuỳ chọn `PENDING_AT_COUNTER` — D-06)* · `PAID`

**Ánh xạ UI ngắn:**
- Giỏ / thực đơn khách: bàn `OPEN`, đơn có thể `NEW` / `IN_KITCHEN` — CTA “Gửi đơn” / “Thêm món” theo D-16.
- Chờ thanh toán (admin): lọc `Table = PAYMENT_REQUESTED` hoặc `Payment = REQUESTED`.

---

## 6. Component styling (chuẩn hoá cho Stitch → shadcn sau này)

- **Primary button:** nền `color.primary`, chữ trắng hoặc kem `#FFFCF7`, `radius.md`, chiều cao tối thiểu 44px (touch).
- **Secondary button:** viền `color.border`, nền `bg.surface`, chữ `color.text`.
- **Card món:** `bg.surface`, viền `color.border`, ảnh vuông bo `radius.md`, giá + nút +/- hoặc “Thêm”.
- **Chip trạng thái:** nền `state.*` tương ứng, chữ `color.text`, `radius.full`.
- **App bar khách:** cố định top, hiển thị **Tên bàn / mã bàn** + chip phiên.
- **Bảng admin:** header sticky, hàng hover `bg.muted`, cột **Bàn · Trạng thái · Đơn · Tổng · Cập nhật**.

---

## 7. Bốn màn hình lõi đã chốt

### Màn 1 — Thực đơn (khách, mobile-first)

| Khía cạnh | Nội dung |
|-----------|----------|
| **Mục tiêu** | Khách xem món nhà hàng chay theo danh mục, thêm nhanh vào giỏ; luôn biết đang ở **bàn nào**. |
| **Thành phần chính** | App bar (bàn + trạng thái phiên); thanh tìm kiếm đơn giản (tuỳ chọn MVP); filter danh mục dạng chip scroll ngang (**wording mục 1.3**); danh sách **Card món** (ảnh theo **1.5**, tên tiếng Việt tự nhiên, giá VND, **tag mục 1.4**); thanh **FAB hoặc bar** tóm tắt giỏ (số món + tổng tạm). Tiêu đề khu vực có thể dùng microcopy **1.7**. |
| **Trạng thái chính** | Đang tải menu; rỗng (chưa có món); lỗi mạng; bàn không hợp lệ / phiên đóng (banner + copy **1.7** “Không mở được bàn…”). |
| **Hành động chính** | “Thêm vào giỏ” (+ số lượng); mở chi tiết món (sheet); chuyển tới **Giỏ hàng**. |

---

### Màn 2 — Giỏ hàng (khách, mobile-first)

| Khía cạnh | Nội dung |
|-----------|----------|
| **Mục tiêu** | Kiểm tra dòng đơn, chỉnh số lượng/ghi chú ngắn, **gửi đơn** lên Pi (bếp nhận qua RF); phù hợp **một Order active** — lần sau là bổ sung dòng. |
| **Thành phần chính** | Danh sách dòng (tên, đơn giá, stepper số lượng, xoá dòng); ô ghi chú đơn (1 dòng, placeholder **1.7**); tổng phụ; **Primary CTA** “Gửi đơn”; secondary “Quay lại thực đơn”. |
| **Trạng thái chính** | Giỏ rỗng (empty state theo **1.7** + link menu); có món chưa gửi; đang gửi (copy **1.7** + disable); gửi thành công (toast **1.7** + link tiếp tục gọi); lỗi server (retry + **1.7**). |
| **Hành động chính** | +/- số lượng; xoá dòng; **Gửi đơn**; quay menu để thêm món (cùng order). |

---

### Màn 3 — Tổng quan bàn (nhân viên / quản trị, dashboard-first)

| Khía cạnh | Nội dung |
|-----------|----------|
| **Mục tiêu** | Một nhìn toàn sảnh: bàn nào trống, đang phục vụ, chờ thanh toán, đã kết sổ; hỗ trợ **golden flow** và reset bàn sau SETTLED. |
| **Thành phần chính** | Thanh KPI nhỏ (số bàn OPEN / PAYMENT_REQUESTED / SETTLED); filter chip theo trạng thái; **lưới bàn** hoặc bảng: cột Bàn, Trạng thái (chip), Mã đơn active, Tổng tạm, thời gian cập nhật; hàng **quick action** (xem chi tiết đơn — link sau MVP, Reset bàn nếu policy cho phép). |
| **Trạng thái chính** | Loading; không có bàn cấu hình; lỗi API; một bàn `PAYMENT_REQUESTED` nổi bật màu `state.warning`. |
| **Hành động chính** | Lọc theo trạng thái; chọn bàn xem sidebar chi tiết (tuỳ vòng sau); **Reset bàn** (nếu đã SETTLED — khớp golden flow bước 15). |

---

### Màn 4 — Chờ thanh toán (nhân viên / quản trị, dashboard-first)

| Khía cạnh | Nội dung |
|-----------|----------|
| **Mục tiêu** | Danh sách các bàn đang **REQUESTED** / `PAYMENT_REQUESTED`, đối chiếu tổng VND nguyên (**D-18**), hỗ trợ vận hành song song với PIC quầy (lookup + paid) — web là gương soi trạng thái Pi. |
| **Thành phần chính** | Bảng: Bàn, Order ID, Tổng (`total_minor` hiển thị), thời điểm yêu cầu, trạng thái thanh toán; vùng chi tiết: vài dòng preview món (rút gọn); **banner chỉ đọc** (chốt tại PIC) + footer ghi chú Pi — **đã chốt A02.2:** không nút chốt tiền trên web. |
| **Trạng thái chính** | Không có yêu cầu chờ; có danh sách; một dòng **đang xử lý tại quầy** (tuỳ nhánh D-06); đã PAID (success row hoặc ẩn khỏi chờ). |
| **Hành động chính** | Làm mới danh sách; (tuỳ) xác nhận thủ công trên web cho demo khi PIC chưa nối; xem log thời gian. |

---

## 8. Component inventory (dùng chung)

| Component | Khách | Admin | Ghi chú MVP |
|-----------|-------|-------|-------------|
| `AppHeader` | ✓ | ✓ | Khách: bàn + back; Admin: title + user/demo |
| `StatusChip` | ✓ | ✓ | Map `state.*` + copy tiếng Việt ngắn |
| `PrimaryButton` / `SecondaryButton` | ✓ | ✓ | Touch 44px khách |
| `MenuItemCard` | ✓ | — | Ảnh (1.5), giá, tag (1.4), CTA thêm |
| `DishTag` | ✓ | — | Chip một dòng; không marketing sáo |
| `CategoryChips` (scroll) | ✓ | — | Nhãn theo mục 1.3 |
| `CartLineItem` | ✓ | — | Stepper, xoá |
| `StickySummaryBar` | ✓ | — | Tổng + nút giỏ |
| `EmptyState` | ✓ | ✓ | Minh hoạ flat illustration đơn giản hoặc icon |
| `Toast/Snackbar` | ✓ | ✓ | Gửi đơn, lỗi |
| `DataTable` + sortable header | — | ✓ | Tổng quan bàn, chờ thanh toán |
| `KPITile` | — | ✓ | Đếm trạng thái |
| `FilterBar` | — | ✓ | Chip trạng thái |
| `ConfirmDialog` | — | ✓ | Reset bàn, chốt tiền |

---

## 9. Prompt Stitch đã tinh chỉnh (enhance-prompt → D1) — bản 1.1 branding chay

*Sao chép từng khối vào Stitch MCP (stitch-design) với cùng một `projectId`. Giữ **PAGE STRUCTURE** 4 màn như cũ; bổ sung khối **BRAND / VISUAL TONE** để tránh UI generic.*

### Nhóm A — Khách (mobile-first, action-first)

```markdown
Thực đơn **nhà hàng chay** sau khi quét QR bàn — mobile web: **thanh sạch, tự nhiên, organic minimal**, ấm như quán chay nhỏ; **không** fine-dining, **không** stock “nhà hàng sang”, **không** mockup laptop/cityscape. Tập trung thao tác **Thêm món**; mọi món đều là **đồ chay** (rau, đậu, nấm, hạt — không gợi thịt).

**BRAND / VISUAL TONE (REQUIRED):**
- Keywords: calm vegetarian eatery, daylight food photography feel, ceramic bowls, light linen or pale wood surface, soft leaf line accents only where subtle
- Avoid: generic SaaS dashboard look, neon, gold chrome, heavy gradients, 3D glossy food, “steak” plant-based marketing shots

**DESIGN SYSTEM (REQUIRED):**
- Platform: Web, mobile-first (375–430px)
- Theme: Light, flat organic minimal; no large hero; no showcase gradients
- Background: Warm Canvas (#FAF7F2)
- Surface: White (#FFFFFF) for cards
- Primary Accent: Sage (#6B8F71) for primary buttons and key highlights
- Secondary Accent: Light Oak (#C4A882) for subtle dividers and small icons
- Text Primary: Soft Charcoal (#2C2C2C); Text Muted: Olive Gray (#5F665F)
- Typography: Poppins semibold for Vietnamese section titles; Inter for body and VND prices (tabular numbers)
- Buttons: 12px rounded corners, 44px min height, generous padding
- Cards: 12px rounded, 1px border (#D9D4CC), optional whisper shadow only
- Spacing: 16px screen gutters; 12–16px between cards
- Icons: thin organic line icons (single leaf motif), sage or oak tint — not generic office icons

**CONTENT (VI hints for generator):**
- Section title examples: “Hôm nay bếp có” or “Chọn món cho bàn của bạn”
- Category chips (examples): “Khai vị chay”, “Món nóng”, “Cơm — phần ăn”, “Bún — miến”, “Đồ uống”, “Tráng miệng chay”
- Dish names: natural Vietnamese (e.g. canh rau củ nấm, cơm chiên rau củ) — not vague English placeholders
- Tags on cards (short): “Thuần chay”, “Cay nhẹ”, “Không cay”, “Có đậu”, “Nóng” — no “premium organic” fluff

**PAGE STRUCTURE:** *(không đổi thứ tự / vai trò khối)*
1. **Sticky App Bar:** table name/code chip + small session status
2. **Category Chips:** horizontally scrollable filters (Vietnamese labels as above)
3. **Menu List:** vertical cards with realistic vegetarian food imagery or simple leaf-in-bowl line placeholder; Vietnamese dish name, VND price, small tag row, primary “Thêm” control
4. **Bottom Summary Bar:** item count + running total + tap to open cart
```

```markdown
Giỏ hàng đặt món **chay** trên mobile: rõ từng dòng, chỉnh số lượng dễ, **một** nút **Gửi đơn** nổi bật. Cùng tinh thần **organic minimal / quán chay thanh đạm** như màn Thực đơn — không dashboard look, không trang trí rườm.

**BRAND / VISUAL TONE (REQUIRED):**
- Same calm vegetarian canteen mood as menu screen; supportive microcopy in Vietnamese (empty: “Giỏ đang trống — chọn thêm món thanh đạm nhé?”; sending: “Đang gửi xuống bếp…”; success: “Đã gửi bếp — cảm ơn bạn, chúc ngon miệng!”; error: “Chưa gửi được — bấm thử lại hoặc nhờ nhân viên.”)
- Avoid generic empty-state stock characters; keep illustration flat and minimal if any

**DESIGN SYSTEM (REQUIRED):** *(cùng token màn Thực đơn — nhóm A)*

**PAGE STRUCTURE:** *(không đổi)*
1. **App Bar:** back + title “Giỏ hàng” + table chip
2. **Line Items:** list rows with dish name, unit price, quantity stepper, delete
3. **Note Field:** single-line optional order note; placeholder “Ghi chú cho bếp (không bắt buộc)”
4. **Totals:** subtotal in VND (integer display)
5. **Primary Footer CTA:** full-width “Gửi đơn”; secondary text button “Tiếp tục chọn món”
6. **States:** empty cart — minimal flat illustration (small leaf or bowl outline) + link back to menu
```

### Nhóm B — Nhân viên (dashboard-first)

```markdown
Dashboard **tổng quan bàn** cho nhân viên (nhà hàng chay — phiên bản vận hành demo): **dashboard-first**, dễ quét mắt; phong cách **flat organic minimal** (sage + kem + gỗ nhạt), **không** “admin template” dark neon, **không** glassmorphism. Tên sản phẩm có thể ghi nhẹ “chay” hoặc trung tính — ưu tiên **rõ trạng thái bàn / đơn**.

**BRAND / VISUAL TONE (REQUIRED):**
- Calm back-of-house tool for a small vegetarian restaurant; trust and clarity over branding flex
- Avoid premium hotel PMS aesthetics; keep warm neutrals, readable tables

**DESIGN SYSTEM (REQUIRED):**
- Platform: Web, desktop-first (1280px+)
- Theme: Light, calm operations dashboard, flat surfaces
- Background: Warm Canvas (#FAF7F2); Surface cards White (#FFFFFF)
- Primary Accent: Sage (#6B8F71) for primary actions
- Table stripes: Muted Sage (#EEF3EF)
- Status colors: Waiting payment chip background Sand (#F2E8CF); Settled success tint (#D6EAD9)
- Text/border: #2C2C2C / #D9D4CC
- Typography: Inter for tables; Poppins for page title (Vietnamese OK)
- Tables: sticky header, comfortable row height 48px

**PAGE STRUCTURE:** *(không đổi)*
1. **Top Bar:** product name + demo environment tag
2. **KPI Row:** counts for OPEN / PAYMENT_REQUESTED / SETTLED
3. **Filter Chips:** by table state
4. **Main Table:** columns Table, State chip, Active order id, Total VND, Last update
5. **Row Actions:** compact buttons (View — optional, Reset when allowed)
```

```markdown
Màn **Chờ thanh toán** cho nhân viên quầy / quản trị: tập trung các bàn **REQUESTED** / chờ quầy; đọc **tổng VND** rõ. Giữ **flat organic minimal**, bảng sạch; có thể có một dòng preview món **rút gọn** (tên tiếng Việt) — **không** cần ảnh món ở dashboard.

**BRAND / VISUAL TONE (REQUIRED):**
- Operational clarity first; Vietnamese column headers acceptable (“Bàn”, “Tổng (VNĐ)”, “Yêu cầu lúc”)
- Avoid decorative payment graphics; no fintech neon

**DESIGN SYSTEM (REQUIRED):** *(cùng token nhóm B)*

**PAGE STRUCTURE:** *(không đổi)*
1. **Header:** title “Chờ thanh toán” + refresh
2. **Table:** Table, Order ID, Total (VND), Requested time, Payment status
3. **Detail Drawer (optional):** 3–5 condensed line items for verification (Vietnamese dish names)
4. **Footer (đã chốt MVP A02.2):** **không** nút “Xác nhận đã thu”; chỉ banner + ghi chú đồng bộ Pi — chốt tiền tại PIC (`CMD_COUNTER_PAID`).
```

---

## 10. Điểm đã chốt (A02.2) & việc còn lại trước react-components

**Đã chốt triển khai UI (đồng bộ prompt + artifact D2):**

1. **Admin / thanh toán:** web admin **chỉ đọc** trạng thái thanh toán; **không** là nơi chốt tiền chính — màn **Chờ thanh toán** có banner PIC + footer ghi chú, **không** CTA “Xác nhận đã thu”.
2. **Payment:** MVP **không** dùng trạng thái trung gian `PENDING_AT_COUNTER` trên UI.
3. **Tên bàn:** hiển thị dạng **Bàn 01**, **Bàn 02** (hai chữ số) — artifact D2 đã dùng một phần; cần **edit** cho đồng nhất mọi màn (vd. giỏ vẫn “Bàn 03”).
4. **Auth admin:** LAN-only đơn giản — **chưa** thể hiện form đăng nhập phức tạp trên UI (chỉ tag “LAN” / môi trường demo).

**Đã xử lý thêm (A02.3 — `edit_screens`):**

- Ảnh món / thumbnail: hướng **món chay** hoặc placeholder tối giản; **không** chân dung người (theo prompt edit).
- Typography trong HTML artifact: link **Google Fonts Poppins + Inter** (kiểm tra file `01-…html`).
- Tổng quan bàn: giảm trang trí editorial, nhãn **Bàn 01** hai chữ số.
- Chờ thanh toán: giảm hero/showcase, giữ **read-only** + banner PIC.

**Còn mở trước D4 (react-components):**

- **Metadata theme Stitch** vẫn có thể ghi Plus Jakarta / “Tactile Sanctuary” trong JSON nội bộ — **code nên bám HTML artifact** đã tải về.
- **Canvas Stitch:** dọn các màn id cũ (A02.2) nếu nhóm muốn project gọn.
- **Trạng thái phụ:** empty cart / toast — vẫn **chưa** có màn riêng (đúng phạm vi 4 màn).
- **Đồng bộ Notion 04** (hex chi tiết) tuỳ owner.

---

## 11. Sẵn sàng cho bước react-components (D4)

- Token màu, spacing, radius, typography, mapping trạng thái đã gói gọn để map sang **Tailwind theme** + **shadcn/ui** (`Button`, `Card`, `Badge`, `Table`, `Sheet`, `Input`, `Dialog`).
- Bốn màn đã tách **thành phần** trùng component inventory; luồng khớp **golden-demo-flow** (gửi đơn, chờ thanh toán, reset bàn).
- Artifact HTML/PNG đã có trong `.stitch/designs/` (D2 — A02.2); agent A05/A02 chạy **react:components** theo `design-workflow.md` D4→D5.

---

*Tài liệu này là nguồn sự thật thiết kế cho pipeline Stitch → React trong monorepo đồ án Pi + PIC.*
