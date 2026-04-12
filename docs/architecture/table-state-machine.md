# State machine — Bàn / phiên phục vụ

> Mô hình **phiên (session)** gắn với **bàn** sau khi khách mở web qua QR. Pi giữ trạng thái chính.

## Trạng thái
| Trạng thái | Ý nghĩa ngắn |
|------------|----------------|
| **IDLE** | Chưa có phiên khách đang mở. |
| **OPEN** | Phiên đang mở; cho phép đặt món (theo luật đơn). |
| **PAYMENT_REQUESTED** | Khách yêu cầu thanh toán; chờ quầy xử lý. |
| **SETTLED** | Đã chốt thanh toán; chờ đưa bàn về trạng thái sẵn sàng. |

## Chuyển trạng thái (chuẩn demo)
1. `IDLE` → `OPEN` — QR mở phiên hợp lệ.
2. `OPEN` → `OPEN` — gửi / cập nhật đơn trong phiên.
3. `OPEN` → `PAYMENT_REQUESTED` — khách yêu cầu thanh toán.
4. `PAYMENT_REQUESTED` → `SETTLED` — quầy xác nhận đã thu (đồng bộ với luồng thanh toán).
5. `SETTLED` → `IDLE` — reset bàn (admin hoặc quy trình dọn sau demo).

## Ngoại lệ (tuỳ chính sách)
- Hủy phiên từ admin; hủy yêu cầu thanh toán — chỉ nên dùng nếu cần thiết cho demo.

## Ghi chú
- **Không** có MCU tại bàn: mọi nhận diện bàn dựa vào **QR / token phiên** do Pi cấp.
