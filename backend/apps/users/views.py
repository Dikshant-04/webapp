"""
Views for User app.
Handles authentication, user management, and profile operations.
"""

from rest_framework import generics, status, views
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from .serializers import (
    UserRegistrationSerializer,
    CustomTokenObtainPairSerializer,
    UserSerializer,
    UserPublicSerializer,
    UserUpdateSerializer,
    AdminUserSerializer,
    AdminUserCreateSerializer,
    ChangePasswordSerializer,
)
from .permissions import IsAdmin, IsStaffOrAdmin, IsSelfOrAdmin, PublicReadOnly
from .models import UserRole

User = get_user_model()


# ============================================================
# Authentication Views
# ============================================================

class RegisterView(generics.CreateAPIView):
    """
    User registration endpoint.
    POST /api/auth/register/
    """
    queryset = User.objects.all()
    permission_classes = [AllowAny]
    serializer_class = UserRegistrationSerializer
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Generate tokens for the new user
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'message': 'Registration successful',
            'user': UserSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        }, status=status.HTTP_201_CREATED)


class LoginView(TokenObtainPairView):
    """
    User login endpoint.
    POST /api/auth/login/
    """
    permission_classes = [AllowAny]
    serializer_class = CustomTokenObtainPairSerializer


class RefreshTokenView(TokenRefreshView):
    """
    Token refresh endpoint.
    POST /api/auth/refresh/
    """
    permission_classes = [AllowAny]


class LogoutView(views.APIView):
    """
    User logout endpoint.
    POST /api/auth/logout/
    Blacklists the refresh token.
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            if not refresh_token:
                return Response(
                    {'error': 'Refresh token is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            token = RefreshToken(refresh_token)
            token.blacklist()
            
            return Response(
                {'message': 'Successfully logged out'},
                status=status.HTTP_200_OK
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )


# ============================================================
# User Profile Views
# ============================================================

class CurrentUserView(generics.RetrieveUpdateAPIView):
    """
    Get or update current user's profile.
    GET /api/users/me/
    PATCH /api/users/me/
    """
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return UserUpdateSerializer
        return UserSerializer
    
    def get_object(self):
        return self.request.user


class ChangePasswordView(views.APIView):
    """
    Change current user's password.
    POST /api/users/change-password/
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        serializer = ChangePasswordSerializer(
            data=request.data,
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        
        request.user.set_password(serializer.validated_data['new_password'])
        request.user.save()
        
        return Response(
            {'message': 'Password changed successfully'},
            status=status.HTTP_200_OK
        )


# ============================================================
# Public Profile Views
# ============================================================

class PublicProfileView(generics.RetrieveAPIView):
    """
    Get public user profile by username.
    GET /api/users/profiles/?username=<username>
    """
    permission_classes = [AllowAny]
    serializer_class = UserPublicSerializer
    
    def get_object(self):
        username = self.request.query_params.get('username')
        if not username:
            from rest_framework.exceptions import ValidationError
            raise ValidationError({'username': 'Username parameter is required'})
        
        try:
            return User.objects.get(
                username=username.lower(),
                is_active=True,
                role__in=[UserRole.STAFF, UserRole.ADMIN]
            )
        except User.DoesNotExist:
            from rest_framework.exceptions import NotFound
            raise NotFound('User not found')


class PublicProfileListView(generics.ListAPIView):
    """
    List all public employee profiles.
    GET /api/users/profiles/
    """
    permission_classes = [AllowAny]
    serializer_class = UserPublicSerializer
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['username', 'first_name', 'last_name', 'position']
    ordering_fields = ['username', 'date_joined', 'first_name']
    ordering = ['first_name']
    
    def get_queryset(self):
        return User.objects.filter(
            is_active=True,
            role__in=[UserRole.STAFF, UserRole.ADMIN]
        ).select_related('profile')


# ============================================================
# Staff Dashboard Views
# ============================================================

class StaffProfileView(generics.RetrieveUpdateAPIView):
    """
    Staff member's own profile view and update.
    GET /api/users/staff/profile/
    PATCH /api/users/staff/profile/
    """
    permission_classes = [IsAuthenticated, IsStaffOrAdmin]
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return UserUpdateSerializer
        return UserSerializer
    
    def get_object(self):
        return self.request.user


# ============================================================
# Admin User Management Views
# ============================================================

class AdminUserListView(generics.ListCreateAPIView):
    """
    Admin: List all users or create new user.
    GET /api/users/admin/users/
    POST /api/users/admin/users/
    """
    permission_classes = [IsAuthenticated, IsAdmin]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['role', 'is_active', 'is_verified']
    search_fields = ['email', 'username', 'first_name', 'last_name']
    ordering_fields = ['date_joined', 'email', 'username', 'role']
    ordering = ['-date_joined']
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return AdminUserCreateSerializer
        return AdminUserSerializer
    
    def get_queryset(self):
        return User.objects.all().select_related('profile')


class AdminUserDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Admin: Get, update, or delete a specific user.
    GET /api/users/admin/users/<id>/
    PATCH /api/users/admin/users/<id>/
    DELETE /api/users/admin/users/<id>/
    """
    permission_classes = [IsAuthenticated, IsAdmin]
    serializer_class = AdminUserSerializer
    queryset = User.objects.all().select_related('profile')
    
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        
        # Prevent admin from deleting themselves
        if instance == request.user:
            return Response(
                {'error': 'Cannot delete your own account'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        self.perform_destroy(instance)
        return Response(
            {'message': 'User deleted successfully'},
            status=status.HTTP_204_NO_CONTENT
        )


class AdminUserRoleUpdateView(views.APIView):
    """
    Admin: Update user role.
    PATCH /api/users/admin/users/<id>/role/
    """
    permission_classes = [IsAuthenticated, IsAdmin]
    
    def patch(self, request, pk):
        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response(
                {'error': 'User not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Prevent admin from changing their own role
        if user == request.user:
            return Response(
                {'error': 'Cannot change your own role'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        new_role = request.data.get('role')
        if new_role not in [choice[0] for choice in UserRole.choices]:
            return Response(
                {'error': f'Invalid role. Must be one of: {[c[0] for c in UserRole.choices]}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user.role = new_role
        user.save()
        
        return Response({
            'message': f'User role updated to {new_role}',
            'user': AdminUserSerializer(user).data
        })


class AdminUserStatsView(views.APIView):
    """
    Admin: Get user statistics.
    GET /api/users/admin/stats/
    """
    permission_classes = [IsAuthenticated, IsAdmin]
    
    def get(self, request):
        from django.db.models import Count
        from django.utils import timezone
        from datetime import timedelta
        
        total_users = User.objects.count()
        active_users = User.objects.filter(is_active=True).count()
        
        # Users by role
        users_by_role = User.objects.values('role').annotate(count=Count('id'))
        role_stats = {item['role']: item['count'] for item in users_by_role}
        
        # New users this month
        thirty_days_ago = timezone.now() - timedelta(days=30)
        new_users_month = User.objects.filter(date_joined__gte=thirty_days_ago).count()
        
        # New users today
        today_start = timezone.now().replace(hour=0, minute=0, second=0, microsecond=0)
        new_users_today = User.objects.filter(date_joined__gte=today_start).count()
        
        return Response({
            'total_users': total_users,
            'active_users': active_users,
            'inactive_users': total_users - active_users,
            'users_by_role': role_stats,
            'new_users_this_month': new_users_month,
            'new_users_today': new_users_today,
        })
