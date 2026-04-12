# AGENTS.md — Hướng dẫn cho AI / developer

## Project working mode

This project is MCP-first.

Always prefer using connected MCP tools when relevant:
- GitHub MCP for repo context, issues, PRs, and change tracking
- Notion MCP for architecture docs, decision log, roadmap, and task context — **entry point:** trang **[00_Control_Tower](https://www.notion.so/340278a6c1588185a1a2d0f4e4b0b739)** (đọc trước mỗi phiên chat mới khi cần vào guồng nhanh).

Do not assume local-only workflow when an MCP-backed source of truth exists.

Before major implementation:
1. **Notion MCP:** `fetch` trang **00_Control_Tower** (current phase, source of truth docs, active issues, next milestone, implementation constraints).
2. Read the latest relevant Notion spec/decision log (chi tiết theo link/đề cập từ Control Tower nếu có).
3. Check related GitHub issues/PR context.
4. Then modify code.

Do not create parallel sources of truth outside:
- docs in repo
- Notion workspace
- GitHub issues/PRs

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
