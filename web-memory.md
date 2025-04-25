# Web Memory: Scroll Hiding Layout Pattern

## Pattern: Prevent Page-Level Scroll, Allow Content Scroll in Main Container

### Description
To ensure a web layout where the entire page never scrolls (no unwanted vertical or horizontal scrollbars), but a main content area (e.g., `.rootContainer`) can scroll if its content overflows, use the following approach:

### CSS Structure
```css
body {
  min-height: 100vh;
  margin: 0;
  background: #000;
  display: flex;
  flex-direction: column;
}
.mainLayout {
  display: flex;
  flex-direction: column;
  height: 100vh;
}
.header {
  /* Top bar */
  padding: 32px 0 0 40px;
}
.rootContainer {
  flex: 1 1 0;
  min-height: 0;
  background: rgba(255,255,255,0.96);
  box-sizing: border-box;
  padding: 24px;
  margin: 0 12px 12px 12px;
  box-shadow: 0 4px 32px 0 rgba(0,0,0,0.10), 0 1.5px 6px 0 rgba(0,0,0,0.08);
  overflow: auto; /* Only this container scrolls */
  display: grid;
  place-items: center;
  max-width: calc(100vw - 24px);
  border-radius: 12px;
}
html, body {
  overflow-x: hidden; /* Never allow horizontal scroll on page */
}
```

### HTML Structure
```html
<body>
  <div class="mainLayout">
    <div class="header">...</div>
    <div class="rootContainer">...</div>
  </div>
</body>
```

### Key Points
- The page (`body`, `.mainLayout`) is a flex column that fills the viewport.
- `.header` sits at the top, no vertical margin.
- `.rootContainer` fills remaining space, scrolls internally if needed, and never causes the page to scroll.
- Use `overflow-x: hidden` on `html, body` to prevent accidental horizontal scroll.
- Use `min-height: 0` on `.rootContainer` to allow flexbox to properly constrain its height.

---
**This pattern is ideal for dashboard, card, or modal layouts where you want a fixed viewport experience and only the main content area should scroll.**

---

## Pattern: Prevent Unwanted Scrollbars with Background Overlays

To prevent unnecessary vertical scrollbars caused by background overlays or fixed-position elements (such as a body::before overlay for Letterboxd-style fading), always set:

```css
html, body {
  overflow: hidden;
  margin: 0;
  padding: 0;
}
```

This ensures that overlays or gradients do not cause unwanted scrollbars. If you want a main content area to scroll, use a dedicated container with `overflow: auto` inside the page.

---
