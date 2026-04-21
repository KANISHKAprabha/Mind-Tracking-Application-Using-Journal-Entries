"""User auth URL routes."""
from django.urls import path
from apps.users.views.auth_views import register_view, login_view

urlpatterns = [
    path("register/", register_view, name="register"),
    path("login/", login_view, name="login"),
]
