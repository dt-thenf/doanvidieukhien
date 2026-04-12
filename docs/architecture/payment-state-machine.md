# State machine — Thanh toán (Payment)

> Thanh toán **thực tế tiền mặt/chuyển khoản** ngoài hệ thống; Pi chỉ ghi nhận **trạng thái** và xác nhận từ quầy.

## Trạng thái
| Trạng thái | Ý nghĩa ngắn |
|------------|----------------|
| **NONE** | Chưa có yêu cầu thanh toán cho phiên/bàn liên quan. |
| **REQUESTED** | Khách gửi yêu cầu thanh toán từ web. |
| **PENDING_AT_COUNTER** | Quầy đang tra cứu / xử lý (tuỳ triển khai UI PIC). |
| **PAID** | Quầy xác nhận đã thu tiền; Pi chốt. |

## Chuyển trạng thái (chuẩn demo)
1. `NONE` → `REQUESTED` — khách bấm yêu cầu thanh toán.
2. `REQUESTED` → `PENDING_AT_COUNTER` — (tuỳ chọn) khi quầy mở tra cứu hoặc hệ thống đánh dấu đang xử lý.
3. `PENDING_AT_COUNTER` → `PAID` — quầy xác nhận đã thu.
4. Khi `PAID` — đồng bộ **bàn** sang `SETTLED` (xem `table-state-machine.md`).

## Ghi chú
- Không mô tả cổng thanh toán thật; không PCI.
- Điều kiện hợp lệ (ví dụ không cho thanh toán khi chưa có đơn) sẽ chốt khi có **API**; tài liệu này chỉ mô tả **vòng đời**.
