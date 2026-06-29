import type {
  AsyncInitFn,
  AsyncShutdownFn,
  HookErrorHandler,
  ShutdownDrainFn,
} from "./types";

// A failing isolated hook must not strand the others — report and continue.
async function isolate(
  hook: () => Promise<void>,
  onError?: HookErrorHandler,
): Promise<void> {
  try {
    await hook();
  } catch (error) {
    onError?.(error);
  }
}

/**
 * Run init hooks in registration order. **Fail-fast**: a throwing hook aborts
 * (the error propagates) — a half-initialized process must not start serving.
 */
export async function runAsyncInit(hooks: readonly AsyncInitFn[]): Promise<void> {
  for (const hook of hooks) await hook();
}

/**
 * Phase-1 graceful shutdown: stop intake. Independent stoppers run
 * **concurrently**; a failure is isolated (one hook must not strand the others)
 * and surfaced via `onError`.
 */
export async function runShutdownDrain(
  hooks: readonly ShutdownDrainFn[],
  onError?: HookErrorHandler,
): Promise<void> {
  await Promise.all(hooks.map((hook) => isolate(hook, onError)));
}

/**
 * Phase-2 shutdown: teardown. **Sequential** — ordering constraints (drain the
 * shared connection after its users, DB last) ride on registration order.
 * Failures are isolated and surfaced via `onError`.
 */
export async function runAsyncShutdown(
  hooks: readonly AsyncShutdownFn[],
  onError?: HookErrorHandler,
): Promise<void> {
  for (const hook of hooks) await isolate(hook, onError);
}

/**
 * The full stop sequence: drain intake (concurrent), then tear down
 * (sequential). Mirrors what an application runtime does on SIGTERM.
 */
export async function runShutdown(
  drainHooks: readonly ShutdownDrainFn[],
  shutdownHooks: readonly AsyncShutdownFn[],
  onError?: HookErrorHandler,
): Promise<void> {
  await runShutdownDrain(drainHooks, onError);
  await runAsyncShutdown(shutdownHooks, onError);
}
