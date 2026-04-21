import { useState, useEffect, useCallback, useRef } from "react";
import {
  getEntries,
  getEntry,
  createEntry,
  updateEntry,
  deleteEntry,
} from "../api/journal";
import MoodLoader from "../components/MoodLoader";
import { getEntryDisplay } from "../utils/emotionMeta";

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

export default function JournalPage() {
  const [entries, setEntries] = useState([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState("");
  const pollTimers = useRef({});

  const fetchEntries = useCallback(async () => {
    try {
      const res = await getEntries();
      setEntries(res.data.data);
    } catch {
      setError("We couldn't load your entries right now.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  // Poll pending entries for sentiment status updates
  const startPolling = useCallback((entryId) => {
    if (pollTimers.current[entryId]) return;

    const interval = setInterval(async () => {
      try {
        const res = await getEntry(entryId);
        const updated = res.data.data;

        if (updated.sentiment_status !== "pending") {
          clearInterval(pollTimers.current[entryId]);
          delete pollTimers.current[entryId];

          setEntries((prev) =>
            prev.map((e) => (e.id === entryId ? updated : e))
          );
        }
      } catch {
        clearInterval(pollTimers.current[entryId]);
        delete pollTimers.current[entryId];
      }
    }, 3000);

    pollTimers.current[entryId] = interval;
  }, []);

  useEffect(() => {
    entries.forEach((entry) => {
      if (entry.sentiment_status === "pending") {
        startPolling(entry.id);
      }
    });
  }, [entries, startPolling]);

  useEffect(() => {
    const timers = pollTimers.current;
    return () => {
      Object.values(timers).forEach(clearInterval);
    };
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");
    if (!content.trim()) {
      setError("Please write something before saving.");
      return;
    }
    setSaving(true);
    try {
      await createEntry({ content });
      setContent("");
      fetchEntries();
    } catch (err) {
      const msg =
        err.response?.data?.errors?.content?.[0] ||
        err.response?.data?.message ||
        "We couldn't save your entry. Please try again.";
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (pollTimers.current[id]) {
      clearInterval(pollTimers.current[id]);
      delete pollTimers.current[id];
    }
    try {
      await deleteEntry(id);
      fetchEntries();
    } catch {
      setError("We couldn't delete that entry.");
    }
  };

  const handleEditStart = (entry, e) => {
    e.stopPropagation();
    setEditingId(entry.id);
    setEditContent(entry.content);
    setError("");
  };

  const handleEditCancel = (e) => {
    e?.stopPropagation();
    setEditingId(null);
    setEditContent("");
  };

  const handleEditSave = async (id, e) => {
    e?.stopPropagation();
    setError("");
    try {
      await updateEntry(id, { content: editContent });
      setEditingId(null);
      setEditContent("");
      fetchEntries();
    } catch (err) {
      const msg =
        err.response?.data?.errors?.content?.[0] ||
        "We couldn't update that entry.";
      setError(msg);
    }
  };

  return (
    <div
      style={{
        maxWidth: 880,
        margin: "0 auto",
        padding: "32px 24px 80px",
      }}
    >
      {/* Compose card */}
      <div className="mt-card fade-in">
        <div className="mt-section-label">NEW ENTRY</div>
        <form onSubmit={handleCreate}>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="How are you feeling today? Write freely…"
            rows={5}
            disabled={saving}
            className="mt-input"
            style={{
              height: "auto",
              padding: 16,
              lineHeight: 1.6,
              resize: "vertical",
              fontFamily: '"DM Sans", sans-serif',
            }}
          />
          {error && !editingId && (
            <div className="mt-banner-error" style={{ marginTop: 12, marginBottom: 0 }}>
              {error}
            </div>
          )}
          <div style={{ marginTop: 16 }}>
            <button
              type="submit"
              className="mt-btn mt-btn-cta"
              disabled={saving}
            >
              {saving ? "Saving…" : "Save Entry"}
            </button>
          </div>
        </form>
      </div>

      {/* Entries list */}
      <div className="mt-card fade-in delay-2" style={{ marginTop: 20 }}>
        <div className="mt-section-label">YOUR ENTRIES</div>

        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="mt-skeleton"
                style={{ height: 76 }}
              />
            ))}
          </div>
        ) : entries.length === 0 ? (
          <div
            style={{
              color: "var(--muted)",
              fontSize: 14,
              textAlign: "center",
              padding: "32px 0",
            }}
          >
            No entries yet. Start writing to see your journey unfold.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {entries.map((entry) => {
              const display = getEntryDisplay(entry);
              const isOpen = expandedId === entry.id;
              const isEditing = editingId === entry.id;
              const isPending = entry.sentiment_status === "pending";

              return (
                <div
                  key={entry.id}
                  onClick={() =>
                    !isEditing && setExpandedId(isOpen ? null : entry.id)
                  }
                  style={{
                    border: `1px solid ${
                      isOpen ? display.color + "40" : "var(--border)"
                    }`,
                    borderRadius: 14,
                    padding: 14,
                    background: isOpen
                      ? "rgba(99, 102, 241, 0.04)"
                      : "transparent",
                    cursor: isEditing ? "default" : "pointer",
                    transition: "all 0.25s ease",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: 12,
                      marginBottom: 6,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 11,
                        color: "var(--muted)",
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                      }}
                    >
                      {formatDate(entry.created_at)}
                    </div>
                    {isPending ? (
                      <MoodLoader />
                    ) : (
                      <span
                        style={{
                          background: display.bg,
                          color: display.color,
                          fontSize: 11,
                          fontWeight: 600,
                          padding: "4px 10px",
                          borderRadius: 999,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {display.label}
                      </span>
                    )}
                  </div>

                  {isEditing ? (
                    <div onClick={(e) => e.stopPropagation()}>
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        rows={4}
                        className="mt-input"
                        style={{
                          height: "auto",
                          padding: 14,
                          lineHeight: 1.5,
                          resize: "vertical",
                          fontFamily: '"DM Sans", sans-serif',
                        }}
                      />
                      {error && (
                        <div
                          className="mt-banner-error"
                          style={{ marginTop: 10, marginBottom: 0 }}
                        >
                          {error}
                        </div>
                      )}
                      <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
                        <button
                          type="button"
                          onClick={(e) => handleEditSave(entry.id, e)}
                          style={smallPrimaryBtn}
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={handleEditCancel}
                          style={smallGhostBtn}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p
                      style={{
                        fontSize: 14,
                        color: "var(--text)",
                        margin: 0,
                        lineHeight: 1.6,
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {entry.content}
                    </p>
                  )}

                  {isOpen && !isEditing && (
                    <div
                      className="fade-in"
                      style={{
                        marginTop: 12,
                        paddingTop: 12,
                        borderTop: "1px solid var(--border)",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 16,
                        flexWrap: "wrap",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          gap: 16,
                          fontSize: 12,
                          color: "var(--muted)",
                          flexWrap: "wrap",
                        }}
                      >
                        <div>
                          <span
                            style={{
                              display: "inline-block",
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              background: display.color,
                              marginRight: 6,
                            }}
                          />
                          {display.isEmotion ? "Emotion" : "Mood"}:{" "}
                          <strong style={{ color: "var(--text)" }}>
                            {display.label}
                          </strong>
                        </div>
                        <div>
                          Sentiment:{" "}
                          <strong style={{ color: "var(--text)" }}>
                            {entry.sentiment_score != null
                              ? (entry.sentiment_score >= 0 ? "+" : "") +
                                entry.sentiment_score.toFixed(2)
                              : "—"}
                          </strong>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          type="button"
                          onClick={(e) => handleEditStart(entry, e)}
                          style={smallGhostBtn}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleDelete(entry.id, e)}
                          style={smallDangerBtn}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

const smallPrimaryBtn = {
  background: "var(--accent)",
  color: "#fff",
  border: "none",
  borderRadius: 10,
  padding: "8px 18px",
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
  fontFamily: '"DM Sans", sans-serif',
};

const smallGhostBtn = {
  background: "transparent",
  color: "var(--text)",
  border: "1px solid var(--border)",
  borderRadius: 10,
  padding: "7px 16px",
  fontSize: 13,
  fontWeight: 500,
  cursor: "pointer",
  fontFamily: '"DM Sans", sans-serif',
};

const smallDangerBtn = {
  background: "transparent",
  color: "var(--danger)",
  border: "1px solid rgba(248, 113, 113, 0.3)",
  borderRadius: 10,
  padding: "7px 16px",
  fontSize: 13,
  fontWeight: 500,
  cursor: "pointer",
  fontFamily: '"DM Sans", sans-serif',
};
