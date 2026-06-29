import { MultiNodeToken } from "@illuma/core";
import type { AsyncInitFn, AsyncShutdownFn, ShutdownDrainFn } from "./types";

// Explicit annotations (not just inferred from the constructor) so JSR sees no
// "slow types" across the @illuma/core package boundary.

export const ASYNC_INIT_NODE: MultiNodeToken<AsyncInitFn> =
  new MultiNodeToken<AsyncInitFn>("ASYNC_INIT_NODE");

// Phase-1 shutdown: stop accepting new work (HTTP/NATS/Telegram intake) and let
// in-flight handlers finish on a still-live connection. Runs before
// ASYNC_SHUTDOWN_NODE (phase-2 teardown).
export const SHUTDOWN_DRAIN_NODE: MultiNodeToken<ShutdownDrainFn> =
  new MultiNodeToken<ShutdownDrainFn>("SHUTDOWN_DRAIN_NODE");

export const ASYNC_SHUTDOWN_NODE: MultiNodeToken<AsyncShutdownFn> =
  new MultiNodeToken<AsyncShutdownFn>("ASYNC_SHUTDOWN_NODE");
