"""
Password reset functionality for User app.
Handles password reset requests and token validation.
"""

from rest_framework import serializers, status, views
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.utils import timezone
from django.core.mail import send_mail
from django.conf import settings
import secrets
from datetime import timedelta


User = get_user_model()


# Simple in-memory token storage (for production, use Redis or database)
# Format: {token: {'email': user_email, 'expires': datetime}}
PASSWORD_RESET_TOKENS = {}


def generate_reset_token(user):
    """Generate a secure password reset token."""
    token = secrets.token_urlsafe(32)
    expires = timezone.now() + timedelta(hours=1)
    PASSWORD_RESET_TOKENS[token] = {
        'email': user.email,
        'expires': expires
    }
    return token


def validate_reset_token(token):
    """Validate a password reset token."""
    token_data = PASSWORD_RESET_TOKENS.get(token)
    if not token_data:
        return None
    
    if timezone.now() > token_data['expires']:
        del PASSWORD_RESET_TOKENS[token]
        return None
    
    return token_data['email']


class PasswordResetRequestSerializer(serializers.Serializer):
    """Serializer for password reset request."""
    email = serializers.EmailField(required=True)


class PasswordResetConfirmSerializer(serializers.Serializer):
    """Serializer for password reset confirmation."""
    token = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, write_only=True)
    new_password_confirm = serializers.CharField(required=True, write_only=True)
    
    def validate(self, attrs):
        """Validate password match and strength."""
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError({
                'new_password_confirm': 'Passwords do not match.'
            })
        
        # Validate password strength
        try:
            validate_password(attrs['new_password'])
        except ValidationError as e:
            raise serializers.ValidationError({'new_password': list(e.messages)})
        
        return attrs


class PasswordResetRequestView(views.APIView):
    """
    Request password reset.
    POST /api/auth/password-reset/request/
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        email = serializer.validated_data['email'].lower()
        
        try:
            user = User.objects.get(email=email, is_active=True)
            token = generate_reset_token(user)
            
            # In development, we'll return the token in the response
            # In production, send it via email
            reset_url = f"{settings.CORS_ALLOWED_ORIGINS[0]}/reset-password?token={token}"
            
            # Send email (for now, just log it)
            try:
                send_mail(
                    subject='Password Reset Request',
                    message=f'Click the link to reset your password: {reset_url}\n\nThis link expires in 1 hour.',
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[user.email],
                    fail_silently=False,
                )
                print(f"Password reset email sent to {user.email}")
                print(f"Reset URL: {reset_url}")
            except Exception as e:
                print(f"Email sending failed: {e}")
                print(f"Reset URL: {reset_url}")
            
            return Response({
                'message': 'If your email is registered, you will receive a password reset link.',
                # Include token in development mode for easier testing
                'token': token if settings.DEBUG else None,
                'reset_url': reset_url if settings.DEBUG else None,
            }, status=status.HTTP_200_OK)
            
        except User.DoesNotExist:
            # Return same message to prevent email enumeration
            return Response({
                'message': 'If your email is registered, you will receive a password reset link.',
            }, status=status.HTTP_200_OK)


class PasswordResetConfirmView(views.APIView):
    """
    Confirm password reset with token.
    POST /api/auth/password-reset/confirm/
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        token = serializer.validated_data['token']
        new_password = serializer.validated_data['new_password']
        
        # Validate token
        email = validate_reset_token(token)
        if not email:
            return Response({
                'error': 'Invalid or expired token.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Get user and update password
        try:
            user = User.objects.get(email=email)
            user.set_password(new_password)
            user.save()
            
            # Delete the used token
            if token in PASSWORD_RESET_TOKENS:
                del PASSWORD_RESET_TOKENS[token]
            
            return Response({
                'message': 'Password has been reset successfully. You can now login with your new password.'
            }, status=status.HTTP_200_OK)
            
        except User.DoesNotExist:
            return Response({
                'error': 'User not found.'
            }, status=status.HTTP_404_NOT_FOUND)


class PasswordResetValidateTokenView(views.APIView):
    """
    Validate password reset token.
    POST /api/auth/password-reset/validate-token/
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        token = request.data.get('token')
        if not token:
            return Response({
                'valid': False,
                'error': 'Token is required.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        email = validate_reset_token(token)
        if email:
            return Response({
                'valid': True,
                'message': 'Token is valid.'
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                'valid': False,
                'error': 'Invalid or expired token.'
            }, status=status.HTTP_400_BAD_REQUEST)
