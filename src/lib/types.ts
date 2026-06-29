// All three hook kinds are structurally `() => Promise<void>` — kept as distinct
// named aliases so signatures read by intent (init vs drain vs teardown).

/** Async work to run at boot (connect DB/NATS, warm caches). */
export type AsyncInitFn = () => Promise<void>;

/** Phase-1 shutdown: stop accepting new work, let in-flight handlers finish. */
export type ShutdownDrainFn = () => Promise<void>;

/** Phase-2 shutdown: tear down connections/resources, after the drain. */
export type AsyncShutdownFn = () => Promise<void>;

/**
 * Notified when an isolated (drain/teardown) hook throws, so one failure can't
 * strand the rest. Init hooks are NOT isolated — they fail fast.
 */
export type HookErrorHandler = (error: unknown) => void;
