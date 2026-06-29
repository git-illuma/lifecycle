import { describe, expect, it, vi } from "vitest";
import { runAsyncInit, runAsyncShutdown, runShutdown, runShutdownDrain } from "./runner";

describe("runAsyncInit", () => {
  it("runs hooks in registration order", async () => {
    const order: number[] = [];
    await runAsyncInit([
      async () => {
        order.push(1);
      },
      async () => {
        order.push(2);
      },
    ]);
    expect(order).toEqual([1, 2]);
  });

  it("is fail-fast: a throwing hook propagates and stops the rest", async () => {
    const after = vi.fn();
    const boom = new Error("init failed");
    await expect(
      runAsyncInit([
        async () => {
          throw boom;
        },
        async () => after(),
      ]),
    ).rejects.toBe(boom);
    expect(after).not.toHaveBeenCalled();
  });

  it("no-ops on an empty list", async () => {
    await expect(runAsyncInit([])).resolves.toBeUndefined();
  });
});

describe("runShutdownDrain", () => {
  it("runs all hooks concurrently", async () => {
    let active = 0;
    let maxActive = 0;
    const hook = () => async () => {
      active++;
      maxActive = Math.max(maxActive, active);
      await new Promise((r) => setTimeout(r, 5));
      active--;
    };
    await runShutdownDrain([hook(), hook(), hook()]);
    expect(maxActive).toBe(3);
  });

  it("isolates a failing hook and reports it; others still run", async () => {
    const onError = vi.fn();
    const ok = vi.fn();
    const boom = new Error("drain failed");
    await runShutdownDrain(
      [
        async () => {
          throw boom;
        },
        async () => ok(),
      ],
      onError,
    );
    expect(ok).toHaveBeenCalledOnce();
    expect(onError).toHaveBeenCalledWith(boom);
  });
});

describe("runAsyncShutdown", () => {
  it("runs hooks sequentially in order, isolating failures", async () => {
    const order: number[] = [];
    const onError = vi.fn();
    await runAsyncShutdown(
      [
        async () => {
          order.push(1);
        },
        async () => {
          throw new Error("x");
        },
        async () => {
          order.push(3);
        },
      ],
      onError,
    );
    expect(order).toEqual([1, 3]);
    expect(onError).toHaveBeenCalledOnce();
  });
});

describe("runShutdown", () => {
  it("drains before tearing down", async () => {
    const order: string[] = [];
    await runShutdown(
      [
        async () => {
          order.push("drain");
        },
      ],
      [
        async () => {
          order.push("teardown");
        },
      ],
    );
    expect(order).toEqual(["drain", "teardown"]);
  });
});
