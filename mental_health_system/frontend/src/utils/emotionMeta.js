/**
 * Single source of truth for emotion display across the app.
 * Maps the 7 emotion labels from j-hartmann/emotion-english-distilroberta-base
 * to colors, display names, and a friendly fallback for legacy POSITIVE/NEGATIVE
 * entries that were created before the model swap.
 */

export const EMOTION_COLORS = {
  joy: "#34d399",
  sadness: "#60a5fa",
  anger: "#f87171",
  fear: "#a78bfa",
  surprise: "#fbbf24",
  disgust: "#fb923c",
  neutral: "#94a3b8",
};

export const EMOTION_LABELS = {
  joy: "Joy",
  sadness: "Sadness",
  anger: "Anger",
  fear: "Fear",
  surprise: "Surprise",
  disgust: "Disgust",
  neutral: "Neutral",
};

// Display order for legends and stacked breakdowns
export const EMOTION_ORDER = [
  "joy",
  "surprise",
  "neutral",
  "sadness",
  "fear",
  "anger",
  "disgust",
];

// Legacy fallback colors for entries that still have POSITIVE/NEGATIVE labels
const FALLBACK_COLORS = {
  Positive: "#34d399",
  Neutral: "#94a3b8",
  Negative: "#f87171",
};

const moodFromScore = (score) => {
  if (score == null) return "Neutral";
  if (score > 0.15) return "Positive";
  if (score < -0.15) return "Negative";
  return "Neutral";
};

/**
 * Convert a hex color like "#34d399" to "rgba(52, 211, 153, a)".
 */
export function hexToRgba(hex, alpha = 1) {
  const cleaned = hex.replace("#", "");
  const r = parseInt(cleaned.slice(0, 2), 16);
  const g = parseInt(cleaned.slice(2, 4), 16);
  const b = parseInt(cleaned.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Given a journal entry, return display info for its mood pill / chart point.
 *
 * Handles three cases:
 *   1. New entries with one of the 7 emotion labels → use that emotion
 *   2. Legacy entries labelled "POSITIVE"/"NEGATIVE" → bucket from sentiment_score
 *   3. Entries with no label at all → bucket from sentiment_score
 */
export function getEntryDisplay(entry) {
  const raw = (entry?.sentiment_label || "").toLowerCase();

  if (EMOTION_COLORS[raw]) {
    const color = EMOTION_COLORS[raw];
    return {
      key: raw,
      label: EMOTION_LABELS[raw],
      color,
      bg: hexToRgba(color, 0.12),
      isEmotion: true,
    };
  }

  const mood = moodFromScore(entry?.sentiment_score);
  const color = FALLBACK_COLORS[mood];
  return {
    key: mood.toLowerCase(),
    label: mood,
    color,
    bg: hexToRgba(color, 0.12),
    isEmotion: false,
  };
}
