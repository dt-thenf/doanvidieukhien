"""Dữ liệu mẫu cho 4 màn frontend + vài bàn trống — idempotent (chỉ seed khi DB trống)."""

from __future__ import annotations

import json
from datetime import datetime, timedelta

from sqlmodel import Session, select

from app.core.enums import OrderStatus, PaymentStatus, TableState
from app.models.entities import DiningTable, MenuItem, OrderItem, Payment, RestaurantOrder


def _menu_rows() -> list[MenuItem]:
    # Khớp customer-web mockData (giá VND nguyên)
    rows = [
        MenuItem(
            id="dau-hu-sa-ot",
            name="Đậu hũ chiên sả ớt",
            price_minor=45_000,
            category_id="mon-nong",
            image_url=(
                "https://lh3.googleusercontent.com/aida-public/AB6AXuCEppemGLyI-UXMtSeboAiNkYtFG_rumXgQMqQWMJT61hNVN9igZcT5zmajz9isyF1bBLU0jQHnOcsVQV14PezC_66Gny9YwqIYI0eNfHrfofFAde91M77-kQLyGWtTswWUpWFQl5rpPBXn24BE1Mkua2s8_N05y8kNi3OF7_G6cjBsB5DcGPEGrBUM6okzPziVOiN4fbjwrTd4ERk2Y93yTIvvaXQN7vKN7LQZ39Sc6j4zsAqiI2a22-FxFjFjOSeiyMlZcpMd_pcd"
            ),
            tags_json=json.dumps(["Thuần chay"], ensure_ascii=False),
        ),
        MenuItem(
            id="goi-ngo-sen",
            name="Gỏi ngó sen chay",
            price_minor=55_000,
            category_id="khai-vi",
            image_url=(
                "https://lh3.googleusercontent.com/aida-public/AB6AXuAo_sNjagSAWQ01Qp8fzzhUdAqs8KkGAHXyjOap9F79apDEJ7T-SEL2wZyO0zohK6qw9DudbLb-1NBVcINORS_pjbQr5NiNSFGb1owhO1qtpstPiWjMsiWqyYVD_brvpPXsf8GWUVYojhlZBWNmeLSMMOwhOFURgWfwuJNOJ-mr9MLwAN2Y7c5AFWHhyH-l7T4MWOUkXcYns03yrQqdki8QayowbiagtI49CcXj1IhF9oX6frn4G7BXuryBWS0YYs7lJAtWkyBP3WMC"
            ),
            tags_json=json.dumps(["Thuần chay", "Ít dầu"], ensure_ascii=False),
        ),
        MenuItem(
            id="nam-kho-tieu",
            name="Nấm kho tiêu",
            price_minor=65_000,
            category_id="mon-nong",
            image_url=(
                "https://lh3.googleusercontent.com/aida-public/AB6AXuBqb6QKLGHgnUeNXLabNnJY5W_rggbc9wM_1P4Z9doFi0OiJHGfB75PNF7tMTUC7LX3o9Bi232Vtv-ecHpHZUHcrQ-5F6M0zTvwVTJhwKPpDs0Om_CtaqaaKB5C5tFB5xMmdTxCFN-Y9-bm8iw6a1b-h0MC7LOSloKtsDKiw9164__hsOkNYsiS4NZhM_4jlivQBuAV83gf6CduaQWZDrdvQFjXkl0OTaW4cOLHUipWyTsXJZzflrzwPD8FP8Elt_2TS3OeDjkWl44w"
            ),
            tags_json=json.dumps(["Nóng"], ensure_ascii=False),
        ),
        MenuItem(
            id="canh-rau",
            name="Canh rau củ nấm",
            price_minor=45_000,
            category_id="mon-nong",
            image_url=(
                "https://lh3.googleusercontent.com/aida-public/AB6AXuAXHYV5NUol7QGOwETEnFdF4rgyEHEt5PZPhHRxGZVkK69N_TZOxlBH6PDVGblQhH9IJFo48dB3dJhnMN_LfcxQ5zaOe3_4mya3bGOEr1JG1_PuwBsGhnB8y4EWFDeT5TJulZ8bBeeC7eT_vFCJYvhCswYi0N1N3H2GwcbBFsOqApag-3RIiklnPtKqCQW0UhmNTIMpsBqMQ0_TqGPuQkh-i-DeRy9PIyV1jaLR4Ps5w74_YuCjgnmRClJKGXaThpEkcYK4meb1DL-"
            ),
            tags_json=json.dumps(["Thuần chay", "Không cay"], ensure_ascii=False),
        ),
        MenuItem(
            id="com-chien",
            name="Cơm chiên rau củ",
            price_minor=55_000,
            category_id="com",
            image_url=(
                "https://lh3.googleusercontent.com/aida-public/AB6AXuA1lNGMhV92SGAhQjjuYpKUF1i9Qj5JqB01T3vr3LUHd0mjosU6Guoj-6ashKl6muwE3eq1DMhvHchwtt_Lt1-jYnsLo3pCtT4W2T-1-saZwcOHzxWqOKj_psj9e2dl8Z6_l-oIeLDmeRfopTZK1smeQpCP1cbt58EpyeJYRmXg4jxjt0SxtDriEsiCrG8S1qjjMrfZD7Rl3TWgjgLxFaHfN4kOi5gPTcgmFoQ0iFj6FVbjMVKvyhW74BJkhKICdX3OALjXx1vdAf99"
            ),
            tags_json=json.dumps(["Có đậu"], ensure_ascii=False),
        ),
        MenuItem(
            id="dau-hu-kho-to",
            name="Đậu hũ kho tộ",
            price_minor=52_000,
            category_id="mon-nong",
            image_url="",
            tags_json=json.dumps(["Thuần chay", "Có đậu"], ensure_ascii=False),
        ),
        MenuItem(
            id="tra-hoa-cuc",
            name="Trà hoa cúc mật ong",
            price_minor=25_000,
            category_id="uong",
            image_url="",
            tags_json=json.dumps(["Nóng"], ensure_ascii=False),
        ),
    ]
    return rows


def seed_if_empty(session: Session) -> None:
    if session.exec(select(DiningTable)).first():
        return

    for m in _menu_rows():
        session.add(m)

    now = datetime.utcnow()

    def add_table(code: int, label: str, state: TableState) -> DiningTable:
        t = DiningTable(code=code, label=label, state=state, updated_at=now)
        session.add(t)
        session.flush()  # lấy t.id cho FK order
        return t

    # Bàn 01 — đang phục vụ (OPEN, đơn IN_KITCHEN)
    t1 = add_table(1, "Bàn 01", TableState.OPEN)
    o1 = RestaurantOrder(
        table_db_id=t1.id,
        status=OrderStatus.IN_KITCHEN,
        note="",
        created_at=now - timedelta(minutes=8),
        updated_at=now - timedelta(minutes=2),
    )
    session.add(o1)
    session.flush()
    t1.active_order_id = o1.id
    session.add(t1)
    session.add(
        OrderItem(
            order_id=o1.id,
            menu_item_id="canh-rau",
            quantity=1,
            unit_price_minor=45_000,
            line_note="",
        )
    )
    session.add(
        OrderItem(
            order_id=o1.id,
            menu_item_id="com-chien",
            quantity=2,
            unit_price_minor=55_000,
            line_note="Ít dầu",
        )
    )

    # Bàn 02 — chờ thanh toán (DONE + payment REQUESTED)
    t2 = add_table(2, "Bàn 02", TableState.PAYMENT_REQUESTED)
    o2 = RestaurantOrder(
        table_db_id=t2.id,
        status=OrderStatus.DONE,
        note="",
        created_at=now - timedelta(minutes=40),
        updated_at=now - timedelta(minutes=6),
    )
    session.add(o2)
    session.flush()
    t2.active_order_id = o2.id
    session.add(t2)
    session.add(
        OrderItem(
            order_id=o2.id,
            menu_item_id="canh-rau",
            quantity=1,
            unit_price_minor=45_000,
            line_note="Không hành",
        )
    )
    session.add(
        OrderItem(
            order_id=o2.id,
            menu_item_id="com-chien",
            quantity=2,
            unit_price_minor=55_000,
            line_note="Ít dầu",
        )
    )
    session.add(
        OrderItem(
            order_id=o2.id,
            menu_item_id="dau-hu-kho-to",
            quantity=1,
            unit_price_minor=52_000,
            line_note="Kèm rau luộc",
        )
    )
    session.add(
        OrderItem(
            order_id=o2.id,
            menu_item_id="tra-hoa-cuc",
            quantity=3,
            unit_price_minor=25_000,
            line_note="Nóng",
        )
    )
    total2 = 45_000 + 2 * 55_000 + 52_000 + 3 * 25_000
    session.add(
        Payment(
            order_id=o2.id,
            table_db_id=t2.id,
            status=PaymentStatus.REQUESTED,
            total_minor=total2,
            requested_at=now - timedelta(minutes=5),
            updated_at=now - timedelta(minutes=5),
        )
    )

    # Bàn 03 — đã kết sổ (SETTLED)
    t3 = add_table(3, "Bàn 03", TableState.SETTLED)
    o3 = RestaurantOrder(
        table_db_id=t3.id,
        status=OrderStatus.DONE,
        note="",
        created_at=now - timedelta(hours=1),
        updated_at=now - timedelta(minutes=30),
    )
    session.add(o3)
    session.flush()
    t3.active_order_id = o3.id
    session.add(t3)
    session.add(
        OrderItem(
            order_id=o3.id,
            menu_item_id="goi-ngo-sen",
            quantity=2,
            unit_price_minor=55_000,
            line_note="",
        )
    )
    session.add(
        Payment(
            order_id=o3.id,
            table_db_id=t3.id,
            status=PaymentStatus.PAID,
            total_minor=110_000,
            requested_at=now - timedelta(minutes=40),
            updated_at=now - timedelta(minutes=25),
        )
    )

    # Bàn 04, 05 — OPEN (khớp admin mock)
    t4 = add_table(4, "Bàn 04", TableState.OPEN)
    o4 = RestaurantOrder(
        table_db_id=t4.id,
        status=OrderStatus.IN_KITCHEN,
        note="",
        created_at=now - timedelta(minutes=20),
        updated_at=now - timedelta(minutes=12),
    )
    session.add(o4)
    session.flush()
    t4.active_order_id = o4.id
    session.add(t4)
    session.add(
        OrderItem(
            order_id=o4.id,
            menu_item_id="nam-kho-tieu",
            quantity=1,
            unit_price_minor=65_000,
            line_note="",
        )
    )
    session.add(
        OrderItem(
            order_id=o4.id,
            menu_item_id="tra-hoa-cuc",
            quantity=2,
            unit_price_minor=25_000,
            line_note="",
        )
    )

    # Bàn 05 — chờ thanh toán (khớp admin mock payment queue, tổng 320.000đ)
    t5 = add_table(5, "Bàn 05", TableState.PAYMENT_REQUESTED)
    o5 = RestaurantOrder(
        table_db_id=t5.id,
        status=OrderStatus.DONE,
        note="",
        created_at=now - timedelta(minutes=25),
        updated_at=now - timedelta(minutes=4),
    )
    session.add(o5)
    session.flush()
    t5.active_order_id = o5.id
    session.add(t5)
    session.add(
        OrderItem(
            order_id=o5.id,
            menu_item_id="com-chien",
            quantity=3,
            unit_price_minor=55_000,
            line_note="",
        )
    )
    session.add(
        OrderItem(
            order_id=o5.id,
            menu_item_id="nam-kho-tieu",
            quantity=2,
            unit_price_minor=65_000,
            line_note="",
        )
    )
    session.add(
        OrderItem(
            order_id=o5.id,
            menu_item_id="tra-hoa-cuc",
            quantity=1,
            unit_price_minor=25_000,
            line_note="",
        )
    )
    session.add(
        Payment(
            order_id=o5.id,
            table_db_id=t5.id,
            status=PaymentStatus.REQUESTED,
            total_minor=320_000,
            requested_at=now - timedelta(minutes=2),
            updated_at=now - timedelta(minutes=2),
        )
    )

    # Bàn 12 — thêm vào hàng chờ thanh toán (khớp admin payment mock)
    t12 = add_table(12, "Bàn 12", TableState.PAYMENT_REQUESTED)
    o12 = RestaurantOrder(
        table_db_id=t12.id,
        status=OrderStatus.DONE,
        note="",
        created_at=now - timedelta(minutes=90),
        updated_at=now - timedelta(minutes=20),
    )
    session.add(o12)
    session.flush()
    t12.active_order_id = o12.id
    session.add(t12)
    session.add(
        OrderItem(
            order_id=o12.id,
            menu_item_id="com-chien",
            quantity=10,
            unit_price_minor=55_000,
            line_note="",
        )
    )
    session.add(
        OrderItem(
            order_id=o12.id,
            menu_item_id="nam-kho-tieu",
            quantity=10,
            unit_price_minor=65_000,
            line_note="",
        )
    )
    total12 = 10 * 55_000 + 10 * 65_000
    session.add(
        Payment(
            order_id=o12.id,
            table_db_id=t12.id,
            status=PaymentStatus.REQUESTED,
            total_minor=total12,
            requested_at=now - timedelta(minutes=12),
            updated_at=now - timedelta(minutes=12),
        )
    )

    # Bàn 06 — trống (IDLE) để demo QR mở phiên
    add_table(6, "Bàn 06", TableState.IDLE)

    session.commit()
