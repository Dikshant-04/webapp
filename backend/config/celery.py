"""
Celery configuration for Project SPD.
Background task processing with Redis.
"""

import os
from celery import Celery
from celery.schedules import crontab

# Set default Django settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

app = Celery('project_spd')

# Load settings from Django settings with CELERY_ prefix
app.config_from_object('django.conf:settings', namespace='CELERY')

# Auto-discover tasks in all registered apps
app.autodiscover_tasks()

# Celery Beat Schedule for periodic tasks
app.conf.beat_schedule = {
    # Generate daily analytics report
    'generate-daily-analytics': {
        'task': 'apps.analytics.tasks.generate_daily_analytics',
        'schedule': crontab(hour=0, minute=5),  # Run at 00:05 daily
    },
    # Clean old analytics data (keep last 90 days)
    'cleanup-old-analytics': {
        'task': 'apps.analytics.tasks.cleanup_old_analytics',
        'schedule': crontab(hour=1, minute=0, day_of_week='sunday'),  # Weekly cleanup
    },
    # Send weekly engagement report to admins
    'send-weekly-report': {
        'task': 'apps.analytics.tasks.send_weekly_engagement_report',
        'schedule': crontab(hour=9, minute=0, day_of_week='monday'),  # Monday 9 AM
    },
}

app.conf.timezone = 'UTC'


@app.task(bind=True, ignore_result=True)
def debug_task(self):
    """Debug task for testing Celery configuration."""
    print(f'Request: {self.request!r}')
