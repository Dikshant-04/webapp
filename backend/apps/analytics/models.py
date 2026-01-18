"""
Analytics models for Project SPD.
Tracks blog views, user engagement, and system metrics.
"""

from django.db import models
from django.conf import settings


class BlogView(models.Model):
    """
    Tracks individual blog views.
    Used for detailed analytics and view counting.
    """
    
    blog = models.ForeignKey(
        'blogs.Blog',
        on_delete=models.CASCADE,
        related_name='view_logs'
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='blog_views'
    )
    
    # View details
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    referrer = models.URLField(max_length=500, blank=True)
    
    # Device info
    device_type = models.CharField(max_length=50, blank=True)  # desktop, mobile, tablet
    browser = models.CharField(max_length=100, blank=True)
    operating_system = models.CharField(max_length=100, blank=True)
    
    # Timing
    session_duration = models.PositiveIntegerField(default=0)  # seconds
    viewed_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = 'Blog View'
        verbose_name_plural = 'Blog Views'
        ordering = ['-viewed_at']
        indexes = [
            models.Index(fields=['blog', '-viewed_at']),
            models.Index(fields=['user', '-viewed_at']),
            models.Index(fields=['-viewed_at']),
        ]
    
    def __str__(self):
        return f'View of {self.blog.title} at {self.viewed_at}'


class DailyAnalytics(models.Model):
    """
    Aggregated daily analytics.
    Pre-computed for fast dashboard queries.
    """
    
    date = models.DateField(unique=True)
    
    # Blog metrics
    total_views = models.PositiveIntegerField(default=0)
    unique_visitors = models.PositiveIntegerField(default=0)
    new_blogs = models.PositiveIntegerField(default=0)
    new_comments = models.PositiveIntegerField(default=0)
    
    # User metrics
    new_users = models.PositiveIntegerField(default=0)
    active_users = models.PositiveIntegerField(default=0)
    
    # Top performing content
    top_blogs = models.JSONField(default=list)  # [{'id': 1, 'title': '...', 'views': 100}]
    top_categories = models.JSONField(default=list)
    
    # Device breakdown
    desktop_views = models.PositiveIntegerField(default=0)
    mobile_views = models.PositiveIntegerField(default=0)
    tablet_views = models.PositiveIntegerField(default=0)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Daily Analytics'
        verbose_name_plural = 'Daily Analytics'
        ordering = ['-date']
    
    def __str__(self):
        return f'Analytics for {self.date}'


class MonthlyAnalytics(models.Model):
    """
    Aggregated monthly analytics.
    Pre-computed for reports and trends.
    """
    
    year = models.PositiveIntegerField()
    month = models.PositiveIntegerField()
    
    # Blog metrics
    total_views = models.PositiveIntegerField(default=0)
    unique_visitors = models.PositiveIntegerField(default=0)
    new_blogs = models.PositiveIntegerField(default=0)
    total_comments = models.PositiveIntegerField(default=0)
    
    # User metrics
    new_users = models.PositiveIntegerField(default=0)
    total_active_users = models.PositiveIntegerField(default=0)
    
    # Engagement metrics
    avg_session_duration = models.FloatField(default=0)  # seconds
    bounce_rate = models.FloatField(default=0)  # percentage
    
    # Top content
    top_blogs = models.JSONField(default=list)
    top_authors = models.JSONField(default=list)
    top_categories = models.JSONField(default=list)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Monthly Analytics'
        verbose_name_plural = 'Monthly Analytics'
        ordering = ['-year', '-month']
        unique_together = ['year', 'month']
    
    def __str__(self):
        return f'Analytics for {self.year}-{self.month:02d}'


class ContactSubmission(models.Model):
    """
    Contact form submissions.
    """
    
    name = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=20, blank=True)
    subject = models.CharField(max_length=200)
    message = models.TextField()
    
    # Status
    is_read = models.BooleanField(default=False)
    is_replied = models.BooleanField(default=False)
    replied_at = models.DateTimeField(null=True, blank=True)
    replied_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='contact_replies'
    )
    
    # Metadata
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Contact Submission'
        verbose_name_plural = 'Contact Submissions'
        ordering = ['-created_at']
    
    def __str__(self):
        return f'{self.name} - {self.subject}'
