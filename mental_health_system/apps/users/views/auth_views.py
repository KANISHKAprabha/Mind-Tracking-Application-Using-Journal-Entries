"""
Auth views — thin wrappers that delegate to auth_service.
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework import status

from apps.core.response import success_response, error_response
from apps.users.serializers import RegisterSerializer, LoginSerializer
from apps.users.services.auth_service import register_user, login_user


@api_view(["POST"])
@permission_classes([AllowAny])
def register_view(request):
    """Register a new user and return an auth token."""
    serializer = RegisterSerializer(data=request.data)
    if not serializer.is_valid():
        return error_response(
            message="Registration failed.",
            errors=serializer.errors,
            status_code=status.HTTP_400_BAD_REQUEST,
        )

    data = register_user(serializer.validated_data)
    return success_response(
        data=data,
        message="Registration successful.",
        status_code=status.HTTP_201_CREATED,
    )


@api_view(["POST"])
@permission_classes([AllowAny])
def login_view(request):
    """Authenticate a user and return an auth token."""
    serializer = LoginSerializer(data=request.data)
    if not serializer.is_valid():
        return error_response(
            message="Login failed.",
            errors=serializer.errors,
            status_code=status.HTTP_400_BAD_REQUEST,
        )

    data = login_user(serializer.validated_data)
    if data is None:
        return error_response(
            message="Invalid username or password.",
            status_code=status.HTTP_401_UNAUTHORIZED,
        )

    return success_response(data=data, message="Login successful.")
