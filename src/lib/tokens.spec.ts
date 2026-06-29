import { MultiNodeToken } from "@illuma/core";
import { describe, expect, it } from "vitest";
import { ASYNC_INIT_NODE, ASYNC_SHUTDOWN_NODE, SHUTDOWN_DRAIN_NODE } from "./tokens";

describe("lifecycle tokens", () => {
  it("exports three distinct MultiNodeToken instances", () => {
    const all = [ASYNC_INIT_NODE, ASYNC_SHUTDOWN_NODE, SHUTDOWN_DRAIN_NODE];
    for (const token of all) {
      expect(token).toBeInstanceOf(MultiNodeToken);
    }
    expect(new Set(all).size).toBe(3);
  });
});
