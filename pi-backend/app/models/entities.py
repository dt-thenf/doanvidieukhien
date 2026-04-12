from datetime import datetime
from typing import Optional

from sqlalchemy import Column
from sqlalchemy import Enum as SAEnum
from sqlmodel import Field, SQLModel

from app.core.enums import OrderStatus, PaymentStatus, TableState


class DiningTable(SQLModel, table=True):
    """Bàn — `code` là mã QR / table_id trong API (số nguyên, ví dụ 1 → Bàn 01)."""

    __tablename__ = "dining_table"

    id: Optional[int] = Field(default=None, primary_key=True)
    code: int = Field(unique=True, index=True)
    label: str
    state: TableState = Field(
        sa_column=Column(SAEnum(TableState, native_enum=False, length=32)),
        default=TableState.IDLE,
    )
    # Tham chiếu logic tới restaurant_order.id (không gắn FK DB để tránh vòng phụ thuộc SQLite).
    active_order_id: Optional[int] = Field(default=None, index=True)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class MenuItem(SQLModel, table=True):
    __tablename__ = "menu_item"

    id: str = Field(primary_key=True, max_length=64)
    name: str
    price_minor: int  # VND nguyên (đồng) — D-18
    category_id: str = Field(max_length=64, index=True)
    image_url: str = ""
    tags_json: str = "[]"  # JSON array string, ví dụ '["Thuần chay"]'


class RestaurantOrder(SQLModel, table=True):
    __tablename__ = "restaurant_order"

    id: Optional[int] = Field(default=None, primary_key=True)
    table_db_id: int = Field(foreign_key="dining_table.id", index=True)
    status: OrderStatus = Field(
        sa_column=Column(SAEnum(OrderStatus, native_enum=False, length=32)),
        default=OrderStatus.NEW,
    )
    note: str = ""
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class OrderItem(SQLModel, table=True):
    __tablename__ = "order_item"

    id: Optional[int] = Field(default=None, primary_key=True)
    order_id: int = Field(foreign_key="restaurant_order.id", index=True)
    menu_item_id: str = Field(foreign_key="menu_item.id", max_length=64)
    quantity: int = Field(ge=1)
    unit_price_minor: int = Field(ge=0)
    line_note: str = ""


class Payment(SQLModel, table=True):
    __tablename__ = "payment"

    id: Optional[int] = Field(default=None, primary_key=True)
    order_id: int = Field(foreign_key="restaurant_order.id", unique=True, index=True)
    table_db_id: int = Field(foreign_key="dining_table.id", index=True)
    status: PaymentStatus = Field(
        sa_column=Column(SAEnum(PaymentStatus, native_enum=False, length=32)),
        default=PaymentStatus.NONE,
    )
    total_minor: int = Field(ge=0)  # VND nguyên — snapshot lúc yêu cầu thanh toán
    requested_at: Optional[datetime] = None
    updated_at: datetime = Field(default_factory=datetime.utcnow)
