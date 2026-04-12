# Backlog tổng quan — 4 luồng công việc

## 1. Customer web (web khách)
- Trang theo bàn (QR); menu; giỏ tối thiểu; gửi đơn.
- Yêu cầu thanh toán; hiển thị trạng thái đơn ở mức demo (nếu có thời gian).
- Xử lý lỗi mạng / thông báo chung.

## 2. Admin web (web quản trị)
- Đăng nhập đơn giản (tuỳ chọn).
- CRUD món, bàn, liên kết QR.
- Xem danh sách đơn; reset/đóng phiên phục vụ demo.

## 3. Pi backend (dịch vụ trên Raspberry Pi)
- API nghiệp vụ: phiên, đơn, thanh toán (chi tiết spec sau).
- Lưu trữ dữ liệu demo; seed dữ liệu.
- Cổng/logic nhận lệnh từ PIC qua NRF (thiết kế gói tin sau).
- Logging phục vụ debug demo.

## 4. PIC firmware (PIC16F887)
- Khởi tạo ngoại vi: LCD bếp/quầy, buzzer, nút, keypad 4×4.
- Giao tiếp NRF24 với Pi; parse lệnh; debounce.
- **Chế độ bếp** và **chế độ quầy** (chuyển chế độ rõ ràng).
- Hiển thị lỗi mất kết nối Pi (tối thiểu).
