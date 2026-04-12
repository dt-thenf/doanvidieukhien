# AGENTS.md — Restaurant (Raspberry Pi + PIC16F887)

## Project scope
Student project: restaurant management and table ordering via **QR → web on Raspberry Pi**; **one PIC16F887** for **kitchen** and **counter** peripherals; **NRF24L01** link between Pi and PIC.

## Fixed constraints
- Single PIC16F887 (no MCU at each table).
- Pi: web, API, database, business logic.
- PIC: LCD/buzzer/buttons (kitchen), keypad+LCD (counter); no cloud scope required.

## Agent rules
- Prefer small, reviewable changes; no large refactors without request.
- Do **not** add application implementation until architecture/docs are in place (unless explicitly asked).
- Keep docs under `docs/planning`, `docs/architecture`, `docs/decisions` updated when behavior or boundaries change.

## Where to look
- `README.md` — orientation.
- `docs/planning/` — backlog, milestones (stubs).
- `docs/architecture/` — system boundaries, flows (stubs).
- `docs/decisions/` — ADR-style notes (stubs).
