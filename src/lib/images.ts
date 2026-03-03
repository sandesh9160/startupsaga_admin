

const BASE_URL =
  process.env.NEXT_PUBLIC_IMAGE_URL?.replace(/\/api\/?$/, "") || "";

export function getSafeImageSrc(src: unknown, fallback: string = "/placeholder.svg") {
  if (typeof src === "string") {
    const trimmed = src.trim();
    if (trimmed.length > 0) {
      if (trimmed.startsWith("http") || trimmed.startsWith("//") || trimmed.startsWith("data:")) {
        return trimmed;
      }

      // If it's a media or static path, return relative to allow Next.js proxy to handle it
      // This avoids CORS issues and localhost vs 127.0.0.1 mismatches
      if (trimmed.startsWith("/media/") || trimmed.startsWith("media/") ||
        trimmed.startsWith("/static/") || trimmed.startsWith("static/")) {
        return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
      }

      // If it's a local placeholder or asset, return as is
      if (trimmed.startsWith("/placeholder") || trimmed.startsWith("/assets") || trimmed.startsWith("/images")) {
        return trimmed;
      }

      // Handle other relative paths presumably from Django
      const separator = trimmed.startsWith("/") ? "" : "/";
      return `${BASE_URL}${separator}${trimmed}`;
    }
  }
  return fallback;
}
