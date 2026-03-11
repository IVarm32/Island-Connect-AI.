## 2025-03-24 - [Main Thread & Battery Optimization]
**Learning:** Even small particle animations (O(n²) connection checks) can contribute to battery drain on mobile devices if they run indefinitely in background tabs. Using the Page Visibility API is a low-effort, high-impact way to improve battery life and reduce idle CPU usage.
**Action:** Always check `document.hidden` in `requestAnimationFrame` loops for decorative background animations.

## 2025-03-24 - [Initialization Timing]
**Learning:** For landing pages where visual "pop" (like canvas backgrounds or reveal animations) is critical, waiting for the `window.load` event can create a "dead" period if external images or fonts are slow. `DOMContentLoaded` is usually sufficient for scripts that don't depend on image dimensions.
**Action:** Prioritize `DOMContentLoaded` for UI-enhancing scripts to improve perceived performance.

## 2025-03-24 - [Respecting Infrastructure]
**Learning:** Removing unused major dependencies (like React) is a massive performance win but can be seen as "destructive" if the project is in a transitional state (e.g., an empty entry point intended for future features).
**Action:** Communicate clearly before removing structural elements, or focus on non-destructive runtime optimizations if the goal is "one small improvement."
