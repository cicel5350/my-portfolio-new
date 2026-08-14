type AboutMeDoodleProps = {
  /** Handwritten label text */
  text?: string;
  /** Shared color for text + underlines */
  color?: string;
  /** Font size in px (Retina-safe via SVG viewBox scaling) */
  fontSize?: number;
  className?: string;
};

/** Split trailing ! / ！ so underlines center on the words only. */
function splitLabel(text: string) {
  const match = text.match(/^(.*?)([!！]+)?$/u);
  return {
    body: (match?.[1] ?? text).trimEnd(),
    mark: match?.[2] ?? "",
  };
}

/**
 * Figma 286:2467 / 341:2477 — "about me！" with three hand-drawn underlines.
 * Underlines are optically centered under the words, excluding trailing "！".
 */
export default function AboutMeDoodle({
  text = "about me！",
  color = "#0B0C0F",
  fontSize = 32,
  className = "",
}: AboutMeDoodleProps) {
  const { body, mark } = splitLabel(text);
  const underlineWidth = Math.round(fontSize * 2.15);

  const textStyle = {
    color,
    fontSize,
  } as const;

  return (
    <div className={`inline-flex items-start ${className}`}>
      {/* Words + underlines share one centered column */}
      <div className="inline-flex flex-col items-center">
        <span
          className="font-caveat relative z-[1] whitespace-nowrap font-normal leading-none"
          style={textStyle}
        >
          {body}
        </span>

        <svg
          className="pointer-events-none mt-[0.15em] block overflow-visible"
          width={underlineWidth}
          height={Math.round(fontSize * 0.42)}
          viewBox="0 0 64 14"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden
        >
          <path
            d="M3 3.3 C 14 1.9, 24 1.6, 32 2.5 C 40 3.4, 50 2.0, 61 2.9"
            stroke={color}
            strokeWidth="1.55"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M16 7.0 C 23 5.8, 28 5.7, 32 6.5 C 37 7.4, 43 6.3, 48 6.9"
            stroke={color}
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M4 11.1 C 15 10.2, 24 12.0, 32 10.9 C 41 9.8, 51 11.5, 60 10.5"
            stroke={color}
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Exclamation sits beside the words, outside the underline centering box */}
      {mark ? (
        <span
          className="font-caveat whitespace-nowrap font-normal leading-none"
          style={textStyle}
        >
          {mark}
        </span>
      ) : null}
    </div>
  );
}
