"""
Re-run sentiment analysis on every journal entry using the current model.

Use after swapping the underlying NLP model so existing entries pick up the
new emotion labels (joy / sadness / anger / fear / disgust / surprise / neutral)
instead of the legacy POSITIVE / NEGATIVE values.

Runs synchronously (no Celery worker required).

Usage:
    python manage.py reanalyze_entries           # all entries
    python manage.py reanalyze_entries --legacy  # only old POSITIVE/NEGATIVE rows
    python manage.py reanalyze_entries --user 1  # only one user's entries
"""
import time

from django.core.management.base import BaseCommand

from apps.journal.models import JournalEntry
from apps.journal.services.sentiment import analyze_sentiment

LEGACY_LABELS = {"POSITIVE", "NEGATIVE", ""}


class Command(BaseCommand):
    help = "Re-run sentiment analysis on existing journal entries."

    def add_arguments(self, parser):
        parser.add_argument(
            "--legacy",
            action="store_true",
            help="Only re-process entries that still have POSITIVE/NEGATIVE/empty labels.",
        )
        parser.add_argument(
            "--user",
            type=int,
            default=None,
            help="Limit to a single user id.",
        )
        parser.add_argument(
            "--sleep",
            type=float,
            default=0.4,
            help="Seconds to wait between API calls (default 0.4).",
        )

    def handle(self, *args, **options):
        qs = JournalEntry.objects.all().order_by("id")
        if options["legacy"]:
            qs = qs.filter(sentiment_label__in=LEGACY_LABELS)
        if options["user"]:
            qs = qs.filter(user_id=options["user"])

        total = qs.count()
        if total == 0:
            self.stdout.write(self.style.WARNING("No entries match the filters."))
            return

        self.stdout.write(
            self.style.NOTICE(f"Re-analyzing {total} entries with the current model...")
        )

        ok = 0
        failed = 0
        for i, entry in enumerate(qs, start=1):
            old_label = entry.sentiment_label or "—"
            score, label = analyze_sentiment(entry.content)

            if score is None:
                failed += 1
                entry.sentiment_status = "failed"
                entry.save(update_fields=["sentiment_status"])
                self.stdout.write(
                    self.style.ERROR(
                        f"  [{i}/{total}] id={entry.id}  FAILED  (was {old_label})"
                    )
                )
            else:
                entry.sentiment_score = score
                entry.sentiment_label = label
                entry.sentiment_status = "done"
                entry.save(
                    update_fields=[
                        "sentiment_score",
                        "sentiment_label",
                        "sentiment_status",
                    ]
                )
                ok += 1
                self.stdout.write(
                    f"  [{i}/{total}] id={entry.id}  {old_label!s:<10} → "
                    f"{label!s:<10} ({score:+.3f})"
                )

            # Be polite to the HF inference API
            if i < total and options["sleep"] > 0:
                time.sleep(options["sleep"])

        self.stdout.write("")
        self.stdout.write(
            self.style.SUCCESS(f"Done. Updated: {ok}, Failed: {failed}")
        )
