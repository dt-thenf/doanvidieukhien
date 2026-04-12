# Architecture

**Nguồn sự thật & mirror:** `source-of-truth.md` (đọc trước khi chỉnh doc trùng lặp giữa root và `restaurant-pi-pic/`).

- **Pi ↔ PIC binary `v1`:** `pi-pic-protocol.md` (hợp đồng frame 32 byte, `MSG_TYPE`, `table_code`).
- **Ingress backend:** `pic-ingress.md`, `pi-backend-flow.md`.
- **API:** `api-contract.md`; schema: `db-schema.md`.

Tổng quan hệ thống và luồng QR → bếp → thanh toán: `system-architecture.md`. Bản handoff/luồng demo chi tiết: `restaurant-pi-pic/docs/architecture/golden-demo-flow.md` (**mirror narrative**, không thay SoT root cho API/DB).
