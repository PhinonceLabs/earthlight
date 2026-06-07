import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * EarthlightMark — the brand's sun glyph.
 *
 * Sampled from earthlight.app: a circular sun rendered as a radial gradient
 * from a warm amber core (#FFC107) through saturated orange (#FF6A0A) into
 * a deeper terracotta edge (#CC3702), with a soft inner highlight that
 * pushes the apparent light source toward the upper-left.
 *
 * Decorative-only by default (aria-hidden). Pass `title` to expose it as an
 * img to assistive tech (used on the auth shell wordmark).
 */
export interface EarthlightMarkProps extends React.SVGAttributes<SVGSVGElement> {
  /** Diameter in px. Defaults to 1em so it scales with the surrounding text. */
  size?: number | string;
  /** Optional accessible label. When provided the SVG becomes role="img". */
  title?: string;
}

export function EarthlightMark({
  size = "1em",
  title,
  className,
  ...rest
}: EarthlightMarkProps) {
  const accessibleProps = title
    ? { role: "img" as const, "aria-label": title }
    : { "aria-hidden": true };

  // Unique gradient IDs prevent collisions when multiple marks render on the
  // same page (e.g. header + hero + footer). React.useId is SSR-safe and
  // produces matching ids on the server and client during hydration.
  const uid = React.useId();
  const coreId = `el-sun-core-${uid}`;
  const haloId = `el-sun-halo-${uid}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("inline-block shrink-0", className)}
      {...accessibleProps}
      {...rest}
    >
      <defs>
        {/* Core: warm amber → saturated orange → terracotta edge. The focal
            point is offset to upper-left to suggest a single light source. */}
        <radialGradient id={coreId} cx="0.35" cy="0.32" r="0.85">
          <stop offset="0%"  stopColor="#FFF1B8" />
          <stop offset="22%" stopColor="#FFC107" />
          <stop offset="68%" stopColor="#FF6A0A" />
          <stop offset="100%" stopColor="#CC3702" />
        </radialGradient>
        {/* Halo: very soft outer glow, only visible against paper. */}
        <radialGradient id={haloId} cx="0.5" cy="0.5" r="0.5">
          <stop offset="60%"  stopColor="#FFC107" stopOpacity="0" />
          <stop offset="100%" stopColor="#FF6A0A" stopOpacity="0.22" />
        </radialGradient>
      </defs>

      {/* Outer halo — drawn first so the core sits on top. */}
      <circle cx="24" cy="24" r="23" fill={`url(#${haloId})`} />
      {/* Sun disc. */}
      <circle cx="24" cy="24" r="18" fill={`url(#${coreId})`} />
      {/* Inner specular highlight — gives the disc a soft 3-D quality
          without making it look like a beach-ball. */}
      <ellipse cx="18.5" cy="17.5" rx="6.5" ry="4" fill="#FFF7DA" opacity="0.55" />
    </svg>
  );
}

/**
 * EarthlightWordmark — the brand wordmark composed of the sun mark beside
 * the "Earthlight" serif word. Use in the app header, landing hero, and
 * not-found page.
 */
export interface EarthlightWordmarkProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Approximate height of the mark in px; the word scales relatively. */
  markSize?: number;
  /** When true, renders just the word — handy for compact stacks. */
  hideMark?: boolean;
}

export function EarthlightWordmark({
  markSize = 28,
  hideMark = false,
  className,
  ...rest
}: EarthlightWordmarkProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 font-display text-earthlight-ink",
        "leading-none tracking-tight",
        className,
      )}
      {...rest}
    >
      {!hideMark && (
        <EarthlightMark
          size={markSize}
          title="Earthlight"
          className="-mt-0.5"
        />
      )}
      <span className="text-[1.25em] font-semibold">Earthlight</span>
    </span>
  );
}

