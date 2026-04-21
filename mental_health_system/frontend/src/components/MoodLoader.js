/**
 * MoodLoader — A unique animated "breathing orb" that displays
 * while sentiment analysis is processing in the background.
 *
 * The orb gently pulses and shifts through soft mood colors
 * (lavender → peach → mint) to feel calming, not clinical.
 */
export default function MoodLoader() {
  return (
    <div className="inline-flex items-center gap-2 mt-2">
      {/* The breathing orb */}
      <div className="relative flex items-center justify-center">
        {/* Outer glow ring */}
        <div
          className="absolute w-8 h-8 rounded-full opacity-30"
          style={{
            background: "linear-gradient(135deg, #a78bfa, #f9a8d4, #6ee7b7)",
            animation: "moodPulse 2.4s ease-in-out infinite",
          }}
        />
        {/* Inner orb */}
        <div
          className="relative w-5 h-5 rounded-full"
          style={{
            background: "linear-gradient(135deg, #8b5cf6, #ec4899, #34d399)",
            backgroundSize: "200% 200%",
            animation:
              "moodPulse 2.4s ease-in-out infinite, moodShift 3.6s ease-in-out infinite",
          }}
        />
        {/* Tiny sparkle dots orbiting */}
        <div
          className="absolute w-1.5 h-1.5 bg-purple-300 rounded-full"
          style={{
            animation: "moodOrbit 2s linear infinite",
            transformOrigin: "12px 12px",
          }}
        />
        <div
          className="absolute w-1 h-1 bg-pink-300 rounded-full"
          style={{
            animation: "moodOrbit 2s linear infinite reverse",
            transformOrigin: "10px 10px",
          }}
        />
      </div>

      {/* Text */}
      <span className="text-xs text-purple-400 font-medium tracking-wide">
        Feeling your mood
        <span style={{ animation: "moodDots 1.5s steps(4, end) infinite" }}>
          ...
        </span>
      </span>

      {/* Keyframes injected via style tag */}
      <style>{`
        @keyframes moodPulse {
          0%, 100% { transform: scale(1); opacity: 0.7; }
          50% { transform: scale(1.35); opacity: 1; }
        }

        @keyframes moodShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        @keyframes moodOrbit {
          0% { transform: rotate(0deg) translateX(10px) rotate(0deg); }
          100% { transform: rotate(360deg) translateX(10px) rotate(-360deg); }
        }

        @keyframes moodDots {
          0% { content: ""; opacity: 0.2; }
          25% { opacity: 0.4; }
          50% { opacity: 0.7; }
          75% { opacity: 1; }
          100% { opacity: 0.2; }
        }
      `}</style>
    </div>
  );
}
