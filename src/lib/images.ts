import { API_BASE_URL } from "./api";

export function getSafeImageSrc(src: unknown, fallback: string = "/placeholder.svg") {
  if (typeof src === "string") {
    const trimmed = src.trim();
    if (trimmed.length > 0) {
      if (trimmed.startsWith("http") || trimmed.startsWith("//") || trimmed.startsWith("data:")) {
        // If it's a local absolute URL, convert it to relative to use Next.js rewrites
        if (trimmed.includes("localhost:8000") || trimmed.includes("127.0.0.1:8000")) {
          return "/media" + trimmed.split("/media")[1];
        }
        return trimmed;
      }

      // If it's a media or static path, return relative to allow Next.js proxy to handle it
      if (trimmed.startsWith("/media/") || trimmed.startsWith("media/") ||
        trimmed.startsWith("/static/") || trimmed.startsWith("static/")) {
        return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
      }

      // If it's a local placeholder or asset, return as is
      if (trimmed.startsWith("/placeholder") || trimmed.startsWith("/assets") || trimmed.startsWith("/images")) {
        return trimmed;
      }

      // Handle other relative paths presumably from Django
      // If it looks like a path but doesn't have media prefix, try adding it
      // Many Django fields return relative to MEDIA_ROOT without the prefix

      const path = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;

      // If we have a BASE_URL and it's a relative path, we should probably prefix it with /media
      // unless it's already a full static path handled above
      if (!path.startsWith("/media/") && !path.startsWith("/static/")) {
        return `/media${path}`;
      }

      return path;
    }
  }
  return fallback;
}
