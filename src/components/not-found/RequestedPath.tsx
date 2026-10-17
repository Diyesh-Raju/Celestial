"use client";

import { useSyncExternalStore } from "react";

const noSubscribe = () => () => {};

/* The URL that missed, read from the browser: the 404 page is prerendered once
   and served for every unmatched path, so the server never knows which one. */
export function RequestedPath() {
  const path = useSyncExternalStore(
    noSubscribe,
    () => window.location.pathname,
    () => null,
  );
  if (!path || path === "/") return null;

  let shown = path;
  try {
    shown = decodeURIComponent(path);
  } catch {
    // Malformed escapes: show the path as it came
  }

  return (
    <p className="rise mt-8 inline-flex max-w-full items-center gap-2 rounded-full border border-paper/15 bg-paper/[0.05] py-1.5 pl-2 pr-4 text-sm text-paper/60 backdrop-blur-md [--delay:260ms]">
      <span className="rounded-full bg-rose/15 px-2 py-0.5 font-mono text-[11px] uppercase tracking-widest text-rose">
        404
      </span>
      <code className="truncate font-mono text-paper/85">{shown}</code>
    </p>
  );
}
