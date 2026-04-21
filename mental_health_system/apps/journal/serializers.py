"""Serializers for journal entries."""
from rest_framework import serializers
from apps.journal.models import JournalEntry


class JournalEntrySerializer(serializers.ModelSerializer):
    """Read serializer — returns all fields."""

    class Meta:
        model = JournalEntry
        fields = [
            "id",
            "content",
            "sentiment_score",
            "sentiment_label",
            "sentiment_status",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "sentiment_score",
            "sentiment_label",
            "sentiment_status",
            "created_at",
            "updated_at",
        ]


class JournalEntryCreateSerializer(serializers.Serializer):
    """Validates journal creation input."""

    content = serializers.CharField(min_length=10)
