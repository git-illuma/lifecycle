import type { ExtractInjectedType } from "@illuma/core";
import { LifecycleRef, nodeInject } from "@illuma/core";
import type { MonoTypeOperatorFunction } from "rxjs";
import { Observable } from "rxjs";
import { takeUntil } from "rxjs/operators";

export function takeUntilDestroyed<T>(
  lcr: ExtractInjectedType<typeof LifecycleRef> = nodeInject(LifecycleRef),
): MonoTypeOperatorFunction<T> {
  const destroyed$ = new Observable<void>((obs) => {
    return lcr.beforeDestroy(() => {
      obs.next();
      obs.complete();
    });
  });

  return (source: Observable<T>) => source.pipe(takeUntil(destroyed$));
}
