from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session

from app.api.deps import get_db_session
from app.services.order_service import (
    OrderFlowError,
    admin_order_detail,
    admin_payment_queue,
    admin_tables_overview,
    reset_settled_table,
)

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/tables/overview")
def tables_overview(session: Annotated[Session, Depends(get_db_session)]) -> dict:
    return {"rows": admin_tables_overview(session)}


@router.get("/payments/queue")
def payments_queue(session: Annotated[Session, Depends(get_db_session)]) -> dict:
    return {"rows": admin_payment_queue(session)}


@router.get("/tables/{table_id}/orders/detail")
def order_detail(
    table_id: int,
    session: Annotated[Session, Depends(get_db_session)],
) -> dict:
    try:
        return admin_order_detail(session, table_code=table_id)
    except OrderFlowError as e:
        raise HTTPException(status_code=e.http_status, detail={"code": e.code, "message": str(e)}) from e


@router.post("/tables/{table_id}/reset")
def reset_table(
    table_id: int,
    session: Annotated[Session, Depends(get_db_session)],
) -> dict:
    try:
        t = reset_settled_table(session, table_code=table_id)
    except OrderFlowError as e:
        raise HTTPException(status_code=e.http_status, detail={"code": e.code, "message": str(e)}) from e
    return {"tableCode": t.code, "state": t.state.value}
