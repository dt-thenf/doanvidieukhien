# Đồ án — Hệ thống quản lý nhà hàng (Pi + PIC16F887 + NRF24)

## Mô tả ngắn
Hệ thống hỗ trợ vận hành nhà hàng mô hình demo: **Raspberry Pi** làm trung tâm (web, CSDL, logic nghiệp vụ); khách **quét QR từng bàn** để đặt món qua **web**; **một** vi điều khiển **PIC16F887** phục vụ **bếp** (buzzer, LCD, nút) và **quầy** (keypad 4×4, LCD); Pi và PIC giao tiếp qua **NRF24L01**. **Không** có thêm MCU tại bàn.

## Giai đoạn hiện tại
**Đã có** backend Pi (`pi-backend/`), hai web (`customer-web/`, `admin-web/`), tài liệu API/DB trong `docs/architecture/`, và skeleton firmware PIC. **Debug:** route `/api/v1/dev/*` và JSON ingress chỉ khi bật chế độ debug/lab — xem `docs/architecture/source-of-truth.md` và `pi-backend/README.md` (không thay thế luồng PIC thật trong demo đồ án).

## Đọc gì trước (onboarding)
1. [`AGENTS.md`](AGENTS.md) — ràng buộc Pi + một PIC + NRF.
2. [`docs/architecture/source-of-truth.md`](docs/architecture/source-of-truth.md) — doc nào là chính, doc nào mirror, artifact Stitch nào chốt.
3. [`docs/architecture/stack-decision.md`](docs/architecture/stack-decision.md) — stack kỹ thuật.
4. [`docs/decisions/decision-log.md`](docs/decisions/decision-log.md) — quyết định đã khóa (D-xx).

## Cấu trúc thư mục
| Đường dẫn | Nội dung |
|-----------|----------|
| `docs/planning/` | Brief, PRD, backlog tổng quan |
| `docs/architecture/` | Kiến trúc, API, DB, ingress, **source-of-truth** |
| `docs/decisions/` | Nhật ký quyết định kỹ thuật (SoT) |
| `restaurant-pi-pic/docs/` | Bundle planning + mirror một số doc; xem `source-of-truth.md` |
| `pi-backend/` | FastAPI backend |
| `customer-web/`, `admin-web/` | React (Vite) |
| `.stitch/` | Design system + HTML/PNG màn hình chốt (A02.3) |
| `AGENTS.md` | Ràng buộc cố định và quy tắc cho agent |

## Liên kết nhanh
- [Brief dự án](docs/planning/project-brief.md)
- [PRD](docs/planning/prd.md)
- [Kiến trúc hệ thống](docs/architecture/system-architecture.md)
- [Nguồn sự thật (doc)](docs/architecture/source-of-truth.md)
