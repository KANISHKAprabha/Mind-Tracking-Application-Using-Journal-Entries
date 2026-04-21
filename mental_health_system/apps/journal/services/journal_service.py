"""
Journal business logic — views stay thin, all logic lives here.
"""
from apps.journal.models import JournalEntry
from apps.journal.tasks import analyze_sentiment_task


def create_entry(user, validated_data):
    """Create a journal entry and queue sentiment analysis in the background."""
    content = validated_data["content"]

    entry = JournalEntry.objects.create(
        user=user,
        content=content,
        sentiment_status="pending",
    )

    # Queue background sentiment analysis via Celery
    analyze_sentiment_task.delay(entry.id)

    return entry


def list_entries(user):
    """Return all entries for a user, newest first."""
    return JournalEntry.objects.filter(user=user)


def get_entry(user, entry_id):
    """Return a single entry owned by the user, or None."""
    try:
        return JournalEntry.objects.get(id=entry_id, user=user)
    except JournalEntry.DoesNotExist:
        return None


def update_entry(user, entry_id, validated_data):
    """Update an entry's content and re-run sentiment analysis in background."""
    entry = get_entry(user, entry_id)
    if entry is None:
        return None

    entry.content = validated_data["content"]
    entry.sentiment_score = None
    entry.sentiment_label = ""
    entry.sentiment_status = "pending"
    entry.save()

    # Re-analyze in background
    analyze_sentiment_task.delay(entry.id)

    return entry


def delete_entry(user, entry_id):
    """Delete an entry owned by the user. Returns True if deleted."""
    entry = get_entry(user, entry_id)
    if entry is None:
        return False
    entry.delete()
    return True
