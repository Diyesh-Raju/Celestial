/**
 * Runs heavy WebGL setup (shader compiles, texture uploads) one scene at a time.
 * The browser's GPU process works through it in turn anyway, so a scene that
 * starts while another is still compiling just sits blocked on its first GPU call.
 */
let tail: Promise<unknown> = Promise.resolve();

/** A setup that never settles (its context lost mid-compile, say) holds the line no longer than this. */
const MAX_WAIT_MS = 4000;

export function queueGpuSetup<T>(setup: () => Promise<T>): Promise<T> {
  const run = tail.then(setup);
  tail = Promise.race([run.catch(() => undefined), new Promise((resolve) => setTimeout(resolve, MAX_WAIT_MS))]);
  return run;
}
