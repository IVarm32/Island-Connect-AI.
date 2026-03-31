## 2025-05-14 - Performance Baseline and Initial Findings

**Learning:** The application is loading a full React 19 bundle (~194KB) to mount a component that returns `null`. Additionally, high-frequency events like `resize` and the main particle animation loop have optimization opportunities (redundant context assignments, O(N^2) loop efficiency).

**Action:** Disable the unused React script in `index.html` and apply efficiency patterns to `js/main.js` (throttling, loop optimization, and Visibility API).
