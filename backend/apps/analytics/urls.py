"""
URL patterns for Analytics app.
"""

from django.urls import path
from .views import (
    # Public views
    ContactSubmitView,
    
    # Admin analytics views
    AnalyticsDashboardView,
    DailyAnalyticsView,
    MonthlyAnalyticsView,
    BlogViewsListView,
    BlogAnalyticsView,
    
    # Admin contact views
    AdminContactListView,
    AdminContactDetailView,
    AdminContactMarkRepliedView,
    ContactStatsView,
)

urlpatterns = [
    # Public contact endpoint
    path('contact/', ContactSubmitView.as_view(), name='contact-submit'),
    
    # Admin analytics endpoints
    path('dashboard/', AnalyticsDashboardView.as_view(), name='analytics-dashboard'),
    path('daily/', DailyAnalyticsView.as_view(), name='daily-analytics'),
    path('monthly/', MonthlyAnalyticsView.as_view(), name='monthly-analytics'),
    path('views/', BlogViewsListView.as_view(), name='blog-views-list'),
    path('blog/<int:pk>/', BlogAnalyticsView.as_view(), name='blog-analytics'),
    
    # Admin contact management
    path('admin/contacts/', AdminContactListView.as_view(), name='admin-contacts-list'),
    path('admin/contacts/stats/', ContactStatsView.as_view(), name='contacts-stats'),
    path('admin/contacts/<int:pk>/', AdminContactDetailView.as_view(), name='admin-contact-detail'),
    path('admin/contacts/<int:pk>/reply/', AdminContactMarkRepliedView.as_view(), name='admin-contact-reply'),
]
