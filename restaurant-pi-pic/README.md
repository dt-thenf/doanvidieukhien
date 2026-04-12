# Đồ án: Quản lý nhà hàng (Raspberry Pi + PIC16F887 + NRF24L01)

Pi: web, CSDL, logic đơn/bàn/thanh toán. Một PIC16F887: bếp (buzzer, LCD, nút) và quầy (keypad 4×4, LCD). Khách quét QR theo bàn, không MCU tại bàn.

## Tài liệu quy hoạch (control tower)

| Tài liệu | Nội dung |
|----------|----------|
| [PROJECT-SUMMARY.md](docs/planning/PROJECT-SUMMARY.md) | Tóm tắt 1 trang |
| [ROADMAP.md](docs/planning/ROADMAP.md) | Roadmap theo giai đoạn |
| [SPECIALIST-CHATS.md](docs/planning/SPECIALIST-CHATS.md) | Chat chuyên môn nên mở tiếp |
| [DEFINITION-OF-DONE.md](docs/planning/DEFINITION-OF-DONE.md) | DoD tổng |
| [DEMO-CHECKLIST.md](docs/planning/DEMO-CHECKLIST.md) | Checklist demo cuối |

## Thư mục khác

- **SoT kiến trúc/API (đọc trước):** [`docs/architecture/source-of-truth.md`](../docs/architecture/source-of-truth.md) trên root repo — thư mục này là **mirror/bundle planning**, không thay vai trò `docs/` root.
- `docs/architecture/` — sơ đồ, luồng hệ thống (xem [`docs/architecture/README.md`](docs/architecture/README.md) về file trùng tên với root)
- `docs/decisions/` — mirror `decision-log.md` đồng bộ với root
- `AGENTS.md` — ràng buộc & hành vi agent
