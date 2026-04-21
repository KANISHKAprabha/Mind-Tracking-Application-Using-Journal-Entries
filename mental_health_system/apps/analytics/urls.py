"""Analytics / dashboard URL routes."""
from django.urls import path
from apps.analytics.views.dashboard_views import dashboard_view

urlpatterns = [
    path("", dashboard_view, name="dashboard"),
]
