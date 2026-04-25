# Kiến trúc hệ thống — Pi · PIC · NRF24L01

## Nguyên tắc
- **Pi = nguồn sự thật** cho dữ liệu và luồng nghiệp vụ.
- **PIC = giao diện vật lý** tại bếp và quầy; không thay Pi làm logic trung tâm.
- **NRF24L01 = kênh vận chuyển** gói tin ngắn giữa Pi và PIC.

## Raspberry Pi
- Web server + API cho khách và admin.
- Cơ sở dữ liệu và logic: bàn/phiên, menu, đơn, thanh toán.
- Sinh QR theo bàn; điều phối trạng thái sau lệnh hợp lệ từ web hoặc PIC.

## PIC16F887 (duy nhất)
- **Bếp:** buzzer, **OLED 0.96" SSD1306**, nút (ví dụ xem / chuyển / hoàn thành-thoát).
- **Quầy:** keypad 4×4, **OLED 0.96" SSD1306** (tra cứu, xác nhận thu tiền).
- Một PIC điều khiển **hai cụm** IO — cần thiết kế rõ **chế độ** bếp/quầy trên firmware.

## NRF24L01
- Liên kết **điểm–điểm** Pi ↔ PIC (đồ án).
- Gói tin có **mã lệnh** + **định danh** bàn/đơn + payload rút gọn; ACK/retry mức tối thiểu (chốt sau).

## Khối chức năng (tổng quan)
```
[Điện thoại khách] --QR/web--> [Raspberry Pi : Web + DB + logic]
                                   |
                            NRF24L01
                                   |
                             [PIC16F887]
                            /          \
                    [Bếp IO]        [Quầy IO]
```

## Ràng buộc cố định (nhắc lại)
- Không MCU tại bàn; một PIC; Pi trung tâm; NRF giữa Pi và PIC.
