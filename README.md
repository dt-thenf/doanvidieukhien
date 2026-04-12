# Đồ án — Hệ thống quản lý nhà hàng (Pi + PIC16F887 + NRF24)

## Mô tả ngắn
Hệ thống hỗ trợ vận hành nhà hàng mô hình demo: **Raspberry Pi** làm trung tâm (web, CSDL, logic nghiệp vụ); khách **quét QR từng bàn** để đặt món qua **web**; **một** vi điều khiển **PIC16F887** phục vụ **bếp** (buzzer, LCD, nút) và **quầy** (keypad 4×4, LCD); Pi và PIC giao tiếp qua **NRF24L01**. **Không** có thêm MCU tại bàn.

## Giai đoạn hiện tại
**Nền tài liệu** — đã có cấu trúc `docs/` và mô tả kiến trúc/luồng ở mức khởi đầu; **chưa** triển khai mã ứng dụng, schema DB, API chi tiết hay firmware.

## Cấu trúc thư mục
| Đường dẫn | Nội dung |
|-----------|----------|
| `docs/planning/` | Brief, PRD, backlog tổng quan |
| `docs/architecture/` | Kiến trúc, state machine đơn/bàn/thanh toán |
| `docs/decisions/` | Nhật ký quyết định kỹ thuật |
| `AGENTS.md` | Ràng buộc cố định và quy tắc cho agent |

## Liên kết nhanh
- [Brief dự án](docs/planning/project-brief.md)
- [PRD](docs/planning/prd.md)
- [Kiến trúc hệ thống](docs/architecture/system-architecture.md)
