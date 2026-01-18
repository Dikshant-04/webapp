"""
Config package for Project SPD.
"""

from .celery import app as celery_app

__all__ = ('celery_app',)
