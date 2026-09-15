import { cn } from "@/lib/cn";

/**
 * Responsive screenshot image for the static export. next/image cannot
 * optimise without a server (`images.unoptimized`), so scripts/prebuild.mjs
 * emits AVIF/WebP renditions under `assets/gen/<key>/` and this component
 * references them with an explicit srcset. `root` is a repo-root asset path
 * without the Pages base path, e.g. "/assets/overview.png"; the base path is
 * prepended here. `width` is the source's intrinsic width; prebuild never
 * upscales, so the srcset stops there too. If the generated directory is
 * missing (a fresh clone before the first build), the browser falls back to
 * the original source.
 */

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const WIDTHS = [480, 640, 1024, 1600, 2400];

export function shotKey(root: string) {
  return root.replace(/^\/assets\//, "").replace(/\.[^.]+$/, "");
}

/** Widths prebuild.mjs actually generated for a source of this width. */
function renderedWidths(width: number) {
  return WIDTHS.filter((w) => w <= width);
}

function srcset(root: string, ext: "avif" | "webp", widths: number[]) {
  const key = shotKey(root);
  return widths.map((w) => `${BASE}/assets/gen/${key}/${key}-${w}w.${ext} ${w}w`).join(", ");
}

export function Shot({
  root,
  alt,
  width,
  height,
  sizes,
  className,
  imgClassName,
  priority = false,
}: {
  root: string;
  alt: string;
  width: number;
  height: number;
  sizes: string;
  className?: string;
  imgClassName?: string;
  priority?: boolean;
}) {
  const widths = renderedWidths(width);
  return (
    <picture className={cn("block", className)}>
      {widths.length > 0 ? (
        <>
          <source type="image/avif" srcSet={srcset(root, "avif", widths)} sizes={sizes} />
          <source type="image/webp" srcSet={srcset(root, "webp", widths)} sizes={sizes} />
        </>
      ) : null}
      <img
        src={`${BASE}${root}`}
        alt={alt}
        width={width}
        height={height}
        sizes={sizes}
        decoding="async"
        loading={priority ? "eager" : "lazy"}
        className={cn("h-auto w-full", imgClassName)}
      />
    </picture>
  );
}
