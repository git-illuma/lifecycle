# @illuma/lifecycle

Boot & shutdown ordering tokens for [`@illuma/core`](https://github.com/git-illuma/core)
DI applications. Three `MultiNodeToken` collection points an app drains in order, so
independently-registered providers can hook startup and graceful shutdown without
knowing about each other.

```bash
npm i @illuma/lifecycle
# or
bunx jsr add @illuma/lifecycle
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

The runtime that owns the container is responsible for awaiting each collection at the
right phase (init on start; drain then teardown on stop).

## License

MIT
