from fastapi import APIRouter

from app.api.v1 import admin, customer, health

api_router = APIRouter()
api_router.include_router(health.router)
api_router.include_router(customer.router)
api_router.include_router(admin.router)
