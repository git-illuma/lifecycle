# @illuma/lifecycle

Boot & shutdown ordering tokens for [`@illuma/core`](https://github.com/git-illuma/core)
DI applications. Three `MultiNodeToken` collection points an app drains in order, so
independently-registered providers can hook startup and graceful shutdown without
knowing about each other.

```bash
npm i @illuma/lifecycle
```

## Tokens

- **`ASYNC_INIT_NODE`** — async work to run at boot (connect DB, NATS, warm caches). The
  app awaits all registered callbacks before serving.
- **`SHUTDOWN_DRAIN_NODE`** — phase 1 of shutdown: stop accepting new work (HTTP/NATS/Telegram
  intake) and let in-flight handlers finish on a still-live connection.
- **`ASYNC_SHUTDOWN_NODE`** — phase 2: tear down connections/resources, after the drain.

```ts
import { ASYNC_INIT_NODE, SHUTDOWN_DRAIN_NODE, ASYNC_SHUTDOWN_NODE } from '@illuma/lifecycle';

providers: [
  ASYNC_INIT_NODE.withValue(async () => db.connect()),
  SHUTDOWN_DRAIN_NODE.withValue(async () => server.stopAcceptingNewRequests()),
  ASYNC_SHUTDOWN_NODE.withValue(async () => db.close()),
];
```

## Register hooks

Prefer the typed helpers over `TOKEN.withFactory(...)`. The factory runs in injection
context, so it can `nodeInject` dependencies and close over them in the hook:

```ts
import { provideAsyncInit, provideShutdownDrain, provideAsyncShutdown } from '@illuma/lifecycle';

providers: [
  provideAsyncInit(() => {
    const db = nodeInject(DATABASE);
    return () => db.connect();
  }),
  provideShutdownDrain(() => () => server.stopAcceptingNewRequests()),
  provideAsyncShutdown(() => () => db.close()),
];
```

## Drive them (runtime)

The runtime that owns the container injects each collection and runs it at the right
phase. The runners encapsulate ordering + failure isolation, so you don't re-roll it:

```ts
import { runAsyncInit, runShutdown } from '@illuma/lifecycle';

// boot — sequential, fail-fast (a bad init must abort startup)
await runAsyncInit(nodeInject(ASYNC_INIT_NODE));

// SIGTERM — drain intake (concurrent), then tear down (sequential). A failing
// hook is isolated so it can't strand the rest; surface it via onError.
await runShutdown(
  nodeInject(SHUTDOWN_DRAIN_NODE),
  nodeInject(ASYNC_SHUTDOWN_NODE),
  (err) => logger.error('shutdown hook failed', err),
);
```

`runShutdownDrain` and `runAsyncShutdown` are exported too if you need the phases apart.

## RxJS interop (optional)

`takeUntilDestroyed` lives in a separate `@illuma/lifecycle/rxjs` entry so the main
package never pulls in RxJS. Importing `@illuma/lifecycle` adds zero RxJS to your bundle;
RxJS is an **optional peer dependency** — only install it if you use this subpath.

```bash
npm i rxjs
```

It completes a stream when the node's `LifecycleRef` fires `beforeDestroy`, so
subscriptions tear down with the node instead of leaking past it. Called in injection
context it resolves the `LifecycleRef` itself; pass one explicitly otherwise.

```ts
import { takeUntilDestroyed } from '@illuma/lifecycle/rxjs';

// in injection context — LifecycleRef is injected for you
interval(1000)
  .pipe(takeUntilDestroyed())
  .subscribe((n) => logger.debug('tick', n));

// or hand it an explicit ref
source$.pipe(takeUntilDestroyed(lifecycleRef)).subscribe(...);
```

## License

MIT
