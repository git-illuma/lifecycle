// rxjs barrel — the ONLY entry that imports rxjs. Exposed as the
// '@illuma/lifecycle/rxjs' subpath; the core '@illuma/lifecycle' entry never
// re-exports from here, so it stays rxjs-free.
export * from "./until-destroyed";
