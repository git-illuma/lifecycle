import type { Provider } from "@illuma/core";
import { ASYNC_INIT_NODE, ASYNC_SHUTDOWN_NODE, SHUTDOWN_DRAIN_NODE } from "./tokens";
import type { AsyncInitFn, AsyncShutdownFn, ShutdownDrainFn } from "./types";

// The `factory` runs in injection context, so it can `nodeInject` its
// dependencies and close over them in the returned hook:
//
//   provideAsyncShutdown(() => {
//     const conn = nodeInject(CONNECTION);
//     return () => conn.close();
//   });
//
// For a hook with no dependencies, return it directly: `provideAsyncInit(() => myHook)`.

/** Register an async init hook (run at boot, in registration order). */
export function provideAsyncInit(factory: () => AsyncInitFn): Provider {
  return ASYNC_INIT_NODE.withFactory(factory);
}

/** Register a phase-1 drain hook (stop intake; run concurrently on shutdown). */
export function provideShutdownDrain(factory: () => ShutdownDrainFn): Provider {
  return SHUTDOWN_DRAIN_NODE.withFactory(factory);
}

/** Register a phase-2 teardown hook (close resources; sequential on shutdown). */
export function provideAsyncShutdown(factory: () => AsyncShutdownFn): Provider {
  return ASYNC_SHUTDOWN_NODE.withFactory(factory);
}
