"""
Custom exception handler for DRF.
All errors flow through here — no bare try/except with print.
"""
from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status


def custom_exception_handler(exc, context):
    """Wrap DRF's default handler with standardized error format."""
    response = exception_handler(exc, context)

    if response is not None:
        return Response(
            {
                "status": "error",
                "message": str(exc.detail) if hasattr(exc, "detail") else str(exc),
                "errors": response.data,
            },
            status=response.status_code,
        )

    return Response(
        {
            "status": "error",
            "message": "An unexpected error occurred.",
            "errors": None,
        },
        status=status.HTTP_500_INTERNAL_SERVER_ERROR,
    )
