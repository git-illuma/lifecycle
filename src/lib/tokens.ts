import { MultiNodeToken } from "@illuma/core";

// Explicit annotations (not just inferred from the constructor) so JSR sees no
// "slow types" across the @illuma/core package boundary.
type LifecycleHook = () => Promise<void>;

export const ASYNC_INIT_NODE: MultiNodeToken<LifecycleHook> =
  new MultiNodeToken<LifecycleHook>("ASYNC_INIT_NODE");
export const ASYNC_SHUTDOWN_NODE: MultiNodeToken<LifecycleHook> =
  new MultiNodeToken<LifecycleHook>("ASYNC_SHUTDOWN_NODE");

// Phase-1 shutdown: stop accepting new work (HTTP/NATS/Telegram intake) and let
// in-flight handlers finish on a still-live connection. Runs before
// ASYNC_SHUTDOWN_NODE (phase-2 teardown) in Application.stop().
export const SHUTDOWN_DRAIN_NODE: MultiNodeToken<LifecycleHook> =
  new MultiNodeToken<LifecycleHook>("SHUTDOWN_DRAIN_NODE");
