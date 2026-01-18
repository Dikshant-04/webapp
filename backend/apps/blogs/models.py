"""
Blog models for Project SPD.
Handles blog posts, categories, and tags.
"""

from django.db import models
from django.conf import settings
from django.utils import timezone
from django.utils.text import slugify
import bleach


class BlogStatus(models.TextChoices):
    """Blog post status choices."""
    DRAFT = 'draft', 'Draft'
    PUBLISHED = 'published', 'Published'
    ARCHIVED = 'archived', 'Archived'


class Category(models.Model):
    """Blog category model."""
    
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=100, unique=True, blank=True)
    description = models.TextField(max_length=500, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Category'
        verbose_name_plural = 'Categories'
        ordering = ['name']
    
    def __str__(self):
        return self.name
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)
    
    @property
    def blog_count(self):
        """Get count of published blogs in this category."""
        return self.blogs.filter(status=BlogStatus.PUBLISHED).count()


class Tag(models.Model):
    """Blog tag model."""
    
    name = models.CharField(max_length=50, unique=True)
    slug = models.SlugField(max_length=50, unique=True, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = 'Tag'
        verbose_name_plural = 'Tags'
        ordering = ['name']
    
    def __str__(self):
        return self.name
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)


class Blog(models.Model):
    """
    Blog post model.
    Supports draft, published, and archived states.
    """
    
    # Basic fields
    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True, blank=True)
    excerpt = models.TextField(max_length=500, blank=True, help_text='Short summary of the blog post')
    content = models.TextField()
    
    # Media
    featured_image = models.ImageField(upload_to='blogs/featured/', null=True, blank=True)
    
    # Relationships
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='blogs'
    )
    category = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='blogs'
    )
    tags = models.ManyToManyField(Tag, blank=True, related_name='blogs')
    
    # Status and visibility
    status = models.CharField(
        max_length=20,
        choices=BlogStatus.choices,
        default=BlogStatus.DRAFT
    )
    is_featured = models.BooleanField(default=False)
    
    # Analytics
    view_count = models.PositiveIntegerField(default=0)
    
    # SEO
    meta_title = models.CharField(max_length=70, blank=True)
    meta_description = models.CharField(max_length=160, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    published_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        verbose_name = 'Blog Post'
        verbose_name_plural = 'Blog Posts'
        ordering = ['-published_at', '-created_at']
        indexes = [
            models.Index(fields=['slug']),
            models.Index(fields=['status']),
            models.Index(fields=['author']),
            models.Index(fields=['-published_at']),
            models.Index(fields=['is_featured']),
        ]
    
    def __str__(self):
        return self.title
    
    def save(self, *args, **kwargs):
        # Generate slug from title
        if not self.slug:
            base_slug = slugify(self.title)
            slug = base_slug
            counter = 1
            while Blog.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f'{base_slug}-{counter}'
                counter += 1
            self.slug = slug
        
        # Set published_at when status changes to published
        if self.status == BlogStatus.PUBLISHED and not self.published_at:
            self.published_at = timezone.now()
        
        # Sanitize content
        self.content = bleach.clean(
            self.content,
            tags=['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
                  'ul', 'ol', 'li', 'a', 'img', 'blockquote', 'code', 'pre', 'table',
                  'thead', 'tbody', 'tr', 'th', 'td', 'span', 'div'],
            attributes={
                'a': ['href', 'title', 'target'],
                'img': ['src', 'alt', 'title', 'width', 'height'],
                'span': ['class', 'style'],
                'div': ['class', 'style'],
                'table': ['class'],
                'td': ['colspan', 'rowspan'],
                'th': ['colspan', 'rowspan'],
            }
        )
        
        super().save(*args, **kwargs)
    
    def increment_view_count(self):
        """Increment the view count."""
        self.view_count += 1
        self.save(update_fields=['view_count'])
    
    @property
    def reading_time(self):
        """Estimate reading time in minutes."""
        word_count = len(self.content.split())
        return max(1, round(word_count / 200))
    
    @property
    def tag_names(self):
        """Get list of tag names."""
        return list(self.tags.values_list('name', flat=True))


class BlogComment(models.Model):
    """
    Blog comment model.
    Supports nested comments with parent field.
    """
    
    blog = models.ForeignKey(
        Blog,
        on_delete=models.CASCADE,
        related_name='comments'
    )
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='blog_comments'
    )
    parent = models.ForeignKey(
        'self',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='replies'
    )
    
    content = models.TextField(max_length=2000)
    is_approved = models.BooleanField(default=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Blog Comment'
        verbose_name_plural = 'Blog Comments'
        ordering = ['-created_at']
    
    def __str__(self):
        return f'Comment by {self.author.username} on {self.blog.title}'
    
    def save(self, *args, **kwargs):
        # Sanitize content
        self.content = bleach.clean(self.content, tags=[], strip=True)
        super().save(*args, **kwargs)
