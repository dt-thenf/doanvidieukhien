# PRD ngắn — Nhà hàng Pi + PIC

## Actors
| Actor | Vai trò |
|--------|---------|
| Khách | Quét QR bàn, xem menu, gửi đơn, yêu cầu thanh toán. |
| NV bếp | Nhận báo đơn, xem/chuyển đơn, xác nhận hoàn thành (PIC). |
| NV quầy | Tra cứu bàn/đơn, xem tổng, xác nhận đã thu tiền (PIC). |
| Quản trị | Cấu hình menu, bàn, QR/URL tối thiểu; xem đơn phục vụ demo. |
| Pi | Lưu trữ, API, chuyển trạng thái hợp lệ, sinh QR. |
| PIC | IO bếp + quầy; gửi/nhận gói tin với Pi. |

## Tính năng lõi
1. **Phiên bàn + QR:** mở web đúng bàn; Pi tạo/kích hoạt phiên.
2. **Menu & đơn:** khách chọn món, gửi đơn; Pi lưu trạng thái đơn.
3. **Bếp:** báo có đơn mới; xem danh sách/hàng đợi rút gọn; hoàn thành đơn.
4. **Quầy:** tra cứu theo mã; xác nhận thanh toán.
5. **Admin:** CRUD món/bàn; reset bàn cho demo.

## User stories (rút gọn)
- **Là khách**, tôi muốn quét QR bàn để đặt món và gửi đơn tới bếp.
- **Là khách**, tôi muốn bấm yêu cầu thanh toán khi xong bữa.
- **Là NV bếp**, tôi muốn thấy/cập nhật đơn cần làm trên thiết bị PIC.
- **Là NV quầy**, tôi muốn tra cứu bàn/đơn và xác nhận đã thu tiền.
- **Là quản trị**, tôi muốn cập nhật menu và bàn phục vụ buổi demo.
