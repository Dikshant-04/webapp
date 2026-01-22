"""
Authentication URL patterns.
"""

from django.urls import path
from ..views import (
    RegisterView,
    LoginView,
    RefreshTokenView,
    LogoutView,
)
from ..password_reset import (
    PasswordResetRequestView,
    PasswordResetConfirmView,
    PasswordResetValidateTokenView,
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='auth-register'),
    path('login/', LoginView.as_view(), name='auth-login'),
    path('refresh/', RefreshTokenView.as_view(), name='auth-refresh'),
    path('logout/', LogoutView.as_view(), name='auth-logout'),
    
    # Password reset endpoints
    path('password-reset/request/', PasswordResetRequestView.as_view(), name='password-reset-request'),
    path('password-reset/validate-token/', PasswordResetValidateTokenView.as_view(), name='password-reset-validate'),
    path('password-reset/confirm/', PasswordResetConfirmView.as_view(), name='password-reset-confirm'),
]
