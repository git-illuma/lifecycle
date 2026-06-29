import { NodeContainer, NodeToken, nodeInject } from "@illuma/core";
import { describe, expect, it } from "vitest";
import {
  provideAsyncInit,
  provideAsyncShutdown,
  provideShutdownDrain,
} from "./providers";
import { runAsyncInit, runShutdownDrain } from "./runner";
import { ASYNC_INIT_NODE, ASYNC_SHUTDOWN_NODE, SHUTDOWN_DRAIN_NODE } from "./tokens";

describe("provide* helpers", () => {
  it("registers init hooks the container collects and the runner drains in order", async () => {
    const order: string[] = [];
    const container = new NodeContainer();
    container.provide(
      provideAsyncInit(() => async () => {
        order.push("a");
      }),
    );
    container.provide(
      provideAsyncInit(() => async () => {
        order.push("b");
      }),
    );

    container.bootstrap();
    const hooks = container.get(ASYNC_INIT_NODE);
    expect(hooks).toHaveLength(2);
    await runAsyncInit(hooks);
    expect(order).toEqual(["a", "b"]);
  });

  it("runs the factory in injection context (the hook can close over injected deps)", async () => {
    const DEP = new NodeToken<string>("DEP");
    const container = new NodeContainer();
    let captured: string | undefined;
    container.provide(DEP.withValue("drained"));
    container.provide(
      provideShutdownDrain(() => {
        const dep = nodeInject(DEP); // proves the factory runs in injection context
        return async () => {
          captured = dep;
        };
      }),
    );
    container.bootstrap();
    await runShutdownDrain(container.get(SHUTDOWN_DRAIN_NODE));
    expect(captured).toBe("drained");
  });

  it("routes each helper to its own token", () => {
    const container = new NodeContainer();
    container.provide(provideAsyncShutdown(() => async () => {}));
    container.bootstrap();
    expect(container.get(ASYNC_SHUTDOWN_NODE)).toHaveLength(1);
  });
});
