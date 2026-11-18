# Visual candidates: docs-engines-storage-origin
- v8-ignition-turbofan, section "Ignition and TurboFan": pipeline source -> Ignition bytecode -> TurboFan optimized code, with deoptimization back to bytecode.
- v8-trash-talk-orinoco, sections "Generational heap" and "Major GC": young generation (nursery, intermediate) to old generation; Scavenger vs Mark-Compact (mark, sweep, compact).
- mdn-same-origin-policy, "Definition of an origin": http://store.company.com/dir/page.html compared with four variants (path ok; protocol, port, host differ).
- mdn-same-origin-policy, cross-origin network access: writes allowed, embeds allowed, reads blocked.
- mdn-storage-quotas-eviction, "Eviction": best-effort origin evicted by LRU under pressure; persistent origin skipped.
- mdn-storage-quotas-eviction, "Quota limits": per-browser quota table (Firefox 10% / 50%, Chromium 60%, Safari 60%/15%).
