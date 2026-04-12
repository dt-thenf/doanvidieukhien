# Decision log — Quyết định đã chấp nhận (ban đầu)

> Ghi lại các lựa chọn **đã thống nhất** cho đồ án. Khi thay đổi, thêm mục mới kèm ngày và lý do.

## Đã chấp nhận
1. **Kiến trúc tổng thể:** Raspberry Pi làm trung tâm (web + CSDL + logic); một PIC16F887; NRF24L01 làm kênh Pi–PIC.
2. **Không MCU tại bàn:** khách chỉ dùng điện thoại + QR + web.
3. **Một PIC cho hai cụm IO:** bếp (buzzer, LCD, nút) và quầy (keypad 4×4, LCD) — firmware phải có **chế độ** rõ ràng.
4. **Phạm vi đồ án:** ưu tiên đơn giản, dễ demo; không mở rộng đa chi nhánh hay thanh toán trực tuyến thật.
5. **Nguồn sự thật trên Pi:** mọi trạng thái nghiệp vụ có nghĩa do Pi quyết định sau lệnh hợp lệ từ web hoặc PIC.

## Để mở rộng sau (chưa chốt kỹ thuật)
- Danh sách mã lệnh RF và giới hạn payload.
- Một phiên cho phép một hay nhiều đơn; điều kiện cho phép thanh toán.
- Cơ chế ACK/retry và timeout RF mức tối thiểu.

---
*Khởi tạo: nền tài liệu đồ án — chưa có schema DB hay OpenAPI trong repo.*
