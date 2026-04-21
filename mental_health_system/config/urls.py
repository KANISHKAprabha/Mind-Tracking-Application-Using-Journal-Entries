"""Root URL configuration."""
from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/", include("apps.users.urls")),
    path("api/journal/", include("apps.journal.urls")),
    path("api/dashboard/", include("apps.analytics.urls")),
]
