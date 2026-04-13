# Giao thức Pi ↔ PIC (mức demo đồ án)

> **Lưu ý source of truth (SoT):** bản chốt wire-level (MSG_TYPE hex + frame 32 byte + payload CMD_*) nằm ở  
> `docs/architecture/pi-pic-protocol.md` (root repo).  
> File mirror trong `restaurant-pi-pic/docs/` có thể **lag** và chỉ dùng để bundle tài liệu; khi có mâu thuẫn, **ưu tiên bản root**.

Tài liệu này chốt **một phương án duy nhất** phục vụ demo: đơn giản, dễ log, dễ bảo vệ. Không mô tả code triển khai.

**Tham chiếu nội bộ repo:** `AGENTS.md`, `docs/decisions/decision-log.md` (**D-2026-04-12-16** đến **D-2026-04-12-19**), `docs/architecture/PRODUCT_HANDOFF.md`, `docs/planning/ROADMAP.md`.

---

## 1. Nguyên tắc cố định

| Nguyên tắc | Nội dung |
|------------|----------|
| Nguồn sự thật | Mọi trạng thái nghiệp vụ (bàn, đơn, thanh toán) do **Pi** quyết định sau khi nhận lệnh hợp lệ từ web hoặc PIC. |
| Vai trò PIC | **I/O thời gian thực** (LCD, buzzer, nút, keypad); gửi **lệnh ý định**, nhận **xác nhận + dữ liệu hiển thị**. |
| Transport | **NRF24L01** — coi là kênh **không tin cậy**; bắt buộc có **seq + ACK/NACK + timeout/retry tối thiểu**. |
| Giới hạn vật lý | Payload mỗi gói **≤ 32 byte** (theo giới hạn phổ biến của NRF24). Demo **không** phân mảnh gói; nội dung dài (chi tiết món) được **rút gọn** hoặc chỉ gửi **mã định danh** để PIC hiển thị tối thiểu. |
| Đơn theo bàn (demo) | **D-2026-04-12-16:** trong phiên mở, **tối đa một** Order ở trạng thái `NEW` / `IN_KITCHEN`; gọi thêm món chỉ **bổ sung dòng** vào Order đó (cùng `order_id`). |

**Phương án được chọn:** mô hình **lệnh có trả lời** (PIC→Pi và Pi→PIC đều có thể gửi tin cần đối chiếu `seq`), kết hợp **tin đẩy** từ Pi→PIC cho sự kiện time-sensitive (đơn mới, thanh toán chờ). *Lý do:* phù hợp đồ án (dễ debug log trên Pi), tránh phụ thuộc vào “PIC luôn kéo đúng chu kỳ” mà vẫn báo được đơn mới nhanh.

---

## 2. Khung gói tin (frame) — phiên bản giao thức `v1`

Mọi gói đều có **header 4 byte** chung, phần còn lại là **payload** (tối đa 28 byte).

| Offset | Trường | Kiểu | Mô tả |
|--------|--------|------|--------|
| 0 | `VER` | `u8` | Phiên bản giao thức. Demo: **1**. |
| 1 | `MSG_TYPE` | `u8` | Mã loại bản tin (bảng mục 3). |
| 2 | `SEQ` | `u8` | Số thứ tự 0–255, **tăng mỗi lần gửi một “phiên giao dịch”** phía gửi. Dùng ghép cặp request/response và phát hiện trùng. |
| 3 | `FLAGS` | `u8` | Bit ý nghĩa (mở rộng sau). Demo tối thiểu: `0x00`. Bit dự phòng gợi ý: `0x01` = yêu cầu ACK (mặc định **bật** cho mọi `CMD_*` và `ACK_*`/`NACK_*`); có thể bỏ qua nếu triển khai coi ACK luôn bật cho CMD. |
| 4..31 | `PAYLOAD` | bytes | Cấu trúc theo từng `MSG_TYPE`. |

**Quy ước endian:** số đa byte dùng **little-endian** (phù hợp thói quen PIC/Pi phổ biến).

**Ghép cặp:** Response của Pi (hoặc PIC) **lặp lại cùng `SEQ`** với request kích hoạt.

---

## 3. Danh sách loại bản tin (`MSG_TYPE`)

Giá trị số cụ thể có thể gán trong code; ở đây cố định **tên** để thống nhất tài liệu.

### 3.1. Hệ thống / liên kết

| Tên | Hướng chủ đạo | Mục đích tối thiểu |
|-----|----------------|---------------------|
| `PING` | PIC → Pi | Kiểm tra kênh; Pi bắt buộc trả `PONG` cùng `SEQ`. |
| `PONG` | Pi → PIC | Trả lời `PING`. |
| `ACK` | Pi → PIC | Xác nhận đã áp dụng lệnh PIC (kèm payload ngắn nếu cần). |
| `NACK` | Pi → PIC | Từ chối lệnh (mã lỗi ngắn). |

### 3.2. Bếp (kitchen)

| Tên | Hướng chủ đạo | Mục đích |
|-----|----------------|----------|
| `EVT_ORDER_NEW` | Pi → PIC | Có đơn mới / cập nhật đáng kể cho bếp (kích buzzer + LCD). |
| `CMD_KITCHEN_DONE` | PIC → Pi | Bếp xác nhận **hoàn thành** một đơn (định danh đơn trong payload). |
| `CMD_KITCHEN_GET_QUEUE` | PIC → Pi | (Tuỳ chọn demo) PIC xin **đầu hàng đợi** rút gọn; Pi trả trong `ACK` hoặc tin riêng. *Khuyến nghị demo:* có thể bỏ nếu Pi luôn `EVT_ORDER_NEW` đủ. |

### 3.3. Quầy (counter)

| Tên | Hướng chủ đạo | Mục đích |
|-----|----------------|----------|
| `EVT_PAYMENT_PENDING` | Pi → PIC | Có yêu cầu thanh toán cần quầy xử lý (nhắc LCD). |
| `CMD_COUNTER_LOOKUP` | PIC → Pi | Tra cứu theo **`table_id` (mặc định demo)** hoặc theo `order_id` (tuỳ chọn, không phải luồng mặc định) — payload mục 4.5. |
| `CMD_COUNTER_PAID` | PIC → Pi | Quầy xác nhận **đã thu tiền** / chốt thanh toán. |

> Ghi chú: có thể gom `EVT_PAYMENT_PENDING` với thông báo chung “có sự kiện quầy” nếu firmware đơn giản; tên tách riêng giúp ánh xạ state machine rõ ràng.

---

## 4. Payload tối thiểu theo bản tin

Quy ước định danh demo (đủ cho báo cáo, không đi sâu DB):

| Trường | Ý nghĩa |
|--------|---------|
| `table_id` | `u16` — mã bàn nội bộ. |
| `order_id` | `u32` — mã đơn nội bộ. |
| `err_code` | `u8` — mã lỗi gọn (vd: không tìm thấy, trạng thái không hợp lệ, trùng thao tác). |
| `total_minor` | `u32` — **số nguyên VND (đồng)** theo **D-2026-04-12-18**; không nhân hệ số (vd không dùng “cents ×100”). |
| `line_preview` | Chuỗi cực ngắn hoặc bỏ qua nếu không đủ byte — ưu tiên hiển thị **bàn + id đơn + tổng**. |

### 4.1. `PING` / `PONG`

- Payload demo: **0 byte** hoặc 1 byte `device_role` (0=bếp UI đang active, 1=quầy) nếu muốn Pi log phân biệt.

### 4.2. `EVT_ORDER_NEW` (Pi → PIC)

Tối thiểu: `order_id (u32)` + `table_id (u16)` = 6 byte.  
Tuỳ chọn thêm: `flags_order (u8)` (vd lần báo đầu / **cập nhật cùng Order** khi khách bổ sung dòng — vẫn **một** `order_id` active trên bàn theo **D-2026-04-12-16**).

**Pi — gửi lại tin (D-2026-04-12-19):** sau lần phát đầu, Pi được **gửi lại tối đa một lần** cùng nội dung logic (cùng sự kiện nghiệp vụ), sau backoff cố định ~100–200 ms, nếu triển khai cần tăng xác suất PIC nhận được gói. Không lặp thêm.

### 4.3. `CMD_KITCHEN_DONE` (PIC → Pi)

Tối thiểu: `order_id (u32)`.

### 4.4. `EVT_PAYMENT_PENDING` (Pi → PIC)

Tối thiểu: `table_id (u16)` + `order_id (u32)` — với **D-2026-04-12-16**, `order_id` là đơn **active duy nhất** của bàn tại thời điểm yêu cầu thanh toán (payload vẫn mang cả hai trường để PIC/ log rõ ràng).

**Pi — gửi lại tin (D-2026-04-12-19):** cùng quy tắc **tối đa một lần** gửi lại như mục 4.2.

### 4.5. `CMD_COUNTER_LOOKUP` (PIC → Pi)

Payload: `lookup_kind (u8)` — `0` = theo `table_id` (**mặc định demo — D-2026-04-12-17**), `1` = theo `order_id` (không dùng cho kịch bản quầy mặc định); tiếp theo là `u16` hoặc `u32` tương ứng.  
Pi trả kết quả trong **`ACK`**: `table_id`, `order_id`, `total_minor` (**VND nguyên**, D-18), `payment_state` (byte enum rút gọn).

### 4.6. `CMD_COUNTER_PAID` (PIC → Pi)

Tối thiểu: `table_id (u16)`; tuỳ triển khai có thể thêm `order_id (u32)` để khớp cứng với đơn đang chờ thanh toán — với **D-16**, tại một thời điểm chỉ có một Order active nên `table_id` thường đủ cho demo.

### 4.7. `ACK` / `NACK`

- `ACK`: có thể mang **snapshot ngắn** cho LCD (vd tổng tiền + trạng thái).  
- `NACK`: bắt buộc `err_code (u8)`; tuỳ chọn thêm 1 byte `reason_sub`.

---

## 5. Quy tắc gửi / nhận

1. **PIC không tự chuyển trạng thái nghiệp vụ** — chỉ gửi `CMD_*`; chỉ sau khi Pi xử lý và (tuỳ trường hợp) gửi `ACK`, domain trên Pi mới đổi.  
2. **Pi có thể gửi `EVT_*` bất cứ lúc nào** khi web hoặc logic nội bộ sinh sự kiện; PIC chỉ cần **hàng đợi tin nhận** và hiển thị theo mức ưu tiên (đơn mới bếp vs thanh toán quầy — xem `golden-demo-flow.md`).  
3. **Ưu tiên hiển thị demo (gợi ý):** nếu PIC đang ở chế độ **Bếp**, vẫn nhận `EVT_PAYMENT_PENDING` nhưng **chỉ báo nhẹ** (LED/icon hoặc 1 dòng status); khi chuyển sang **Quầy** mới hiển thị chi tiết. Ngược lại tương tự. Mục tiêu: tránh “mất sự kiện” nhưng không làm phức tạp một LCD.  
4. **Idempotency:** Pi xử lý `CMD_*` theo `order_id`/`table_id`; nếu lệnh lặp do retry, trả `ACK` an toàn (không tạo hiệu ứng phụ hai lần) hoặc `NACK` “đã xử lý” với mã riêng — chốt một hành vi trong triển khai và ghi vào `decision-log.md`.

---

## 6. ACK / NACK tối thiểu

| Tình huống | Hành vi |
|------------|---------|
| `CMD_*` từ PIC | Pi **phải** trả `ACK` hoặc `NACK` với **cùng `SEQ`**. |
| `PING` | Pi **phải** trả `PONG` cùng `SEQ`. |
| `EVT_*` từ Pi | Demo tối thiểu: **không bắt buộc** ACK từ PIC→Pi; nếu cần chắc chắn hơn (should-have), thêm `CMD_EVT_RECEIVED` — **ngoài phạm vi tối thiểu** trong tài liệu này. |

---

## 7. Timeout và retry tối thiểu (phía PIC)

| Tham số | Giá trị đề xuất (demo) |
|---------|-------------------------|
| Timeout chờ `ACK`/`PONG` | **150–300 ms** (chọn một giá trị cố định trong code, vd 250 ms). |
| Số lần retry | **3** lần (tổng cộng 4 phát sinh gồm lần đầu). |
| Khoảng cách retry | **Cố định 50–100 ms** backoff ngắn (tránh nghẽn kênh). |
| Sau khi hết retry | PIC hiển thị trạng thái **“Mất liên lạc Pi”**; không tự suy luận nghiệp vụ. |

**Phía Pi (bổ sung cho `EVT_*`):** log `SEQ`, thời điểm, và hướng tin. Đối với **`EVT_ORDER_NEW`** và **`EVT_PAYMENT_PENDING`**, áp dụng **gửi lại tối đa một lần** sau backoff cố định ngắn (**D-2026-04-12-19**; chi tiết mục 4.2 và 4.4). Các loại `EVT_*` khác không mở rộng retry trong phạm vi demo tối thiểu trừ khi có quyết định mới trong `decision-log.md`.

---

## 8. Gói tin ngoài phạm vi demo tối thiểu (để mở rộng sau)

- Phân mảnh payload, mã hóa, chữ ký gói tin.  
- Đồng bộ đồng hồ chính xác.  
- Nén danh sách món đầy đủ qua RF (thay bằng tra cứu trên web admin).

---

*Tài liệu này là “hợp đồng” mức demo giữa agent kiến trúc và các agent triển khai Pi/PIC.*
