from pydantic import BaseModel, Field


class CartLineIn(BaseModel):
    menu_item_id: str = Field(alias="menuItemId")
    quantity: int = Field(ge=1)
    line_note: str = Field(default="", alias="lineNote")

    model_config = {"populate_by_name": True}


class UpsertOrderBody(BaseModel):
    lines: list[CartLineIn]
    order_note: str = Field(default="", alias="orderNote")

    model_config = {"populate_by_name": True}
