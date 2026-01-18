"""
Celery tasks for Analytics app.
Background processing for analytics tracking and report generation.
"""

from celery import shared_task
from django.utils import timezone
from django.db.models import Count, Sum, Avg
from django.core.mail import send_mail
from django.conf import settings
from datetime import timedelta
import logging

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=3)
def track_blog_view(self, blog_id, user_id=None, ip_address=None, user_agent=''):
    """
    Track a blog view asynchronously.
    Creates a BlogView record with device information.
    """
    try:
        from apps.analytics.models import BlogView
        from apps.blogs.models import Blog
        
        blog = Blog.objects.get(id=blog_id)
        
        # Parse user agent for device info
        device_type = 'desktop'
        browser = ''
        operating_system = ''
        
        if user_agent:
            ua_lower = user_agent.lower()
            if 'mobile' in ua_lower or 'android' in ua_lower or 'iphone' in ua_lower:
                device_type = 'mobile'
            elif 'tablet' in ua_lower or 'ipad' in ua_lower:
                device_type = 'tablet'
            
            # Simple browser detection
            if 'chrome' in ua_lower:
                browser = 'Chrome'
            elif 'firefox' in ua_lower:
                browser = 'Firefox'
            elif 'safari' in ua_lower:
                browser = 'Safari'
            elif 'edge' in ua_lower:
                browser = 'Edge'
            
            # Simple OS detection
            if 'windows' in ua_lower:
                operating_system = 'Windows'
            elif 'mac' in ua_lower:
                operating_system = 'MacOS'
            elif 'linux' in ua_lower:
                operating_system = 'Linux'
            elif 'android' in ua_lower:
                operating_system = 'Android'
            elif 'ios' in ua_lower or 'iphone' in ua_lower:
                operating_system = 'iOS'
        
        BlogView.objects.create(
            blog=blog,
            user_id=user_id,
            ip_address=ip_address,
            user_agent=user_agent,
            device_type=device_type,
            browser=browser,
            operating_system=operating_system,
        )
        
        logger.info(f'Tracked view for blog {blog_id}')
        return True
        
    except Exception as exc:
        logger.error(f'Error tracking blog view: {exc}')
        self.retry(exc=exc, countdown=60)


@shared_task
def generate_daily_analytics():
    """
    Generate daily analytics aggregation.
    Run via Celery Beat at midnight.
    """
    try:
        from apps.analytics.models import DailyAnalytics, BlogView
        from apps.blogs.models import Blog, BlogComment
        from apps.users.models import User
        
        yesterday = timezone.now().date() - timedelta(days=1)
        
        # Get view statistics
        views_qs = BlogView.objects.filter(
            viewed_at__date=yesterday
        )
        
        total_views = views_qs.count()
        unique_visitors = views_qs.values('ip_address').distinct().count()
        
        # Device breakdown
        device_stats = views_qs.values('device_type').annotate(count=Count('id'))
        device_map = {d['device_type']: d['count'] for d in device_stats}
        
        # New content
        new_blogs = Blog.objects.filter(created_at__date=yesterday).count()
        new_comments = BlogComment.objects.filter(created_at__date=yesterday).count()
        
        # User stats
        new_users = User.objects.filter(date_joined__date=yesterday).count()
        active_users = User.objects.filter(last_login__date=yesterday).count()
        
        # Top blogs
        top_blogs_qs = views_qs.values('blog_id', 'blog__title').annotate(
            views=Count('id')
        ).order_by('-views')[:10]
        
        top_blogs = [
            {'id': b['blog_id'], 'title': b['blog__title'], 'views': b['views']}
            for b in top_blogs_qs
        ]
        
        # Top categories
        top_categories_qs = views_qs.values(
            'blog__category__name'
        ).annotate(views=Count('id')).order_by('-views')[:5]
        
        top_categories = [
            {'name': c['blog__category__name'] or 'Uncategorized', 'views': c['views']}
            for c in top_categories_qs
        ]
        
        # Create or update daily analytics
        DailyAnalytics.objects.update_or_create(
            date=yesterday,
            defaults={
                'total_views': total_views,
                'unique_visitors': unique_visitors,
                'new_blogs': new_blogs,
                'new_comments': new_comments,
                'new_users': new_users,
                'active_users': active_users,
                'top_blogs': top_blogs,
                'top_categories': top_categories,
                'desktop_views': device_map.get('desktop', 0),
                'mobile_views': device_map.get('mobile', 0),
                'tablet_views': device_map.get('tablet', 0),
            }
        )
        
        logger.info(f'Generated daily analytics for {yesterday}')
        return True
        
    except Exception as exc:
        logger.error(f'Error generating daily analytics: {exc}')
        raise


@shared_task
def cleanup_old_analytics():
    """
    Clean up old detailed analytics data.
    Keep last 90 days of BlogView records.
    """
    try:
        from apps.analytics.models import BlogView
        
        cutoff_date = timezone.now() - timedelta(days=90)
        deleted_count, _ = BlogView.objects.filter(
            viewed_at__lt=cutoff_date
        ).delete()
        
        logger.info(f'Cleaned up {deleted_count} old BlogView records')
        return deleted_count
        
    except Exception as exc:
        logger.error(f'Error cleaning up analytics: {exc}')
        raise


@shared_task
def send_weekly_engagement_report():
    """
    Send weekly engagement report to admins.
    Run via Celery Beat on Monday mornings.
    """
    try:
        from apps.analytics.models import DailyAnalytics
        from apps.users.models import User, UserRole
        
        # Get last 7 days of analytics
        end_date = timezone.now().date()
        start_date = end_date - timedelta(days=7)
        
        weekly_stats = DailyAnalytics.objects.filter(
            date__range=[start_date, end_date]
        ).aggregate(
            total_views=Sum('total_views'),
            total_visitors=Sum('unique_visitors'),
            total_new_users=Sum('new_users'),
            total_new_blogs=Sum('new_blogs'),
        )
        
        # Get admin emails
        admin_emails = list(
            User.objects.filter(
                role=UserRole.ADMIN,
                is_active=True
            ).values_list('email', flat=True)
        )
        
        if not admin_emails:
            logger.info('No admin emails found for weekly report')
            return False
        
        # Send email
        subject = f'Weekly Engagement Report - {start_date} to {end_date}'
        message = f"""
Weekly Engagement Report
========================
Period: {start_date} to {end_date}

Summary:
- Total Page Views: {weekly_stats['total_views'] or 0}
- Unique Visitors: {weekly_stats['total_visitors'] or 0}
- New Users: {weekly_stats['total_new_users'] or 0}
- New Blogs Published: {weekly_stats['total_new_blogs'] or 0}

View detailed analytics in the admin dashboard.
        """
        
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=admin_emails,
            fail_silently=True,
        )
        
        logger.info(f'Sent weekly report to {len(admin_emails)} admins')
        return True
        
    except Exception as exc:
        logger.error(f'Error sending weekly report: {exc}')
        raise


@shared_task
def send_contact_notification(submission_id):
    """
    Send notification when new contact form is submitted.
    """
    try:
        from apps.analytics.models import ContactSubmission
        from apps.users.models import User, UserRole
        
        submission = ContactSubmission.objects.get(id=submission_id)
        
        # Get admin emails
        admin_emails = list(
            User.objects.filter(
                role=UserRole.ADMIN,
                is_active=True
            ).values_list('email', flat=True)
        )
        
        if not admin_emails:
            logger.info('No admin emails found for contact notification')
            return False
        
        subject = f'New Contact Form Submission: {submission.subject}'
        message = f"""
New Contact Form Submission
===========================
Name: {submission.name}
Email: {submission.email}
Phone: {submission.phone or 'Not provided'}
Subject: {submission.subject}

Message:
{submission.message}

Submitted at: {submission.created_at}
        """
        
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=admin_emails,
            fail_silently=True,
        )
        
        logger.info(f'Sent contact notification for submission {submission_id}')
        return True
        
    except Exception as exc:
        logger.error(f'Error sending contact notification: {exc}')
        raise
