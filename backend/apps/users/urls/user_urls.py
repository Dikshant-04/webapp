"""
User management URL patterns.
"""

from django.urls import path
from ..views import (
    CurrentUserView,
    ChangePasswordView,
    PublicProfileView,
    PublicProfileListView,
    StaffProfileView,
    AdminUserListView,
    AdminUserDetailView,
    AdminUserRoleUpdateView,
    AdminUserStatsView,
)

urlpatterns = [
    # Current user endpoints
    path('me/', CurrentUserView.as_view(), name='user-me'),
    path('change-password/', ChangePasswordView.as_view(), name='user-change-password'),
    
    # Public profile endpoints
    path('profiles/', PublicProfileListView.as_view(), name='public-profiles-list'),
    path('profile/', PublicProfileView.as_view(), name='public-profile-detail'),
    
    # Staff endpoints
    path('staff/profile/', StaffProfileView.as_view(), name='staff-profile'),
    
    # Admin user management endpoints
    path('admin/users/', AdminUserListView.as_view(), name='admin-users-list'),
    path('admin/users/<int:pk>/', AdminUserDetailView.as_view(), name='admin-user-detail'),
    path('admin/users/<int:pk>/role/', AdminUserRoleUpdateView.as_view(), name='admin-user-role'),
    path('admin/stats/', AdminUserStatsView.as_view(), name='admin-user-stats'),
]
