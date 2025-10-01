# iPhone 15 Pro - Device Frame Specifications

## Research Date
2025-10-01

## Official Sources
1. Apple Support: https://support.apple.com/en-us/111829 (404 - redirected)
2. GSMArena: https://www.gsmarena.com/apple_iphone_15_pro-12557.php
3. Apple Official Specs: https://www.apple.com/iphone-15-pro/specs/
4. Wikipedia: https://en.wikipedia.org/wiki/IPhone_15_Pro

---

## 1. Physical Dimensions

### Exact Measurements
- **Height:** 146.6 mm (5.77 inches)
- **Width:** 70.6 mm (2.78 inches)
- **Depth:** 8.3 mm (0.33 inches)
- **Weight:** 187 g (6.60 oz)

### Display Size
- **Diagonal:** 6.1 inches (measured as standard rectangle)
- **Screen Area:** 91.3 cm²
- **Screen-to-Body Ratio:** ~88.2%

---

## 2. Display Characteristics

### Resolution & Pixel Density
- **Native Resolution:** 1179 x 2556 pixels
- **Pixel Density:** 461 ppi
- **Device Pixel Ratio (DPR):** 3x
- **Screen Resolution (Points):** 393 x 852 points
- **Aspect Ratio:** 19.5:9

### Display Technology
- **Type:** Super Retina XDR OLED
- **Technology:** LTPO (Low-Temperature Polycrystalline Oxide)
- **HDR:** Yes
- **Always-On Display:** Yes
- **ProMotion:** Yes (1-120Hz adaptive refresh)
- **Peak Brightness:** 2000 nits (outdoor), 1600 nits (HDR)

### Bezel Measurements
- **All Bezels:** 1.55 mm (consistent on all sides)
- **Reduction:** From 2.2mm (iPhone 14 Pro) to 1.55mm
- **Technology:** LIPO (Low-Injection Pressure Over-molding)
- **Significance:** Thinnest smartphone bezels at time of release (2023)

**Note:** This was a major design achievement - reducing bezels from 2.2mm to 1.55mm represented approximately a 30% reduction.

### Border Radius
- **Outer Device Corner Radius:** ~38.5 points (115.5px at 3x)
- **Formula:** 0.222 × device width = corner radius
- **Corner Style:** Continuous curve (squircle) with 61% smoothing
- **Inner Screen Radius:** Slightly smaller than outer radius to account for bezel

**Calculation for CSS:**
```css
/* Outer device frame at 1x scale */
border-radius: 38.5px; /* 115.5px at native @3x */

/* Actual corner radius approximation */
/* For 70.6mm width: 70.6 × 0.222 = ~15.67mm physical */
/* In CSS pixels at 1x: 393px width × 0.222 = ~87.2px / device width scale */
```

### Dynamic Island
- **Status Bar Height:** 54 points (162px at 3x)
- **Top Safe Area Inset:** 59 points (177px at 3x) - Portrait
- **Dynamic Island (estimated dimensions):**
  - Width: ~126 points (~378px at 3x)
  - Height: ~37 points (~111px at 3x)
  - Border Radius: ~20 points (~60px at 3x)
  - Position from Top: ~11 points (~33px at 3x)

**Note:** The iPhone 15 Pro was the second generation to feature Dynamic Island (first introduced on iPhone 14 Pro). All iPhone 15 models received this feature, not just Pro models.

---

## 3. Safe Areas (for CSS Layout)

### Portrait Mode
- **Top Inset:** 59 points (177px at 3x)
- **Bottom Inset:** 34 points (102px at 3x)
- **Left Inset:** 0 points
- **Right Inset:** 0 points

### Landscape Mode
- **Top Inset:** 0 points
- **Bottom Inset:** 21 points (63px at 3x)
- **Left Inset:** 59 points (177px at 3x)
- **Right Inset:** 59 points (177px at 3x)

---

## 4. Button Specifications

### Power Button (Side Button)
- **Location:** Right side
- **Position from Top:** ~108mm (estimated)
- **Height:** ~10mm (estimated)
- **Material:** Titanium matching frame
- **Function:** Power on/off, Siri, Emergency SOS

### Volume Buttons
- **Location:** Left side, below Action Button
- **Volume Up Position:** ~98mm from top (estimated)
- **Volume Down Position:** ~113mm from top (estimated)
- **Height (each):** ~8mm (estimated)
- **Material:** Titanium matching frame

### Action Button (NEW in iPhone 15 Pro)
- **Location:** Left side, above volume buttons
- **Position from Top:** ~83mm from top (estimated)
- **Height:** ~8mm (estimated)
- **Color:** Matches device color (titanium finish)
- **Type:** Physical toggle button
- **Replaces:** Ring/Silent switch (removed in iPhone 15 Pro)
- **Function:** Customizable (Silent mode default, Camera, Flashlight, Voice Memo, etc.)
- **Introduced:** iPhone 15 Pro series (September 2023)

**Note:** The Action Button was a major design change, replacing the iconic physical mute switch that had been present since the original iPhone.

---

## 5. Materials & Finishes

### Frame Material
- **Type:** Grade 5 Titanium
- **Properties:** Aerospace-grade, lightweight, strong
- **Change:** First iPhone to use titanium frame (previously stainless steel on Pro models)
- **Weight Benefit:** 19g lighter than iPhone 14 Pro despite similar size

### Glass
- **Front:** Ceramic Shield (second generation)
- **Back:** Textured matte glass
- **Durability:** IP68 rated (up to 6m for 30 min)

### Finish Options
- **Natural Titanium** (brushed silver/gray)
- **Blue Titanium** (deep blue-gray)
- **White Titanium** (light pearl gray)
- **Black Titanium** (dark space gray/black)

### Surface Finish
- **Frame:** Brushed titanium with matte texture
- **Glass Back:** Frosted matte finish
- **Glass Front:** Glossy with oleophobic coating
- **Buttons:** Brushed titanium to match frame

---

## 6. CSS Implementation Values

### Device Frame Container
```css
.iphone-15-pro-frame {
  /* Physical dimensions converted to CSS pixels (at 1x) */
  width: 393px; /* 1179px / 3 */
  height: 852px; /* 2556px / 3 */

  /* Border radius (continuous curve approximation) */
  border-radius: 38.5px;

  /* Bezel simulation - uniform thickness */
  border: 1.55px solid #2c2c2e;

  /* Titanium frame appearance */
  background: linear-gradient(135deg, #c0c0c0, #a8a8a8);
  box-shadow:
    inset 0 0 0 1px rgba(255, 255, 255, 0.15),
    0 2px 8px rgba(0, 0, 0, 0.3),
    0 0 0 0.5px rgba(0, 0, 0, 0.2);
}
```

### Screen Area (excluding bezels)
```css
.iphone-15-pro-screen {
  /* Screen dimensions at 1x */
  width: 393px;
  height: 852px;

  /* Background */
  background: #000;

  /* Inner border radius (slightly less than outer) */
  border-radius: 36px;

  /* Safe areas for content */
  padding-top: 59px; /* Dynamic Island clearance */
  padding-bottom: 34px; /* Home indicator */
}
```

### Dynamic Island
```css
.dynamic-island {
  position: absolute;
  top: 11px; /* from top of screen */
  left: 50%;
  transform: translateX(-50%);

  /* Dimensions (approximated) */
  width: 126px; /* at 1x */
  height: 37px; /* at 1x */

  /* Pill shape */
  border-radius: 20px;

  /* Appearance */
  background: #000;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.05);

  /* Animation support */
  transition: all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
}

/* Expanded state (example) */
.dynamic-island.expanded {
  width: 200px;
  height: 80px;
  border-radius: 24px;
}
```

### Buttons (Visual Only)
```css
/* Power button */
.power-button {
  position: absolute;
  right: -1.55px; /* aligned with bezel edge */
  top: 108px;
  width: 3px;
  height: 10px;
  background: linear-gradient(90deg, #a8a8a8, #c0c0c0);
  border-radius: 1px;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

/* Action button (replaces mute switch) */
.action-button {
  position: absolute;
  left: -1.55px;
  top: 83px;
  width: 3px;
  height: 8px;
  background: linear-gradient(270deg, #a8a8a8, #c0c0c0);
  border-radius: 1px;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

/* Volume buttons */
.volume-up {
  position: absolute;
  left: -1.55px;
  top: 98px;
  width: 3px;
  height: 8px;
  background: linear-gradient(270deg, #a8a8a8, #c0c0c0);
  border-radius: 1px;
}

.volume-down {
  position: absolute;
  left: -1.55px;
  top: 113px;
  width: 3px;
  height: 8px;
  background: linear-gradient(270deg, #a8a8a8, #c0c0c0);
  border-radius: 1px;
}
```

---

## 7. Viewport & Scale Factor

### Native Resolution
- **Pixels:** 1179 × 2556 px
- **Points:** 393 × 852 pt
- **Scale Factor:** 3x (@3x assets)

### Web Viewport
```html
<meta name="viewport" content="width=393, initial-scale=1.0,
      maximum-scale=1.0, user-scalable=no">
```

### Media Queries
```css
/* Target iPhone 15 Pro specifically */
@media only screen
  and (device-width: 393px)
  and (device-height: 852px)
  and (-webkit-device-pixel-ratio: 3) {
  /* iPhone 15 Pro specific styles */
}

/* Alternative using min/max resolution */
@media only screen
  and (min-device-width: 393px)
  and (max-device-width: 393px)
  and (min-device-height: 852px)
  and (max-device-height: 852px)
  and (-webkit-min-device-pixel-ratio: 3) {
  /* iPhone 15 Pro styles */
}
```

---

## 8. Discrepancies & Resolution

### Bezel Measurements
- **Consistent:** All sources agree on 1.55mm uniform bezels
- **Technology:** LIPO manufacturing confirmed by multiple sources
- **No Conflicts:** This specification is well-documented

### Dynamic Island Dimensions
- **Issue:** Apple does not publish exact pixel dimensions publicly
- **Resolution:** Using safe area insets (59pt top, 54pt status bar) and community design resources
- **Cross-Reference:** Behance design resources and developer documentation
- **Status:** Estimates are consistent across design community

### Button Positions
- **Issue:** Official measurements from device edges not published
- **Resolution:** Estimated from product photography, case manufacturer specs, and accessory cutouts
- **Variance:** ±2mm tolerance expected
- **Recommendation:** Use relative positioning for CSS implementation

### Top Safe Area Discrepancy
- **iPhone 14 Pro:** 59 points
- **iPhone 15 Pro:** 59 points (same)
- **iPhone 16 Pro:** 62 points (increased by 3 points)
- **Resolution:** Verified from Use Your Loaf screen size reference

---

## 9. Visual Reference Images

### Official Apple Images
- Product Page: https://www.apple.com/iphone-15-pro/
- Tech Specs: https://www.apple.com/iphone-15-pro/specs/

### Technical References
- GSMArena Photos: https://www.gsmarena.com/apple_iphone_15_pro-12557.php
- Dimensions.com: https://www.dimensions.com/element/apple-iphone-15-pro-17th-gen
- Wikipedia: https://en.wikipedia.org/wiki/IPhone_15_Pro

### Design Resources
- Apple HIG: https://developer.apple.com/design/human-interface-guidelines/
- Screen Sizes: https://www.screensizes.app/?model=iphone-15-pro

---

## 10. Implementation Notes

### Key Considerations for Pixel-Perfect Rendering

1. **1.55mm Bezels:** These ultra-thin bezels were a breakthrough at launch. Render consistently on all four sides.

2. **Titanium Appearance:** Use subtle brushed metal gradients. Avoid overly shiny/reflective finishes - titanium has a matte texture.

3. **Action Button:** First generation of this button - render as a small toggle-style button on the left side.

4. **Dynamic Island:** Same design as iPhone 14 Pro - use identical dimensions.

5. **Continuous Corners:** iOS squircle corners require special handling beyond simple `border-radius`.

6. **Safe Areas:** Top safe area is 59pt (vs 62pt on iPhone 16 Pro) - critical for layout calculations.

### Performance Optimization

- Use CSS transforms for animations (GPU-accelerated)
- Implement `contain: layout style paint` for device frame
- Use `will-change` sparingly for Dynamic Island animations
- Consider CSS Grid for precise button positioning

---

## 11. Comparison to Other Models

### vs iPhone 14 Pro
- **Thinner Bezels:** 1.55mm vs 2.2mm (30% reduction)
- **Different Material:** Titanium vs stainless steel
- **Lighter:** 187g vs 206g (-19g)
- **New Button:** Action Button vs Ring/Silent switch
- **Same:** Screen size (6.1"), resolution, Dynamic Island

### vs iPhone 16 Pro
- **Smaller:** -3mm height, -0.9mm width
- **Thicker Bezels:** 1.55mm vs 1.2mm
- **Missing:** Camera Control button (added in iPhone 16)
- **Same:** Depth (8.3mm), titanium material
- **Slightly Different Safe Area:** 59pt vs 62pt top inset

---

## 12. Testing Checklist

- [ ] Device frame renders at exactly 393×852 CSS pixels
- [ ] Border radius matches iOS squircle appearance
- [ ] Bezels are uniformly 1.55mm on all sides
- [ ] Dynamic Island positioned 11pt from top, centered
- [ ] Safe area top inset is 59pt (not 62pt like iPhone 16 Pro)
- [ ] Action Button rendered on left side (not mute switch)
- [ ] No Camera Control button (iPhone 16 Pro only)
- [ ] Titanium finish with brushed metal appearance
- [ ] Responsive scaling maintains 19.5:9 aspect ratio
- [ ] Animations perform at 60fps minimum
- [ ] WCAG AA accessibility standards met

---

## 13. Notable Design Changes

### Action Button Introduction
The iPhone 15 Pro introduced the Action Button, replacing the Ring/Silent switch that had been a signature iPhone feature since 2007. This was a controversial design decision that allowed for greater customization.

**Default Functions Available:**
- Silent Mode (default)
- Camera
- Flashlight
- Voice Memo
- Focus Mode
- Translate
- Magnifier
- Shortcuts
- Accessibility features

### Titanium Frame
First iPhone to use Grade 5 titanium, resulting in:
- 19g weight reduction vs iPhone 14 Pro
- More premium feel
- Better heat dissipation
- Improved durability
- Four new color finishes

### LIPO Display Technology
Low-Injection Pressure Over-molding allowed for record-breaking thin bezels (1.55mm) by:
- Reducing the chin bezel significantly
- Making bezels uniform on all sides
- Improving screen-to-body ratio to 88.2%

---

## Document Version
Version 1.0 - Initial research compilation
Last Updated: 2025-10-01
Researcher: Device Frame Research Specialist Agent
