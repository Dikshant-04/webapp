"""
Views for Analytics app.
Dashboard analytics and contact form handling.
"""

from rest_framework import generics, status, views
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.db.models import Count, Sum
from django.utils import timezone
from datetime import timedelta

from .models import BlogView, DailyAnalytics, MonthlyAnalytics, ContactSubmission
from .serializers import (
    BlogViewSerializer,
    DailyAnalyticsSerializer,
    MonthlyAnalyticsSerializer,
    ContactSubmissionSerializer,
    ContactSubmissionCreateSerializer,
    AdminContactSubmissionSerializer,
)
from apps.users.permissions import IsAdmin, IsStaffOrAdmin


# ============================================================
# Public Views
# ============================================================

class ContactSubmitView(generics.CreateAPIView):
    """
    Submit contact form.
    POST /api/analytics/contact/
    """
    permission_classes = [AllowAny]
    serializer_class = ContactSubmissionCreateSerializer
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        
        return Response({
            'message': 'Thank you for your message. We will get back to you soon.',
            'data': ContactSubmissionSerializer(serializer.instance).data
        }, status=status.HTTP_201_CREATED)


# ============================================================
# Admin Analytics Views
# ============================================================

class AnalyticsDashboardView(views.APIView):
    """
    Get comprehensive analytics dashboard data.
    GET /api/analytics/dashboard/
    """
    permission_classes = [IsAuthenticated, IsAdmin]
    
    def get(self, request):
        from apps.blogs.models import Blog, BlogComment, BlogStatus
        from apps.users.models import User
        
        now = timezone.now()
        today = now.date()
        week_ago = today - timedelta(days=7)
        month_ago = today - timedelta(days=30)
        
        # Total counts
        total_blogs = Blog.objects.filter(status=BlogStatus.PUBLISHED).count()
        total_users = User.objects.count()
        total_comments = BlogComment.objects.count()
        total_views = Blog.objects.aggregate(total=Sum('view_count'))['total'] or 0
        
        # Views statistics
        views_today = BlogView.objects.filter(viewed_at__date=today).count()
        views_this_week = BlogView.objects.filter(viewed_at__date__gte=week_ago).count()
        views_this_month = BlogView.objects.filter(viewed_at__date__gte=month_ago).count()
        
        # New users
        new_users_today = User.objects.filter(date_joined__date=today).count()
        new_users_this_week = User.objects.filter(date_joined__date__gte=week_ago).count()
        new_users_this_month = User.objects.filter(date_joined__date__gte=month_ago).count()
        
        # Top blogs (last 30 days)
        top_blogs = Blog.objects.filter(
            status=BlogStatus.PUBLISHED
        ).order_by('-view_count')[:10].values('id', 'title', 'slug', 'view_count')
        
        # Recent activity
        recent_blogs = Blog.objects.order_by('-created_at')[:5].values(
            'id', 'title', 'created_at', 'author__username'
        )
        recent_users = User.objects.order_by('-date_joined')[:5].values(
            'id', 'username', 'email', 'date_joined'
        )
        
        # Device breakdown (last 30 days)
        device_stats = BlogView.objects.filter(
            viewed_at__date__gte=month_ago
        ).values('device_type').annotate(count=Count('id'))
        device_breakdown = {d['device_type']: d['count'] for d in device_stats}
        
        # Daily views for chart (last 30 days)
        daily_views = DailyAnalytics.objects.filter(
            date__gte=month_ago
        ).order_by('date').values('date', 'total_views', 'unique_visitors')
        
        return Response({
            'summary': {
                'total_views': total_views,
                'total_blogs': total_blogs,
                'total_users': total_users,
                'total_comments': total_comments,
            },
            'views': {
                'today': views_today,
                'this_week': views_this_week,
                'this_month': views_this_month,
            },
            'new_users': {
                'today': new_users_today,
                'this_week': new_users_this_week,
                'this_month': new_users_this_month,
            },
            'top_blogs': list(top_blogs),
            'recent_activity': {
                'blogs': list(recent_blogs),
                'users': list(recent_users),
            },
            'device_breakdown': device_breakdown,
            'daily_views': list(daily_views),
        })


class DailyAnalyticsView(generics.ListAPIView):
    """
    List daily analytics data.
    GET /api/analytics/daily/
    """
    permission_classes = [IsAuthenticated, IsAdmin]
    serializer_class = DailyAnalyticsSerializer
    
    def get_queryset(self):
        # Default to last 30 days
        days = int(self.request.query_params.get('days', 30))
        start_date = timezone.now().date() - timedelta(days=days)
        
        return DailyAnalytics.objects.filter(
            date__gte=start_date
        ).order_by('-date')


class MonthlyAnalyticsView(generics.ListAPIView):
    """
    List monthly analytics data.
    GET /api/analytics/monthly/
    """
    permission_classes = [IsAuthenticated, IsAdmin]
    serializer_class = MonthlyAnalyticsSerializer
    
    def get_queryset(self):
        # Default to last 12 months
        months = int(self.request.query_params.get('months', 12))
        return MonthlyAnalytics.objects.all()[:months]


class BlogViewsListView(generics.ListAPIView):
    """
    List recent blog views.
    GET /api/analytics/views/
    """
    permission_classes = [IsAuthenticated, IsAdmin]
    serializer_class = BlogViewSerializer
    
    def get_queryset(self):
        blog_id = self.request.query_params.get('blog_id')
        queryset = BlogView.objects.all().select_related('blog', 'user')
        
        if blog_id:
            queryset = queryset.filter(blog_id=blog_id)
        
        return queryset[:100]


class BlogAnalyticsView(views.APIView):
    """
    Get analytics for a specific blog.
    GET /api/analytics/blog/<id>/
    """
    permission_classes = [IsAuthenticated, IsStaffOrAdmin]
    
    def get(self, request, pk):
        from apps.blogs.models import Blog
        
        try:
            blog = Blog.objects.get(pk=pk)
        except Blog.DoesNotExist:
            return Response(
                {'error': 'Blog not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Check permission - staff can only view their own blog analytics
        from apps.users.models import UserRole
        if request.user.role != UserRole.ADMIN and blog.author != request.user:
            return Response(
                {'error': 'You do not have permission to view this blog\'s analytics'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        now = timezone.now()
        week_ago = now - timedelta(days=7)
        month_ago = now - timedelta(days=30)
        
        # View statistics
        total_views = blog.view_count
        views_this_week = BlogView.objects.filter(
            blog=blog,
            viewed_at__gte=week_ago
        ).count()
        views_this_month = BlogView.objects.filter(
            blog=blog,
            viewed_at__gte=month_ago
        ).count()
        
        # Unique visitors
        unique_visitors_week = BlogView.objects.filter(
            blog=blog,
            viewed_at__gte=week_ago
        ).values('ip_address').distinct().count()
        
        # Device breakdown
        device_stats = BlogView.objects.filter(
            blog=blog,
            viewed_at__gte=month_ago
        ).values('device_type').annotate(count=Count('id'))
        device_breakdown = {d['device_type']: d['count'] for d in device_stats}
        
        # Daily views (last 30 days)
        from django.db.models.functions import TruncDate
        daily_views = BlogView.objects.filter(
            blog=blog,
            viewed_at__gte=month_ago
        ).annotate(
            date=TruncDate('viewed_at')
        ).values('date').annotate(
            views=Count('id')
        ).order_by('date')
        
        return Response({
            'blog': {
                'id': blog.id,
                'title': blog.title,
                'slug': blog.slug,
                'published_at': blog.published_at,
            },
            'views': {
                'total': total_views,
                'this_week': views_this_week,
                'this_month': views_this_month,
            },
            'unique_visitors_week': unique_visitors_week,
            'device_breakdown': device_breakdown,
            'daily_views': list(daily_views),
        })


# ============================================================
# Admin Contact Management Views
# ============================================================

class AdminContactListView(generics.ListAPIView):
    """
    List all contact submissions.
    GET /api/analytics/admin/contacts/
    """
    permission_classes = [IsAuthenticated, IsAdmin]
    serializer_class = AdminContactSubmissionSerializer
    
    def get_queryset(self):
        queryset = ContactSubmission.objects.all()
        
        # Filter by status
        is_read = self.request.query_params.get('is_read')
        if is_read is not None:
            queryset = queryset.filter(is_read=is_read.lower() == 'true')
        
        is_replied = self.request.query_params.get('is_replied')
        if is_replied is not None:
            queryset = queryset.filter(is_replied=is_replied.lower() == 'true')
        
        return queryset


class AdminContactDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Get, update, or delete contact submission.
    GET /api/analytics/admin/contacts/<id>/
    PATCH /api/analytics/admin/contacts/<id>/
    DELETE /api/analytics/admin/contacts/<id>/
    """
    permission_classes = [IsAuthenticated, IsAdmin]
    serializer_class = AdminContactSubmissionSerializer
    queryset = ContactSubmission.objects.all()
    
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        
        # Mark as read
        if not instance.is_read:
            instance.is_read = True
            instance.save()
        
        serializer = self.get_serializer(instance)
        return Response(serializer.data)


class AdminContactMarkRepliedView(views.APIView):
    """
    Mark contact submission as replied.
    POST /api/analytics/admin/contacts/<id>/reply/
    """
    permission_classes = [IsAuthenticated, IsAdmin]
    
    def post(self, request, pk):
        try:
            submission = ContactSubmission.objects.get(pk=pk)
        except ContactSubmission.DoesNotExist:
            return Response(
                {'error': 'Contact submission not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        submission.is_replied = True
        submission.replied_at = timezone.now()
        submission.replied_by = request.user
        submission.save()
        
        return Response({
            'message': 'Contact marked as replied',
            'data': AdminContactSubmissionSerializer(submission).data
        })


class ContactStatsView(views.APIView):
    """
    Get contact submission statistics.
    GET /api/analytics/admin/contacts/stats/
    """
    permission_classes = [IsAuthenticated, IsAdmin]
    
    def get(self, request):
        total = ContactSubmission.objects.count()
        unread = ContactSubmission.objects.filter(is_read=False).count()
        unreplied = ContactSubmission.objects.filter(is_replied=False).count()
        
        # This week
        week_ago = timezone.now() - timedelta(days=7)
        this_week = ContactSubmission.objects.filter(created_at__gte=week_ago).count()
        
        return Response({
            'total': total,
            'unread': unread,
            'unreplied': unreplied,
            'this_week': this_week,
        })
