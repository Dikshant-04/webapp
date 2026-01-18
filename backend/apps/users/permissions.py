"""
Custom permissions for role-based access control.
"""

from rest_framework import permissions
from .models import UserRole


class IsAdmin(permissions.BasePermission):
    """
    Permission check for admin users only.
    """
    message = 'Admin access required.'
    
    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            request.user.role == UserRole.ADMIN
        )


class IsStaffOrAdmin(permissions.BasePermission):
    """
    Permission check for staff or admin users.
    """
    message = 'Staff or admin access required.'
    
    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            request.user.role in [UserRole.STAFF, UserRole.ADMIN]
        )


class IsOwnerOrAdmin(permissions.BasePermission):
    """
    Permission check for object owner or admin.
    Allows admins full access, owners can access their own objects.
    """
    message = 'You do not have permission to perform this action.'
    
    def has_object_permission(self, request, view, obj):
        # Admin has full access
        if request.user.role == UserRole.ADMIN:
            return True
        
        # Check if user is owner
        if hasattr(obj, 'user'):
            return obj.user == request.user
        if hasattr(obj, 'author'):
            return obj.author == request.user
        
        # For user objects, check if it's the same user
        return obj == request.user


class IsOwner(permissions.BasePermission):
    """
    Permission check for object owner only.
    """
    message = 'You must be the owner of this object.'
    
    def has_object_permission(self, request, view, obj):
        if hasattr(obj, 'user'):
            return obj.user == request.user
        if hasattr(obj, 'author'):
            return obj.author == request.user
        return obj == request.user


class IsAuthenticatedOrReadOnly(permissions.BasePermission):
    """
    Allow read access to anyone, write access to authenticated users.
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_authenticated


class IsSelfOrAdmin(permissions.BasePermission):
    """
    Allow users to access their own data or admins to access any data.
    """
    message = 'You can only access your own profile.'
    
    def has_object_permission(self, request, view, obj):
        # Admin has full access
        if request.user.role == UserRole.ADMIN:
            return True
        # Users can access their own profile
        return obj == request.user


class CanModifyBlog(permissions.BasePermission):
    """
    Permission for blog modifications.
    Staff can modify own blogs, admins can modify any blog.
    """
    message = 'You do not have permission to modify this blog.'
    
    def has_object_permission(self, request, view, obj):
        # Admin can modify any blog
        if request.user.role == UserRole.ADMIN:
            return True
        
        # Staff can only modify their own blogs
        if request.user.role == UserRole.STAFF:
            return obj.author == request.user
        
        return False


class PublicReadOnly(permissions.BasePermission):
    """
    Allow public read access to any user (authenticated or not).
    Write operations require authentication.
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_authenticated
