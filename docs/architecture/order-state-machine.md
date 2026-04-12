# State machine — Đơn hàng (Order)

> Trạng thái **nguồn sự thật** nằm trên **Raspberry Pi**. PIC chỉ phản ánh thao tác/lệnh hợp lệ.

## Trạng thái
| Trạng thái | Ý nghĩa ngắn |
|------------|----------------|
| **NEW** | Đơn vừa được tạo sau khi khách gửi từ web. |
| **IN_KITCHEN** | Đơn đang được bếp xử lý (có thể gộp bước tiếp nhận tự động khi demo). |
| **DONE** | Bếp xác nhận hoàn thành (món/đơn theo quy ước demo). |
| **CANCELLED** | Hủy trước khi hoàn thành (ít dùng; tuỳ chính sách). |

## Chuyển trạng thái (chuẩn demo)
1. `NEW` → `IN_KITCHEN` — khi hệ thống tiếp nhận đơn (tự động hoặc sau bước xác nhận nếu có).
2. `IN_KITCHEN` → `DONE` — khi nhận lệnh hoàn thành hợp lệ (từ PIC bếp → Pi).
3. `NEW` / `IN_KITCHEN` → `CANCELLED` — chỉ khi có luật hủy rõ ràng (demo có thể bỏ qua).

## Ghi chú
- Chi tiết điều kiện chuyển trạng thái (validation) sẽ được **chốt khi thiết kế API**; tài liệu này chỉ cố định **vòng đời** ở mức đồ án.
