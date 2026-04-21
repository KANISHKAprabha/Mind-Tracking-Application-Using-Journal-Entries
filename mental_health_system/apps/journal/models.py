"""Journal entry model — stores text, sentiment, and timestamps."""
from django.conf import settings
from django.db import models


class JournalEntry(models.Model):
    SENTIMENT_STATUS_CHOICES = [
        ("pending", "Pending"),
        ("done", "Done"),
        ("failed", "Failed"),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="journal_entries",
    )
    content = models.TextField()
    sentiment_score = models.FloatField(
        null=True,
        blank=True,
        help_text="Score from -1 (very negative) to +1 (very positive)",
    )
    sentiment_label = models.CharField(max_length=20, blank=True, default="")
    sentiment_status = models.CharField(
        max_length=10,
        choices=SENTIMENT_STATUS_CHOICES,
        default="pending",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name_plural = "Journal entries"

    def __str__(self):
        return f"{self.user.username} — {self.created_at:%Y-%m-%d %H:%M}"
