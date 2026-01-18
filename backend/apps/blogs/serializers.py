"""
Serializers for Blog app.
Handles blog posts, categories, tags, and comments.
"""

from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Blog, Category, Tag, BlogComment, BlogStatus

User = get_user_model()


class CategorySerializer(serializers.ModelSerializer):
    """Serializer for Category model."""
    
    blog_count = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description', 'blog_count', 'created_at']
        read_only_fields = ['slug', 'created_at']


class TagSerializer(serializers.ModelSerializer):
    """Serializer for Tag model."""
    
    class Meta:
        model = Tag
        fields = ['id', 'name', 'slug']
        read_only_fields = ['slug']


class BlogAuthorSerializer(serializers.ModelSerializer):
    """Minimal serializer for blog author info."""
    
    full_name = serializers.CharField(read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'full_name', 'avatar', 'position']


class BlogCommentSerializer(serializers.ModelSerializer):
    """Serializer for Blog comments."""
    
    author = BlogAuthorSerializer(read_only=True)
    replies = serializers.SerializerMethodField()
    
    class Meta:
        model = BlogComment
        fields = [
            'id', 'author', 'content', 'parent', 'is_approved',
            'created_at', 'updated_at', 'replies'
        ]
        read_only_fields = ['author', 'is_approved', 'created_at', 'updated_at']
    
    def get_replies(self, obj):
        """Get nested replies for a comment."""
        if obj.replies.exists():
            return BlogCommentSerializer(
                obj.replies.filter(is_approved=True),
                many=True
            ).data
        return []


class BlogListSerializer(serializers.ModelSerializer):
    """Serializer for blog list view - minimal data."""
    
    author = BlogAuthorSerializer(read_only=True)
    category = CategorySerializer(read_only=True)
    tags = TagSerializer(many=True, read_only=True)
    reading_time = serializers.IntegerField(read_only=True)
    comment_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Blog
        fields = [
            'id', 'title', 'slug', 'excerpt', 'featured_image',
            'author', 'category', 'tags', 'status', 'is_featured',
            'view_count', 'reading_time', 'comment_count',
            'created_at', 'published_at'
        ]
    
    def get_comment_count(self, obj):
        """Get count of approved comments."""
        return obj.comments.filter(is_approved=True).count()


class BlogDetailSerializer(serializers.ModelSerializer):
    """Serializer for blog detail view - full data."""
    
    author = BlogAuthorSerializer(read_only=True)
    category = CategorySerializer(read_only=True)
    tags = TagSerializer(many=True, read_only=True)
    reading_time = serializers.IntegerField(read_only=True)
    comments = serializers.SerializerMethodField()
    comment_count = serializers.SerializerMethodField()
    related_blogs = serializers.SerializerMethodField()
    
    class Meta:
        model = Blog
        fields = [
            'id', 'title', 'slug', 'excerpt', 'content', 'featured_image',
            'author', 'category', 'tags', 'status', 'is_featured',
            'view_count', 'reading_time', 'meta_title', 'meta_description',
            'created_at', 'updated_at', 'published_at',
            'comments', 'comment_count', 'related_blogs'
        ]
    
    def get_comments(self, obj):
        """Get top-level approved comments."""
        top_level_comments = obj.comments.filter(
            is_approved=True,
            parent__isnull=True
        )
        return BlogCommentSerializer(top_level_comments, many=True).data
    
    def get_comment_count(self, obj):
        """Get count of approved comments."""
        return obj.comments.filter(is_approved=True).count()
    
    def get_related_blogs(self, obj):
        """Get related blogs based on category and tags."""
        related = Blog.objects.filter(
            status=BlogStatus.PUBLISHED
        ).exclude(id=obj.id)
        
        if obj.category:
            related = related.filter(category=obj.category)
        
        related = related[:4]
        return BlogListSerializer(related, many=True).data


class BlogCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating blogs."""
    
    category_id = serializers.IntegerField(required=False, allow_null=True)
    tag_ids = serializers.ListField(
        child=serializers.IntegerField(),
        required=False,
        write_only=True
    )
    
    class Meta:
        model = Blog
        fields = [
            'title', 'excerpt', 'content', 'featured_image',
            'category_id', 'tag_ids', 'status', 'is_featured',
            'meta_title', 'meta_description'
        ]
    
    def validate_category_id(self, value):
        """Validate category exists."""
        if value:
            if not Category.objects.filter(id=value).exists():
                raise serializers.ValidationError('Category does not exist.')
        return value
    
    def validate_tag_ids(self, value):
        """Validate tags exist."""
        if value:
            existing_ids = set(Tag.objects.filter(id__in=value).values_list('id', flat=True))
            invalid_ids = set(value) - existing_ids
            if invalid_ids:
                raise serializers.ValidationError(f'Tags with IDs {invalid_ids} do not exist.')
        return value
    
    def create(self, validated_data):
        """Create blog with category and tags."""
        category_id = validated_data.pop('category_id', None)
        tag_ids = validated_data.pop('tag_ids', [])
        
        # Set author from request
        validated_data['author'] = self.context['request'].user
        
        # Set category
        if category_id:
            validated_data['category'] = Category.objects.get(id=category_id)
        
        blog = Blog.objects.create(**validated_data)
        
        # Set tags
        if tag_ids:
            blog.tags.set(tag_ids)
        
        return blog
    
    def update(self, instance, validated_data):
        """Update blog with category and tags."""
        category_id = validated_data.pop('category_id', None)
        tag_ids = validated_data.pop('tag_ids', None)
        
        # Update fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        # Update category
        if category_id is not None:
            instance.category = Category.objects.get(id=category_id) if category_id else None
        
        instance.save()
        
        # Update tags
        if tag_ids is not None:
            instance.tags.set(tag_ids)
        
        return instance


class BlogPublicListSerializer(serializers.ModelSerializer):
    """Serializer for public blog list - limited fields."""
    
    author = BlogAuthorSerializer(read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    tags = TagSerializer(many=True, read_only=True)
    reading_time = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Blog
        fields = [
            'id', 'title', 'slug', 'excerpt', 'featured_image',
            'author', 'category_name', 'tags', 'view_count',
            'reading_time', 'published_at'
        ]


class BlogsByUserSerializer(serializers.ModelSerializer):
    """Serializer for blogs by specific user."""
    
    reading_time = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Blog
        fields = [
            'id', 'title', 'slug', 'excerpt', 'featured_image',
            'view_count', 'reading_time', 'published_at'
        ]


class AdminBlogSerializer(serializers.ModelSerializer):
    """Serializer for admin blog management."""
    
    author = BlogAuthorSerializer(read_only=True)
    category = CategorySerializer(read_only=True)
    tags = TagSerializer(many=True, read_only=True)
    reading_time = serializers.IntegerField(read_only=True)
    comment_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Blog
        fields = [
            'id', 'title', 'slug', 'excerpt', 'content', 'featured_image',
            'author', 'category', 'tags', 'status', 'is_featured',
            'view_count', 'reading_time', 'meta_title', 'meta_description',
            'created_at', 'updated_at', 'published_at', 'comment_count'
        ]
    
    def get_comment_count(self, obj):
        """Get count of all comments."""
        return obj.comments.count()
