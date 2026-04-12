# AGENTS.md — Hướng dẫn cho AI / developer

## Ràng buộc cố định (không được thay đổi)
- **Một** vi điều khiển **PIC16F887** cho toàn hệ thống; **không** thêm MCU tại từng bàn.
- **Raspberry Pi** là trung tâm: web, cơ sở dữ liệu, logic nghiệp vụ (nguồn sự thật).
- Khách đặt món qua **web** sau khi **quét QR theo bàn**.
- PIC đảm nhiệm **bếp** (buzzer, LCD, nút) và **quầy** (keypad 4×4, LCD).
- Liên kết Pi ↔ PIC chỉ qua **NRF24L01** (mô hình đồ án, ưu tiên đơn giản và demo).
- Phạm vi **đồ án / demo**: giữ đơn giản, dễ bảo vệ, không mở rộng đa chi nhánh hay thanh toán thực tế phức tạp.

## Hành vi mong muốn của agent
- Đọc `docs/` trước khi đề xuất thay đổi lớn.
- **Không** viết mã triển khai khi chưa được yêu cầu rõ (giai đoạn này ưu tiên tài liệu).
- **Không** bịa schema DB, OpenAPI hay mã firmware nếu chưa có trong repo.
- Mọi thay đổi phải **khớp** các ràng buộc trên; nếu có xung đột, dừng lại và hỏi người dùng.

## Không được tự ý đổi
- Kiển trúc **Pi trung tâm + một PIC + NRF** và **không MCU tại bàn**.
- Ranh giới trách nhiệm: nghiệp vụ trên Pi; PIC là giao diện vật lý + lệnh ngắn.
- Mục tiêu **demo-friendly** (đơn giản, rõ luồng).
