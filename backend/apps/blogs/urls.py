"""
URL patterns for Blog app.
"""

from django.urls import path
from .views import (
    # Public views
    PublicBlogListView,
    PublicBlogDetailView,
    FeaturedBlogsView,
    BlogsByUserView,
    CategoryListView,
    TagListView,
    
    # Staff views
    StaffBlogListView,
    StaffBlogDetailView,
    
    # Admin views
    AdminBlogListView,
    AdminBlogDetailView,
    AdminBlogStatusView,
    AdminBlogFeaturedView,
    AdminBlogStatsView,
    AdminCategoryListCreateView,
    AdminCategoryDetailView,
    AdminTagListCreateView,
    AdminTagDetailView,
    
    # Comment views
    BlogCommentCreateView,
)

urlpatterns = [
    # Public blog endpoints
    path('', PublicBlogListView.as_view(), name='public-blog-list'),
    path('featured/', FeaturedBlogsView.as_view(), name='featured-blogs'),
    path('categories/', CategoryListView.as_view(), name='category-list'),
    path('tags/', TagListView.as_view(), name='tag-list'),
    path('user/<str:username>/', BlogsByUserView.as_view(), name='blogs-by-user'),
    path('<slug:slug>/', PublicBlogDetailView.as_view(), name='public-blog-detail'),
    path('<slug:slug>/comments/', BlogCommentCreateView.as_view(), name='blog-comment-create'),
    
    # Staff blog management
    path('staff/', StaffBlogListView.as_view(), name='staff-blog-list'),
    path('staff/<int:pk>/', StaffBlogDetailView.as_view(), name='staff-blog-detail'),
    
    # Admin blog management
    path('admin/', AdminBlogListView.as_view(), name='admin-blog-list'),
    path('admin/stats/', AdminBlogStatsView.as_view(), name='admin-blog-stats'),
    path('admin/<int:pk>/', AdminBlogDetailView.as_view(), name='admin-blog-detail'),
    path('admin/<int:pk>/status/', AdminBlogStatusView.as_view(), name='admin-blog-status'),
    path('admin/<int:pk>/featured/', AdminBlogFeaturedView.as_view(), name='admin-blog-featured'),
    
    # Admin category management
    path('admin/categories/', AdminCategoryListCreateView.as_view(), name='admin-category-list'),
    path('admin/categories/<int:pk>/', AdminCategoryDetailView.as_view(), name='admin-category-detail'),
    
    # Admin tag management
    path('admin/tags/', AdminTagListCreateView.as_view(), name='admin-tag-list'),
    path('admin/tags/<int:pk>/', AdminTagDetailView.as_view(), name='admin-tag-detail'),
]
