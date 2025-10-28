from django.urls import path, include
from .views import get_notes, CustomTokenObtainPairView,CustomRefreshTokenView, logout,is_authenticated, register
from rest_framework.routers import DefaultRouter
from .views import UserViewSet

router = DefaultRouter()
router.register(r"users", UserViewSet, basename="user")

urlpatterns = [
    path('token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', CustomRefreshTokenView.as_view(), name='token_refresh'),
    path('notes/', get_notes),
    path('logout/', logout),
    path('authenticated/', is_authenticated),
    path('register/', register),
    path("", include(router.urls)),
]
