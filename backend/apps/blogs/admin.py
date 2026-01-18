"""
Admin configuration for Blog app.
"""

from django.contrib import admin
from .models import Blog, Category, Tag, BlogComment


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'blog_count', 'created_at']
    search_fields = ['name', 'description']
    prepopulated_fields = {'slug': ('name',)}


@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'created_at']
    search_fields = ['name']
    prepopulated_fields = {'slug': ('name',)}


@admin.register(Blog)
class BlogAdmin(admin.ModelAdmin):
    list_display = ['title', 'author', 'category', 'status', 'is_featured', 'view_count', 'published_at']
    list_filter = ['status', 'is_featured', 'category', 'created_at', 'published_at']
    search_fields = ['title', 'excerpt', 'content', 'author__username', 'author__email']
    prepopulated_fields = {'slug': ('title',)}
    filter_horizontal = ['tags']
    date_hierarchy = 'created_at'
    readonly_fields = ['view_count', 'created_at', 'updated_at']
    
    fieldsets = (
        (None, {'fields': ('title', 'slug', 'author')}),
        ('Content', {'fields': ('excerpt', 'content', 'featured_image')}),
        ('Categorization', {'fields': ('category', 'tags')}),
        ('Status', {'fields': ('status', 'is_featured')}),
        ('SEO', {'fields': ('meta_title', 'meta_description')}),
        ('Statistics', {'fields': ('view_count',)}),
        ('Timestamps', {'fields': ('created_at', 'updated_at', 'published_at')}),
    )


@admin.register(BlogComment)
class BlogCommentAdmin(admin.ModelAdmin):
    list_display = ['blog', 'author', 'is_approved', 'created_at']
    list_filter = ['is_approved', 'created_at']
    search_fields = ['content', 'author__username', 'blog__title']
    actions = ['approve_comments', 'reject_comments']
    
    def approve_comments(self, request, queryset):
        queryset.update(is_approved=True)
    approve_comments.short_description = 'Approve selected comments'
    
    def reject_comments(self, request, queryset):
        queryset.update(is_approved=False)
    reject_comments.short_description = 'Reject selected comments'
