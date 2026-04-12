"""Định dạng thời gian tương đối đơn giản (tiếng Việt) cho admin."""

from datetime import datetime


def format_relative_vi(updated_at: datetime, now: datetime | None = None) -> str:
    now = now or datetime.utcnow()
    sec = int((now - updated_at).total_seconds())
    if sec < 45:
        return "Mới đây"
    minutes = sec // 60
    if minutes < 60:
        return f"{minutes} phút trước"
    hours = minutes // 60
    if hours < 24:
        return f"{hours} giờ trước"
    days = hours // 24
    return f"{days} ngày trước"
