"""
Dashboard views — thin wrapper over dashboard_service.
"""
from rest_framework.decorators import api_view
from apps.core.response import success_response
from apps.analytics.services.dashboard_service import get_dashboard


@api_view(["GET"])
def dashboard_view(request):
    """Return the full analytics dashboard for the authenticated user."""
    data = get_dashboard(request.user)
    return success_response(data=data)
