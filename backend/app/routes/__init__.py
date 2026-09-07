"""Register all route routers into a single list for the main app."""

from app.routes.chat import router as chat_router
from app.routes.classify import router as classify_router
from app.routes.weather import router as weather_router
from app.routes.air_quality import router as air_quality_router
from app.routes.hospitals import router as hospitals_router
from app.routes.incidents import router as incidents_router

all_routers = [
    chat_router,
    classify_router,
    weather_router,
    air_quality_router,
    hospitals_router,
    incidents_router,
]
