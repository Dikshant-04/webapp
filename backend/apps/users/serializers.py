"""
Serializers for User app.
Handles user registration, authentication, and profile management.
"""

from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from .models import User, UserProfile, UserRole


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for UserProfile model."""
    
    class Meta:
        model = UserProfile
        fields = [
            'website', 'linkedin', 'twitter', 'github',
            'department', 'skills', 'experience_years',
            'public_email', 'public_phone'
        ]


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration."""
    
    password = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'}
    )
    password_confirm = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'}
    )
    
    class Meta:
        model = User
        fields = [
            'email', 'username', 'password', 'password_confirm',
            'first_name', 'last_name', 'phone'
        ]
        extra_kwargs = {
            'first_name': {'required': False},
            'last_name': {'required': False},
            'phone': {'required': False},
        }
    
    def validate_email(self, value):
        """Validate email uniqueness."""
        if User.objects.filter(email=value.lower()).exists():
            raise serializers.ValidationError('A user with this email already exists.')
        return value.lower()
    
    def validate_username(self, value):
        """Validate username uniqueness and format."""
        if User.objects.filter(username=value.lower()).exists():
            raise serializers.ValidationError('A user with this username already exists.')
        if len(value) < 3:
            raise serializers.ValidationError('Username must be at least 3 characters.')
        return value.lower()
    
    def validate(self, attrs):
        """Validate password match."""
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({
                'password_confirm': 'Passwords do not match.'
            })
        
        # Validate password strength
        try:
            validate_password(attrs['password'])
        except ValidationError as e:
            raise serializers.ValidationError({'password': list(e.messages)})
        
        return attrs
    
    def create(self, validated_data):
        """Create new user."""
        validated_data.pop('password_confirm')
        user = User.objects.create_user(
            email=validated_data['email'],
            username=validated_data['username'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            phone=validated_data.get('phone', ''),
            role=UserRole.CUSTOMER  # Default role
        )
        return user


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Custom JWT token serializer with additional user data."""
    
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        
        # Add custom claims
        token['username'] = user.username
        token['email'] = user.email
        token['role'] = user.role
        token['full_name'] = user.full_name
        
        return token
    
    def validate(self, attrs):
        data = super().validate(attrs)
        
        # Add user data to response
        data['user'] = {
            'id': self.user.id,
            'email': self.user.email,
            'username': self.user.username,
            'full_name': self.user.full_name,
            'role': self.user.role,
            'avatar': self.user.avatar.url if self.user.avatar else None,
        }
        
        return data


class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model - basic info."""
    
    profile = UserProfileSerializer(read_only=True)
    full_name = serializers.CharField(read_only=True)
    blog_count = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'email', 'username', 'first_name', 'last_name',
            'full_name', 'phone', 'position', 'bio', 'avatar',
            'role', 'is_active', 'is_verified', 'date_joined',
            'profile', 'blog_count'
        ]
        read_only_fields = ['id', 'date_joined', 'is_verified', 'role']
    
    def get_blog_count(self, obj):
        """Get count of published blogs by user."""
        return obj.blogs.filter(status='published').count() if hasattr(obj, 'blogs') else 0


class UserPublicSerializer(serializers.ModelSerializer):
    """Serializer for public user profile - limited info."""
    
    full_name = serializers.CharField(read_only=True)
    profile = UserProfileSerializer(read_only=True)
    blog_count = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'first_name', 'last_name', 'full_name',
            'position', 'bio', 'avatar', 'profile', 'blog_count'
        ]
    
    def get_blog_count(self, obj):
        """Get count of published blogs by user."""
        return obj.blogs.filter(status='published').count() if hasattr(obj, 'blogs') else 0
    
    def to_representation(self, instance):
        """Conditionally include email and phone based on profile settings."""
        data = super().to_representation(instance)
        
        if hasattr(instance, 'profile'):
            if instance.profile.public_email:
                data['email'] = instance.email
            if instance.profile.public_phone:
                data['phone'] = instance.phone
        
        return data


class UserUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating user profile."""
    
    profile = UserProfileSerializer(required=False)
    
    class Meta:
        model = User
        fields = [
            'first_name', 'last_name', 'phone', 'position',
            'bio', 'avatar', 'profile'
        ]
    
    def update(self, instance, validated_data):
        """Update user and nested profile."""
        profile_data = validated_data.pop('profile', None)
        
        # Update user fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Update profile if data provided
        if profile_data and hasattr(instance, 'profile'):
            for attr, value in profile_data.items():
                setattr(instance.profile, attr, value)
            instance.profile.save()
        
        return instance


class AdminUserSerializer(serializers.ModelSerializer):
    """Serializer for admin user management - full access."""
    
    profile = UserProfileSerializer(required=False)
    full_name = serializers.CharField(read_only=True)
    blog_count = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'email', 'username', 'first_name', 'last_name',
            'full_name', 'phone', 'position', 'bio', 'avatar',
            'role', 'is_active', 'is_verified', 'is_staff',
            'date_joined', 'last_login', 'updated_at',
            'profile', 'blog_count'
        ]
        read_only_fields = ['id', 'date_joined', 'last_login', 'updated_at']
    
    def get_blog_count(self, obj):
        """Get count of all blogs by user."""
        return obj.blogs.count() if hasattr(obj, 'blogs') else 0


class AdminUserCreateSerializer(serializers.ModelSerializer):
    """Serializer for admin creating users."""
    
    password = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'}
    )
    
    class Meta:
        model = User
        fields = [
            'email', 'username', 'password', 'first_name', 'last_name',
            'phone', 'position', 'role', 'is_active', 'is_verified'
        ]
    
    def validate_email(self, value):
        """Validate email uniqueness."""
        if User.objects.filter(email=value.lower()).exists():
            raise serializers.ValidationError('A user with this email already exists.')
        return value.lower()
    
    def validate_username(self, value):
        """Validate username uniqueness."""
        if User.objects.filter(username=value.lower()).exists():
            raise serializers.ValidationError('A user with this username already exists.')
        return value.lower()
    
    def create(self, validated_data):
        """Create new user with specified role."""
        password = validated_data.pop('password')
        user = User.objects.create(**validated_data)
        user.set_password(password)
        user.save()
        return user


class ChangePasswordSerializer(serializers.Serializer):
    """Serializer for password change."""
    
    old_password = serializers.CharField(
        required=True,
        style={'input_type': 'password'}
    )
    new_password = serializers.CharField(
        required=True,
        style={'input_type': 'password'}
    )
    confirm_password = serializers.CharField(
        required=True,
        style={'input_type': 'password'}
    )
    
    def validate_old_password(self, value):
        """Validate current password."""
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError('Current password is incorrect.')
        return value
    
    def validate(self, attrs):
        """Validate new password match."""
        if attrs['new_password'] != attrs['confirm_password']:
            raise serializers.ValidationError({
                'confirm_password': 'New passwords do not match.'
            })
        
        try:
            validate_password(attrs['new_password'])
        except ValidationError as e:
            raise serializers.ValidationError({'new_password': list(e.messages)})
        
        return attrs
