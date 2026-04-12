from enum import Enum


class TableState(str, Enum):
    """Trạng thái bàn — khớp DESIGN.md + decision-log (không dùng PENDING_AT_COUNTER ở MVP này)."""

    IDLE = "IDLE"
    OPEN = "OPEN"
    PAYMENT_REQUESTED = "PAYMENT_REQUESTED"
    SETTLED = "SETTLED"


class OrderStatus(str, Enum):
    NEW = "NEW"
    IN_KITCHEN = "IN_KITCHEN"
    DONE = "DONE"


class PaymentStatus(str, Enum):
    NONE = "NONE"
    REQUESTED = "REQUESTED"
    PAID = "PAID"
