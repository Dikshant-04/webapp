"""
Serializers for Analytics app.
"""

from rest_framework import serializers
from .models import BlogView, DailyAnalytics, MonthlyAnalytics, ContactSubmission


class BlogViewSerializer(serializers.ModelSerializer):
    """Serializer for BlogView model."""
    
    blog_title = serializers.CharField(source='blog.title', read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = BlogView
        fields = [
            'id', 'blog', 'blog_title', 'user', 'username',
            'ip_address', 'device_type', 'browser', 'operating_system',
            'session_duration', 'viewed_at'
        ]


class DailyAnalyticsSerializer(serializers.ModelSerializer):
    """Serializer for DailyAnalytics model."""
    
    class Meta:
        model = DailyAnalytics
        fields = '__all__'


class MonthlyAnalyticsSerializer(serializers.ModelSerializer):
    """Serializer for MonthlyAnalytics model."""
    
    class Meta:
        model = MonthlyAnalytics
        fields = '__all__'


class ContactSubmissionSerializer(serializers.ModelSerializer):
    """Serializer for ContactSubmission model."""
    
    class Meta:
        model = ContactSubmission
        fields = [
            'id', 'name', 'email', 'phone', 'subject', 'message',
            'is_read', 'is_replied', 'created_at'
        ]
        read_only_fields = ['is_read', 'is_replied', 'created_at']


class ContactSubmissionCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating contact submissions."""
    
    class Meta:
        model = ContactSubmission
        fields = ['name', 'email', 'phone', 'subject', 'message']
    
    def create(self, validated_data):
        """Create contact submission with metadata."""
        request = self.context.get('request')
        if request:
            # Get IP address
            x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
            if x_forwarded_for:
                validated_data['ip_address'] = x_forwarded_for.split(',')[0]
            else:
                validated_data['ip_address'] = request.META.get('REMOTE_ADDR')
            
            # Get user agent
            validated_data['user_agent'] = request.META.get('HTTP_USER_AGENT', '')
        
        submission = ContactSubmission.objects.create(**validated_data)
        
        # Trigger notification task
        from .tasks import send_contact_notification
        try:
            send_contact_notification.delay(submission.id)
        except Exception:
            pass  # Fail silently if Celery not available
        
        return submission


class AdminContactSubmissionSerializer(serializers.ModelSerializer):
    """Serializer for admin contact submission management."""
    
    replied_by_name = serializers.CharField(source='replied_by.full_name', read_only=True)
    
    class Meta:
        model = ContactSubmission
        fields = [
            'id', 'name', 'email', 'phone', 'subject', 'message',
            'is_read', 'is_replied', 'replied_at', 'replied_by', 'replied_by_name',
            'ip_address', 'user_agent', 'created_at', 'updated_at'
        ]
        read_only_fields = ['ip_address', 'user_agent', 'created_at', 'updated_at']


class AnalyticsDashboardSerializer(serializers.Serializer):
    """Serializer for analytics dashboard data."""
    
    total_views = serializers.IntegerField()
    total_blogs = serializers.IntegerField()
    total_users = serializers.IntegerField()
    total_comments = serializers.IntegerField()
    
    views_today = serializers.IntegerField()
    views_this_week = serializers.IntegerField()
    views_this_month = serializers.IntegerField()
    
    new_users_today = serializers.IntegerField()
    new_users_this_week = serializers.IntegerField()
    new_users_this_month = serializers.IntegerField()
    
    top_blogs = serializers.ListField()
    recent_activity = serializers.ListField()
    device_breakdown = serializers.DictField()
    daily_views = serializers.ListField()
