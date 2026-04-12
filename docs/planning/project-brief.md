# Project brief — Hệ thống nhà hàng (Pi + PIC16F887 + NRF24)

## Tóm tắt
Đồ án xây dựng hệ thống **quản lý và hỗ trợ vận hành nhà hàng** tập trung vào **đặt món theo bàn qua QR**, xử lý đơn và thanh toán có xác nhận tại quầy, với **Raspberry Pi** làm trung tâm và **một PIC16F887** cho giao diện vật lý bếp/quầy, liên kết **NRF24L01**.

## Mục tiêu
- Demo **đầu cuối** rõ ràng: khách đặt → bếp xử lý → thanh toán tại quầy.
- Giảm phức tạp: **không** MCU tại bàn, **một** PIC, ưu tiên tài liệu và luồng dễ hiểu.

## Phạm vi (in-scope)
- Web khách (QR theo bàn), web quản trị tối thiểu, backend trên Pi.
- Firmware PIC: bếp (buzzer, LCD, nút) + quầy (keypad, LCD).
- Kênh RF Pi–PIC ở mức đủ demo (gói tin rút gọn, xử lý lỗi cơ bản).

## Ngoài phạm vi (out-of-scope)
- Thanh toán online/PCI thực tế, đa chi nhánh, đồng bộ đám mây.
- Ứng dụng mobile native; thêm MCU tại bàn hoặc thêm PIC thứ hai.
- Tối ưu sản phẩm thương mại đầy đủ (chỉ cấp độ đồ án).
