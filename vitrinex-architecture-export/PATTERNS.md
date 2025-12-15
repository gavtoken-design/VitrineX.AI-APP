# 📐 Engineering Patterns & Standards

## 1. "Antigravity" UI Rules (The Golden Rule)

To maintain a fluid, high-performance interface, all UI adjustments must strictly follow this dependency order. Never optimize style before structure.

1.  **Layout** (Structure): Define size, position, grid, flex, fixed, overflow.
2.  **Flow** (Behavior): Define what pushes what (`flex-1`, `min-h-0`, scroll containers).
3.  **State** (Logic): Define `isOpen`, handlers, conditional rendering.
4.  **Animation** (Motion): Apply transforms, transitions, durations.
5.  **Style** (Aesthetics): Apply colors, shadows, blurs, rounded corners.

> **Why?** Breaking this order causes elements to "float" unpredictably, breaks scroll contexts, or creates ghost clicks.

---

## 2. Directory Organization

-   **`src/services/` First**: Business logic should live in services, not components.
-   **`src/components/ui/` Atomic**: Keep base components (Button, Input) generic and styling-free of business logic.
-   **`src/pages/` Orchestrators**: Pages should only fetch data and layout components, avoiding complex heavy lifting.

## 3. AI Integration Patterns

### The "Thinking" vs "Tactical" Split
-   **Strategic Tasks**: Use `Gemini 2.0 Thinking` model. **CRITICAL**: Do NOT pass `tools` to this model (API limitation).
-   **Tactical/Creative Tasks**: Use `Gemini 2.0 Flash` or `Pro`. These *should* use tools (Grounding, Search) as needed.
-   **Fallback Strategy**: Always wrap AI calls in client-side fallbacks (Direct SDK vs Proxy) to ensure uptime.
