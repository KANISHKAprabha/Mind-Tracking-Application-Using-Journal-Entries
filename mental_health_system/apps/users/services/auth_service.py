"""
Auth business logic — views stay thin, all logic lives here.
"""
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from rest_framework.authtoken.models import Token


def register_user(validated_data):
    """Create a new user and return their auth token."""
    user = User.objects.create_user(
        username=validated_data["username"],
        email=validated_data["email"],
        password=validated_data["password"],
    )
    token, _ = Token.objects.get_or_create(user=user)
    return {
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
        },
        "token": token.key,
    }


def login_user(validated_data):
    """Authenticate and return token, or None if credentials are invalid."""
    user = authenticate(
        username=validated_data["username"],
        password=validated_data["password"],
    )
    if user is None:
        return None

    token, _ = Token.objects.get_or_create(user=user)
    return {
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
        },
        "token": token.key,
    }
