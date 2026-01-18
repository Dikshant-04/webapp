"""
URL configuration for Project SPD.
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

# API Documentation Schema
schema_view = get_schema_view(
    openapi.Info(
        title="Project SPD API",
        default_version='v1',
        description="""
        Complete REST API for Project SPD - A role-based web application.
        
        ## Authentication
        - All protected endpoints require JWT Bearer token
        - Use /api/auth/login/ to obtain tokens
        - Use /api/auth/refresh/ to refresh access token
        
        ## Roles
        - **Customer**: Public access only
        - **Staff**: Can manage own profile and blogs
        - **Admin**: Full system access
        """,
        terms_of_service="https://www.projectspd.com/terms/",
        contact=openapi.Contact(email="support@projectspd.com"),
        license=openapi.License(name="MIT License"),
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)

urlpatterns = [
    # Admin
    path('admin/', admin.site.urls),
    
    # API Documentation
    path('api/docs/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('api/redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
    
    # API Routes
    path('api/auth/', include('apps.users.urls.auth_urls')),
    path('api/users/', include('apps.users.urls.user_urls')),
    path('api/blogs/', include('apps.blogs.urls')),
    path('api/analytics/', include('apps.analytics.urls')),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
