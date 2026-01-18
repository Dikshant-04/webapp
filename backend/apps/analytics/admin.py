"""
Admin configuration for Analytics app.
"""

from django.contrib import admin
from .models import BlogView, DailyAnalytics, MonthlyAnalytics, ContactSubmission


@admin.register(BlogView)
class BlogViewAdmin(admin.ModelAdmin):
    list_display = ['blog', 'user', 'device_type', 'browser', 'viewed_at']
    list_filter = ['device_type', 'browser', 'operating_system', 'viewed_at']
    search_fields = ['blog__title', 'user__username', 'ip_address']
    date_hierarchy = 'viewed_at'
    readonly_fields = ['viewed_at']


@admin.register(DailyAnalytics)
class DailyAnalyticsAdmin(admin.ModelAdmin):
    list_display = ['date', 'total_views', 'unique_visitors', 'new_blogs', 'new_users']
    list_filter = ['date']
    date_hierarchy = 'date'
    readonly_fields = ['created_at', 'updated_at']


@admin.register(MonthlyAnalytics)
class MonthlyAnalyticsAdmin(admin.ModelAdmin):
    list_display = ['year', 'month', 'total_views', 'unique_visitors', 'new_blogs', 'new_users']
    list_filter = ['year', 'month']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(ContactSubmission)
class ContactSubmissionAdmin(admin.ModelAdmin):
    list_display = ['name', 'email', 'subject', 'is_read', 'is_replied', 'created_at']
    list_filter = ['is_read', 'is_replied', 'created_at']
    search_fields = ['name', 'email', 'subject', 'message']
    date_hierarchy = 'created_at'
    readonly_fields = ['ip_address', 'user_agent', 'created_at', 'updated_at']
    actions = ['mark_as_read', 'mark_as_replied']
    
    def mark_as_read(self, request, queryset):
        queryset.update(is_read=True)
    mark_as_read.short_description = 'Mark selected as read'
    
    def mark_as_replied(self, request, queryset):
        from django.utils import timezone
        queryset.update(is_replied=True, replied_at=timezone.now(), replied_by=request.user)
    mark_as_replied.short_description = 'Mark selected as replied'
