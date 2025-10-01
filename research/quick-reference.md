# iPhone Device Frame Quick Reference

**For rapid lookup during implementation**

---

## Device Frame Dimensions (CSS pixels at 1x)

| Device | Width | Height | Border Radius | Bezel | DPR |
|--------|-------|--------|---------------|-------|-----|
| iPhone 16 Pro | 402px | 874px | 38.5px | 1.2px | 3x |
| iPhone 15 Pro | 393px | 852px | 38.5px | 1.55px | 3x |
| iPhone 14 Pro | 393px | 852px | 38.5px | 2.2px | 3x |
| iPhone 11 | 414px | 896px | 40px | 4.5-7.5px | 2x |

---

## Safe Area Insets (Portrait)

| Device | Top | Bottom | Left | Right |
|--------|-----|--------|------|-------|
| iPhone 16 Pro | 62px | 34px | 0 | 0 |
| iPhone 15 Pro | 59px | 34px | 0 | 0 |
| iPhone 14 Pro | 59px | 34px | 0 | 0 |
| iPhone 11 | 48px | 34px | 0 | 0 |

---

## Dynamic Island / Notch

| Device | Type | Width | Height | Status Bar |
|--------|------|-------|--------|------------|
| iPhone 16 Pro | Dynamic Island | 126px | 37px | 54px |
| iPhone 15 Pro | Dynamic Island | 126px | 37px | 54px |
| iPhone 14 Pro | Dynamic Island | 126px | 37px | 54px |
| iPhone 11 | Traditional Notch | 175px | 30px | 44px |

---

## Material Finish CSS

### Titanium (iPhone 15 Pro, 16 Pro)
```css
background: linear-gradient(135deg, #c0c0c0, #a8a8a8);
box-shadow: inset 0 0 0 1px rgba(255,255,255,0.15), 0 2px 8px rgba(0,0,0,0.3);
```

### Stainless Steel (iPhone 14 Pro)
```css
background: linear-gradient(135deg, #e8e8e8, #d0d0d0);
box-shadow: inset 0 0 0 1px rgba(255,255,255,0.4), 0 2px 8px rgba(0,0,0,0.3);
```

### Aluminum (iPhone 11)
```css
background: linear-gradient(135deg, #d8d8d8, #c0c0c0);
box-shadow: inset 0 0 0 1px rgba(255,255,255,0.2), 0 2px 8px rgba(0,0,0,0.2);
```

---

## Buttons by Device

| Device | Left Side | Right Side |
|--------|-----------|------------|
| iPhone 16 Pro | Action Button, Volume Up/Down | Power, Camera Control |
| iPhone 15 Pro | Action Button, Volume Up/Down | Power |
| iPhone 14 Pro | Ring/Silent Switch, Volume Up/Down | Power |
| iPhone 11 | Ring/Silent Switch, Volume Up/Down | Power |

---

## Screen Background Color

| Device | Background | Reason |
|--------|-----------|---------|
| iPhone 16 Pro | #000 (true black) | OLED |
| iPhone 15 Pro | #000 (true black) | OLED |
| iPhone 14 Pro | #000 (true black) | OLED |
| iPhone 11 | #0a0a0a (dark gray) | LCD (no true blacks) |

---

## Implementation Template

```css
.iphone-device-frame {
  /* Dimensions */
  width: [WIDTH]px;
  height: [HEIGHT]px;

  /* Border */
  border-radius: [RADIUS]px;
  border: [BEZEL]px solid #2c2c2e;

  /* Material */
  background: linear-gradient(135deg, [COLOR1], [COLOR2]);
  box-shadow: [MATERIAL_SHADOW];

  /* Performance */
  contain: layout style paint;

  /* Content safe area */
  padding: [TOP]px 0 [BOTTOM]px 0;
}
```

---

## Critical Reminders

1. **iPhone 11 uses @2x assets** (all others use @3x)
2. **iPhone 11 has asymmetric bezels** (thicker bottom chin)
3. **Dynamic Island is 11px from top** of screen
4. **Continuous corners** need clip-path or SVG for perfect accuracy
5. **Camera Control button** only on iPhone 16 Pro
6. **Action Button** only on iPhone 15 Pro and newer
7. **Always test with Playwright MCP** for visual validation

---

## Viewport Meta Tags

```html
<!-- iPhone 16 Pro -->
<meta name="viewport" content="width=402, initial-scale=1.0">

<!-- iPhone 15 Pro / 14 Pro -->
<meta name="viewport" content="width=393, initial-scale=1.0">

<!-- iPhone 11 -->
<meta name="viewport" content="width=414, initial-scale=1.0">
```

---

## Media Queries

```css
/* iPhone 16 Pro */
@media (device-width: 402px) and (device-height: 874px) and (-webkit-device-pixel-ratio: 3) { }

/* iPhone 15 Pro / 14 Pro */
@media (device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3) { }

/* iPhone 11 */
@media (device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2) { }
```

---

**Full details in individual specification files:**
- `iphone-16-pro-specifications.md`
- `iphone-15-pro-specifications.md`
- `iphone-14-pro-specifications.md`
- `iphone-11-specifications.md`

**Summary report:** `research-summary.md`
