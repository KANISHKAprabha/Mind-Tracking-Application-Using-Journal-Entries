"""
Celery tasks for journal app — runs sentiment analysis in the background.
"""
import logging
from celery import shared_task

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=2, default_retry_delay=5)
def analyze_sentiment_task(self, entry_id):
    """
    Analyze sentiment for a journal entry in the background.
    Updates the entry with score, label, and status when done.
    """
    from apps.journal.models import JournalEntry
    from apps.journal.services.sentiment import analyze_sentiment

    try:
        entry = JournalEntry.objects.get(id=entry_id)
    except JournalEntry.DoesNotExist:
        logger.error("Entry %s not found — skipping sentiment analysis.", entry_id)
        return

    try:
        score, label = analyze_sentiment(entry.content)

        if score is not None:
            entry.sentiment_score = score
            entry.sentiment_label = label
            entry.sentiment_status = "done"
        else:
            entry.sentiment_status = "failed"

        entry.save()
        logger.info("Sentiment analysis complete for entry %s: %s", entry_id, label)

    except Exception as exc:
        logger.error("Sentiment analysis failed for entry %s: %s", entry_id, exc)
        entry.sentiment_status = "failed"
        entry.save()
        raise self.retry(exc=exc)
