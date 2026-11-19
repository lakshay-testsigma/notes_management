---
title: "Concept map of Browser DevTools mastery (used in every phase)"
topic: frontend-engineering/learning-system-and-workstation/browser-devtools-mastery
stage: visual
tags: [frontend-engineering, learning-system-and-workstation, visual]
created: 2026-11-19
---
# Concept map of Browser DevTools mastery (used in every phase)

Generated from the research curriculum. A solid arrow points from a concept to the concept that refines it; a dotted arrow shows a prerequisite.

```mermaid
flowchart TD
  browser_devtools["Browser DevTools"]
  elements_and_styles["Elements and Styles panel"]
  box_model_and_layout_overlays["Box model and layout overlays"]
  console_api["Console API and utilities"]
  breakpoint_debugging["Breakpoint debugging"]
  async_call_stacks["Async call stacks"]
  source_maps["Source maps"]
  local_overrides_and_workspaces["Local overrides and workspaces"]
  network_panel["Network panel"]
  request_timing_phases["Request timing phases"]
  performance_panel["Performance panel"]
  flame_chart_and_long_tasks["Flame chart and long tasks"]
  core_web_vitals_in_devtools["Core Web Vitals in DevTools"]
  memory_panel["Memory panel"]
  heap_snapshot_retainers["Heap snapshot retainers"]
  detached_dom_nodes["Detached DOM nodes"]
  application_panel["Application panel"]
  service_worker_and_cache_inspection["Service worker and cache inspection"]
  audit_panels["Lighthouse and other audit panels"]
  lighthouse_audits["Lighthouse audits"]
  rendering_emulation["Rendering and emulation tools"]
  firefox_and_safari_devtools["Firefox and Safari DevTools"]
  remote_device_debugging["Remote device debugging"]
  debugging_workflow["Debugging workflow"]
  bfcache_and_speculative_loads["Back/forward cache and speculative loads"]
  browser_devtools --> elements_and_styles
  elements_and_styles --> box_model_and_layout_overlays
  browser_devtools --> console_api
  browser_devtools --> breakpoint_debugging
  breakpoint_debugging --> async_call_stacks
  breakpoint_debugging --> source_maps
  breakpoint_debugging --> local_overrides_and_workspaces
  browser_devtools --> network_panel
  network_panel --> request_timing_phases
  browser_devtools --> performance_panel
  performance_panel --> flame_chart_and_long_tasks
  performance_panel --> core_web_vitals_in_devtools
  browser_devtools --> memory_panel
  memory_panel --> heap_snapshot_retainers
  memory_panel --> detached_dom_nodes
  browser_devtools --> application_panel
  application_panel --> service_worker_and_cache_inspection
  browser_devtools --> audit_panels
  audit_panels --> lighthouse_audits
  audit_panels --> rendering_emulation
  browser_devtools --> firefox_and_safari_devtools
  browser_devtools --> remote_device_debugging
  browser_devtools --> debugging_workflow
  application_panel --> bfcache_and_speculative_loads
```

Back to [[visuals-browser-devtools-mastery|all visuals]].

## My insights
