"""Journal URL routes."""
from django.urls import path
from apps.journal.views.journal_views import entry_list_create_view, entry_detail_view

urlpatterns = [
    path("entries/", entry_list_create_view, name="entry-list-create"),
    path("entries/<int:entry_id>/", entry_detail_view, name="entry-detail"),
]
