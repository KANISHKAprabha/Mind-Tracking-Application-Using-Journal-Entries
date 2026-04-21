"""
Journal views — thin wrappers that delegate to journal_service.
"""
from rest_framework.decorators import api_view
from rest_framework import status

from apps.core.response import success_response, error_response
from apps.journal.serializers import JournalEntrySerializer, JournalEntryCreateSerializer
from apps.journal.services.journal_service import (
    create_entry,
    list_entries,
    get_entry,
    update_entry,
    delete_entry,
)


@api_view(["GET", "POST"])
def entry_list_create_view(request):
    """List all entries (GET) or create a new entry (POST)."""
    if request.method == "GET":
        entries = list_entries(request.user)
        serializer = JournalEntrySerializer(entries, many=True)
        return success_response(data=serializer.data)

    serializer = JournalEntryCreateSerializer(data=request.data)
    if not serializer.is_valid():
        return error_response(
            message="Validation failed.",
            errors=serializer.errors,
            status_code=status.HTTP_400_BAD_REQUEST,
        )

    entry = create_entry(request.user, serializer.validated_data)
    return success_response(
        data=JournalEntrySerializer(entry).data,
        message="Entry created.",
        status_code=status.HTTP_201_CREATED,
    )


@api_view(["GET", "PUT", "DELETE"])
def entry_detail_view(request, entry_id):
    """Retrieve (GET), update (PUT), or delete (DELETE) a single entry."""
    if request.method == "GET":
        entry = get_entry(request.user, entry_id)
        if entry is None:
            return error_response(
                message="Entry not found.",
                status_code=status.HTTP_404_NOT_FOUND,
            )
        return success_response(data=JournalEntrySerializer(entry).data)

    if request.method == "PUT":
        serializer = JournalEntryCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return error_response(
                message="Validation failed.",
                errors=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST,
            )
        entry = update_entry(request.user, entry_id, serializer.validated_data)
        if entry is None:
            return error_response(
                message="Entry not found.",
                status_code=status.HTTP_404_NOT_FOUND,
            )
        return success_response(
            data=JournalEntrySerializer(entry).data,
            message="Entry updated.",
        )

    # DELETE
    deleted = delete_entry(request.user, entry_id)
    if not deleted:
        return error_response(
            message="Entry not found.",
            status_code=status.HTTP_404_NOT_FOUND,
        )
    return success_response(message="Entry deleted.")
