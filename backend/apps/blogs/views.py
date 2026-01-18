"""
Views for Blog app.
Handles public blog access, staff blog management, and admin operations.
"""

from rest_framework import generics, status, views
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.db.models import Count, Q
from django.utils import timezone

from .models import Blog, Category, Tag, BlogComment, BlogStatus
from .serializers import (
    CategorySerializer,
    TagSerializer,
    BlogListSerializer,
    BlogDetailSerializer,
    BlogCreateSerializer,
    BlogPublicListSerializer,
    BlogsByUserSerializer,
    AdminBlogSerializer,
    BlogCommentSerializer,
)
from apps.users.permissions import (
    IsAdmin,
    IsStaffOrAdmin,
    IsOwnerOrAdmin,
    CanModifyBlog,
    PublicReadOnly,
)
from apps.users.models import UserRole


# ============================================================
# Public Blog Views (No Auth Required)
# ============================================================

class PublicBlogListView(generics.ListAPIView):
    """
    List all published blogs.
    GET /api/blogs/
    Supports search via ?q=query and filtering.
    """
    permission_classes = [AllowAny]
    serializer_class = BlogPublicListSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['category__slug', 'tags__slug', 'is_featured']
    search_fields = ['title', 'excerpt', 'content', 'author__username', 'author__first_name']
    ordering_fields = ['published_at', 'view_count', 'title']
    ordering = ['-published_at']
    
    def get_queryset(self):
        queryset = Blog.objects.filter(
            status=BlogStatus.PUBLISHED
        ).select_related('author', 'category').prefetch_related('tags')
        
        # Handle search query parameter
        q = self.request.query_params.get('q')
        if q:
            queryset = queryset.filter(
                Q(title__icontains=q) |
                Q(excerpt__icontains=q) |
                Q(content__icontains=q)
            )
        
        return queryset


class PublicBlogDetailView(generics.RetrieveAPIView):
    """
    Get single published blog by slug.
    GET /api/blogs/<slug>/
    Increments view count.
    """
    permission_classes = [AllowAny]
    serializer_class = BlogDetailSerializer
    lookup_field = 'slug'
    
    def get_queryset(self):
        return Blog.objects.filter(
            status=BlogStatus.PUBLISHED
        ).select_related('author', 'category').prefetch_related('tags', 'comments')
    
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        
        # Increment view count (async task in production)
        instance.increment_view_count()
        
        # Track view analytics
        from apps.analytics.tasks import track_blog_view
        try:
            track_blog_view.delay(
                blog_id=instance.id,
                user_id=request.user.id if request.user.is_authenticated else None,
                ip_address=self.get_client_ip(request),
                user_agent=request.META.get('HTTP_USER_AGENT', '')
            )
        except Exception:
            pass  # Fail silently if Celery is not available
        
        serializer = self.get_serializer(instance)
        return Response(serializer.data)
    
    def get_client_ip(self, request):
        """Get client IP address."""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            return x_forwarded_for.split(',')[0]
        return request.META.get('REMOTE_ADDR')


class FeaturedBlogsView(generics.ListAPIView):
    """
    List featured blogs.
    GET /api/blogs/featured/
    """
    permission_classes = [AllowAny]
    serializer_class = BlogPublicListSerializer
    
    def get_queryset(self):
        return Blog.objects.filter(
            status=BlogStatus.PUBLISHED,
            is_featured=True
        ).select_related('author', 'category')[:6]


class BlogsByUserView(generics.ListAPIView):
    """
    List blogs by specific user.
    GET /api/blogs/user/<username>/
    """
    permission_classes = [AllowAny]
    serializer_class = BlogsByUserSerializer
    
    def get_queryset(self):
        username = self.kwargs.get('username')
        return Blog.objects.filter(
            status=BlogStatus.PUBLISHED,
            author__username=username
        ).order_by('-published_at')


class CategoryListView(generics.ListAPIView):
    """
    List all categories with blog counts.
    GET /api/blogs/categories/
    """
    permission_classes = [AllowAny]
    serializer_class = CategorySerializer
    
    def get_queryset(self):
        return Category.objects.annotate(
            blog_count=Count('blogs', filter=Q(blogs__status=BlogStatus.PUBLISHED))
        ).filter(blog_count__gt=0).order_by('name')


class TagListView(generics.ListAPIView):
    """
    List all tags.
    GET /api/blogs/tags/
    """
    permission_classes = [AllowAny]
    serializer_class = TagSerializer
    queryset = Tag.objects.all()


# ============================================================
# Staff Blog Management Views
# ============================================================

class StaffBlogListView(generics.ListCreateAPIView):
    """
    Staff: List own blogs or create new blog.
    GET /api/blogs/staff/
    POST /api/blogs/staff/
    """
    permission_classes = [IsAuthenticated, IsStaffOrAdmin]
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['title', 'excerpt']
    ordering_fields = ['created_at', 'published_at', 'view_count', 'status']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return BlogCreateSerializer
        return BlogListSerializer
    
    def get_queryset(self):
        return Blog.objects.filter(
            author=self.request.user
        ).select_related('category').prefetch_related('tags')


class StaffBlogDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Staff: Get, update, or delete own blog.
    GET /api/blogs/staff/<id>/
    PATCH /api/blogs/staff/<id>/
    DELETE /api/blogs/staff/<id>/
    """
    permission_classes = [IsAuthenticated, IsStaffOrAdmin, CanModifyBlog]
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return BlogCreateSerializer
        return BlogDetailSerializer
    
    def get_queryset(self):
        user = self.request.user
        if user.role == UserRole.ADMIN:
            return Blog.objects.all()
        return Blog.objects.filter(author=user)
    
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response(
            {'message': 'Blog deleted successfully'},
            status=status.HTTP_204_NO_CONTENT
        )


# ============================================================
# Admin Blog Management Views
# ============================================================

class AdminBlogListView(generics.ListAPIView):
    """
    Admin: List all blogs.
    GET /api/blogs/admin/
    """
    permission_classes = [IsAuthenticated, IsAdmin]
    serializer_class = AdminBlogSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status', 'is_featured', 'author', 'category']
    search_fields = ['title', 'excerpt', 'author__username', 'author__email']
    ordering_fields = ['created_at', 'published_at', 'view_count', 'status']
    ordering = ['-created_at']
    
    def get_queryset(self):
        return Blog.objects.all().select_related('author', 'category').prefetch_related('tags')


class AdminBlogDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Admin: Get, update, or delete any blog.
    GET /api/blogs/admin/<id>/
    PATCH /api/blogs/admin/<id>/
    DELETE /api/blogs/admin/<id>/
    """
    permission_classes = [IsAuthenticated, IsAdmin]
    queryset = Blog.objects.all()
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return BlogCreateSerializer
        return AdminBlogSerializer
    
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response(
            {'message': 'Blog deleted successfully'},
            status=status.HTTP_204_NO_CONTENT
        )


class AdminBlogStatusView(views.APIView):
    """
    Admin: Update blog status (publish/unpublish/archive).
    PATCH /api/blogs/admin/<id>/status/
    """
    permission_classes = [IsAuthenticated, IsAdmin]
    
    def patch(self, request, pk):
        try:
            blog = Blog.objects.get(pk=pk)
        except Blog.DoesNotExist:
            return Response(
                {'error': 'Blog not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        new_status = request.data.get('status')
        if new_status not in [choice[0] for choice in BlogStatus.choices]:
            return Response(
                {'error': f'Invalid status. Must be one of: {[c[0] for c in BlogStatus.choices]}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        blog.status = new_status
        if new_status == BlogStatus.PUBLISHED and not blog.published_at:
            blog.published_at = timezone.now()
        blog.save()
        
        return Response({
            'message': f'Blog status updated to {new_status}',
            'blog': AdminBlogSerializer(blog).data
        })


class AdminBlogFeaturedView(views.APIView):
    """
    Admin: Toggle blog featured status.
    PATCH /api/blogs/admin/<id>/featured/
    """
    permission_classes = [IsAuthenticated, IsAdmin]
    
    def patch(self, request, pk):
        try:
            blog = Blog.objects.get(pk=pk)
        except Blog.DoesNotExist:
            return Response(
                {'error': 'Blog not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        blog.is_featured = not blog.is_featured
        blog.save()
        
        return Response({
            'message': f'Blog {"featured" if blog.is_featured else "unfeatured"} successfully',
            'is_featured': blog.is_featured
        })


class AdminBlogStatsView(views.APIView):
    """
    Admin: Get blog statistics.
    GET /api/blogs/admin/stats/
    """
    permission_classes = [IsAuthenticated, IsAdmin]
    
    def get(self, request):
        from datetime import timedelta
        
        total_blogs = Blog.objects.count()
        published_blogs = Blog.objects.filter(status=BlogStatus.PUBLISHED).count()
        draft_blogs = Blog.objects.filter(status=BlogStatus.DRAFT).count()
        
        # Total views
        total_views = Blog.objects.aggregate(total=models.Sum('view_count'))['total'] or 0
        
        # Views this month
        thirty_days_ago = timezone.now() - timedelta(days=30)
        
        # Top viewed blogs
        top_blogs = Blog.objects.filter(
            status=BlogStatus.PUBLISHED
        ).order_by('-view_count')[:5]
        
        # Blogs by category
        blogs_by_category = Category.objects.annotate(
            count=Count('blogs', filter=Q(blogs__status=BlogStatus.PUBLISHED))
        ).values('name', 'count').order_by('-count')[:10]
        
        # Recent blogs
        recent_blogs = Blog.objects.filter(
            created_at__gte=thirty_days_ago
        ).count()
        
        return Response({
            'total_blogs': total_blogs,
            'published_blogs': published_blogs,
            'draft_blogs': draft_blogs,
            'archived_blogs': total_blogs - published_blogs - draft_blogs,
            'total_views': total_views,
            'blogs_this_month': recent_blogs,
            'top_blogs': BlogPublicListSerializer(top_blogs, many=True).data,
            'blogs_by_category': list(blogs_by_category),
        })


# ============================================================
# Category & Tag Management (Admin)
# ============================================================

class AdminCategoryListCreateView(generics.ListCreateAPIView):
    """
    Admin: List or create categories.
    GET /api/blogs/admin/categories/
    POST /api/blogs/admin/categories/
    """
    permission_classes = [IsAuthenticated, IsAdmin]
    serializer_class = CategorySerializer
    queryset = Category.objects.all()


class AdminCategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Admin: Get, update, or delete category.
    GET /api/blogs/admin/categories/<id>/
    PATCH /api/blogs/admin/categories/<id>/
    DELETE /api/blogs/admin/categories/<id>/
    """
    permission_classes = [IsAuthenticated, IsAdmin]
    serializer_class = CategorySerializer
    queryset = Category.objects.all()


class AdminTagListCreateView(generics.ListCreateAPIView):
    """
    Admin: List or create tags.
    GET /api/blogs/admin/tags/
    POST /api/blogs/admin/tags/
    """
    permission_classes = [IsAuthenticated, IsAdmin]
    serializer_class = TagSerializer
    queryset = Tag.objects.all()


class AdminTagDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Admin: Get, update, or delete tag.
    GET /api/blogs/admin/tags/<id>/
    PATCH /api/blogs/admin/tags/<id>/
    DELETE /api/blogs/admin/tags/<id>/
    """
    permission_classes = [IsAuthenticated, IsAdmin]
    serializer_class = TagSerializer
    queryset = Tag.objects.all()


# ============================================================
# Comment Views
# ============================================================

class BlogCommentCreateView(generics.CreateAPIView):
    """
    Create comment on a blog.
    POST /api/blogs/<slug>/comments/
    """
    permission_classes = [IsAuthenticated]
    serializer_class = BlogCommentSerializer
    
    def perform_create(self, serializer):
        slug = self.kwargs.get('slug')
        try:
            blog = Blog.objects.get(slug=slug, status=BlogStatus.PUBLISHED)
        except Blog.DoesNotExist:
            from rest_framework.exceptions import NotFound
            raise NotFound('Blog not found')
        
        serializer.save(author=self.request.user, blog=blog)
