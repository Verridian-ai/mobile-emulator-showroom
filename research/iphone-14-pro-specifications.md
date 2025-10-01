# iPhone 14 Pro - Device Frame Specifications

## Research Date
2025-10-01

## Official Sources
1. Apple Support: https://support.apple.com/en-us/111849 (404 - redirected)
2. GSMArena: https://www.gsmarena.com/apple_iphone_14_pro-11860.php
3. Apple Official Specs: https://www.apple.com/iphone-14-pro/specs/ (archived)
4. Use Your Loaf: https://useyourloaf.com/blog/iphone-14-screen-sizes/

---

## 1. Physical Dimensions

### Exact Measurements
- **Height:** 147.5 mm (5.81 inches)
- **Width:** 71.5 mm (2.81 inches)
- **Depth:** 7.9 mm (0.31 inches)
- **Weight:** 206 g (7.27 oz)

### Display Size
- **Diagonal:** 6.1 inches (measured as standard rectangle)
- **Screen Area:** 91.7 cm²
- **Screen-to-Body Ratio:** ~87.0%

---

## 2. Display Characteristics

### Resolution & Pixel Density
- **Native Resolution:** 1179 x 2556 pixels
- **Pixel Density:** 460 ppi
- **Device Pixel Ratio (DPR):** 3x
- **Screen Resolution (Points):** 393 x 852 points
- **Aspect Ratio:** 19.5:9

### Display Technology
- **Type:** Super Retina XDR OLED
- **Technology:** LTPO (Low-Temperature Polycrystalline Oxide)
- **HDR:** Yes (Dolby Vision, HDR10)
- **Always-On Display:** Yes (NEW - first iPhone with Always-On)
- **ProMotion:** Yes (1-120Hz adaptive refresh)
- **Peak Brightness:** 2000 nits (outdoor), 1600 nits (HDR)

### Bezel Measurements
- **All Bezels:** ~2.2 mm (approximate)
- **Comparison:** Thicker than iPhone 15 Pro (1.55mm)
- **Design:** Uniform bezels on all sides
- **Technology:** Standard OLED edge bonding

**Note:** The 2.2mm bezel was standard for the time but was significantly reduced in the iPhone 15 Pro generation (to 1.55mm).

### Border Radius
- **Outer Device Corner Radius:** ~38.5 points (115.5px at 3x)
- **Formula:** 0.222 × device width = corner radius
- **Corner Style:** Continuous curve (squircle) with 61% smoothing
- **Physical Corner Radius:** ~15.9mm (71.5mm × 0.222)

**Calculation for CSS:**
```css
/* Outer device frame at 1x scale */
border-radius: 38.5px; /* 115.5px at native @3x */

/* For squircle accuracy, use clip-path or SVG */
```

### Dynamic Island (NEW - First Generation)
- **Status Bar Height:** 54 points (162px at 3x) - INCREASED from 47pt
- **Top Safe Area Inset:** 59 points (177px at 3x) - Portrait
- **Dynamic Island Introduction:** Replaced traditional notch with interactive pill-shaped cutout
- **Dynamic Island Dimensions (estimated):**
  - Width (collapsed): ~126 points (~378px at 3x)
  - Height (collapsed): ~36-37 points (~108-111px at 3x)
  - Border Radius: ~20 points (~60px at 3x)
  - Position from Top: ~11 points (~33px at 3x)

**Comparison to Previous Notch:**
- Dynamic Island takes up MORE vertical space than the notch (12px more effective height loss)
- Width is similar but design is more integrated into UI
- Interactive animations expand/contract based on system activities

**Note:** The iPhone 14 Pro was the FIRST device to introduce Dynamic Island, marking a major shift in iPhone design philosophy.

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
- **Position from Top:** ~110mm (estimated)
- **Height:** ~10mm (estimated)
- **Material:** Stainless steel matching frame
- **Function:** Power on/off, Siri, Emergency SOS

### Volume Buttons
- **Location:** Left side, below Ring/Silent switch
- **Volume Up Position:** ~100mm from top (estimated)
- **Volume Down Position:** ~115mm from top (estimated)
- **Height (each):** ~8mm (estimated)
- **Material:** Stainless steel matching frame

### Ring/Silent Switch (Traditional)
- **Location:** Left side, above volume buttons
- **Position from Top:** ~85mm from top (estimated)
- **Type:** Physical toggle switch
- **Length:** ~8mm (estimated)
- **Function:** Mute on/off (shows orange indicator when muted)
- **Note:** Replaced by Action Button in iPhone 15 Pro

**Button Count:** 3 buttons + 1 switch (vs iPhone 15 Pro's 4 buttons)

---

## 5. Materials & Finishes

### Frame Material
- **Type:** Surgical-grade stainless steel (316L)
- **Properties:** Durable, premium feel, heavier than aluminum
- **Finish:** Polished stainless steel
- **Weight Impact:** Heavier than titanium (iPhone 15 Pro+)

### Glass
- **Front:** Ceramic Shield (first generation)
- **Back:** Textured matte glass
- **Durability:** IP68 rated (up to 6m for 30 min)

### Finish Options
- **Space Black** (dark gray/black with black stainless)
- **Silver** (white/silver with polished stainless)
- **Gold** (champagne gold with gold-toned stainless)
- **Deep Purple** (purple with dark stainless) - NEW color for 14 series

### Surface Finish
- **Frame:** Polished stainless steel (glossy, mirror-like)
- **Glass Back:** Frosted matte finish
- **Glass Front:** Glossy with oleophobic coating
- **Buttons:** Polished stainless to match frame

**Note:** The polished stainless steel finish shows fingerprints more readily than the brushed titanium of later Pro models.

---

## 6. CSS Implementation Values

### Device Frame Container
```css
.iphone-14-pro-frame {
  /* Physical dimensions converted to CSS pixels (at 1x) */
  width: 393px; /* 1179px / 3 */
  height: 852px; /* 2556px / 3 */

  /* Border radius (continuous curve approximation) */
  border-radius: 38.5px;

  /* Bezel simulation */
  border: 2.2px solid #2c2c2e;

  /* Stainless steel frame appearance (glossy) */
  background: linear-gradient(135deg, #e8e8e8, #d0d0d0);
  box-shadow:
    inset 0 0 0 1px rgba(255, 255, 255, 0.4),
    0 2px 8px rgba(0, 0, 0, 0.3),
    0 4px 12px rgba(0, 0, 0, 0.15);
}

/* Space Black variant */
.iphone-14-pro-frame.space-black {
  background: linear-gradient(135deg, #3a3a3c, #1c1c1e);
  box-shadow:
    inset 0 0 0 1px rgba(255, 255, 255, 0.1),
    0 2px 8px rgba(0, 0, 0, 0.5);
}
```

### Screen Area (excluding bezels)
```css
.iphone-14-pro-screen {
  /* Screen dimensions at 1x */
  width: 393px;
  height: 852px;

  /* Background */
  background: #000;

  /* Inner border radius (slightly less than outer) */
  border-radius: 35px; /* account for 2.2px bezel */

  /* Safe areas for content */
  padding-top: 59px; /* Dynamic Island clearance */
  padding-bottom: 34px; /* Home indicator */
}
```

### Dynamic Island (First Generation)
```css
.dynamic-island {
  position: absolute;
  top: 11px; /* from top of screen */
  left: 50%;
  transform: translateX(-50%);

  /* Dimensions (approximated) */
  width: 126px; /* at 1x - collapsed state */
  height: 37px; /* at 1x - collapsed state */

  /* Pill shape */
  border-radius: 20px;

  /* Appearance */
  background: #000;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.05);

  /* Animation support */
  transition: all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
}

/* Expanded states */
.dynamic-island.notification {
  width: 200px;
  height: 80px;
  border-radius: 24px;
}

.dynamic-island.music {
  width: 250px;
  height: 100px;
  border-radius: 28px;
}
```

### Buttons (Visual Only)
```css
/* Power button */
.power-button {
  position: absolute;
  right: -2.2px; /* aligned with bezel edge */
  top: 110px;
  width: 3px;
  height: 10px;
  background: linear-gradient(90deg, #d0d0d0, #e8e8e8);
  border-radius: 1px;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.5),
    0 0 2px rgba(0, 0, 0, 0.3);
}

/* Ring/Silent switch (traditional) */
.ring-silent-switch {
  position: absolute;
  left: -2.2px;
  top: 85px;
  width: 3px;
  height: 8px;
  background: linear-gradient(270deg, #d0d0d0, #e8e8e8);
  border-radius: 1px;
}

/* Orange indicator when muted */
.ring-silent-switch.muted::before {
  content: '';
  position: absolute;
  width: 2px;
  height: 2px;
  background: #ff9500; /* iOS orange */
  border-radius: 50%;
  top: 3px;
  left: 0.5px;
}

/* Volume buttons */
.volume-up {
  position: absolute;
  left: -2.2px;
  top: 100px;
  width: 3px;
  height: 8px;
  background: linear-gradient(270deg, #d0d0d0, #e8e8e8);
  border-radius: 1px;
}

.volume-down {
  position: absolute;
  left: -2.2px;
  top: 115px;
  width: 3px;
  height: 8px;
  background: linear-gradient(270deg, #d0d0d0, #e8e8e8);
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
/* Target iPhone 14 Pro specifically */
@media only screen
  and (device-width: 393px)
  and (device-height: 852px)
  and (-webkit-device-pixel-ratio: 3) {
  /* iPhone 14 Pro specific styles */
}

/* Note: Same viewport as iPhone 15 Pro - differentiate by user agent if needed */
```

---

## 8. Discrepancies & Resolution

### Bezel Measurements
- **Approximate Value:** ~2.2mm reported by multiple sources
- **Variance:** Some sources report 2.15-2.25mm range
- **Resolution:** Using 2.2mm as standard value
- **Note:** Less precision than iPhone 15 Pro measurements (1.55mm confirmed)

### Dynamic Island Exact Dimensions
- **Issue:** Apple never published exact pixel dimensions
- **Status Bar Change:** Increased from 47pt to 54pt to accommodate island
- **Community Estimates:** 126pt × 37pt (collapsed state)
- **Resolution:** Using design community consensus and safe area calculations

### Button Positions
- **Issue:** No official measurements from device edges
- **Resolution:** Estimated from product photography and accessory case cutouts
- **Accuracy:** ±2-3mm tolerance expected

### Screen Height Comparison
- **Claim:** "8 pixels taller" than iPhone 13 Pro
- **Screen:** 3 points (9 pixels) wider and 8 points (24 pixels) taller
- **Effective Height Loss:** Dynamic Island takes 12px more than notch
- **Resolution:** Verified from developer source (Jonathan Deutsch)

---

## 9. Visual Reference Images

### Official Apple Images
- Product Page: https://www.apple.com/newsroom/2022/09/apple-introduces-iphone-14-pro-and-iphone-14-pro-max/
- Tech Specs (archived): Various Apple Support pages

### Technical References
- GSMArena Photos: https://www.gsmarena.com/apple_iphone_14_pro-11860.php
- Dimensions.com: https://www.dimensions.com/element/apple-iphone-14-pro-16th-gen
- Wikipedia: https://en.wikipedia.org/wiki/IPhone_14_Pro

### Design Resources
- Apple HIG: https://developer.apple.com/design/human-interface-guidelines/
- Screen Sizes: https://useyourloaf.com/blog/iphone-14-screen-sizes/
- Dynamic Island Reference: https://www.behance.net/gallery/153642485/Dynamic-Island-Reference-Dimensions

---

## 10. Implementation Notes

### Key Considerations for Pixel-Perfect Rendering

1. **Dynamic Island First Generation:** This was the introduction of Dynamic Island - ensure animations are smooth and expand/contract properly.

2. **Thicker Bezels:** At 2.2mm, bezels are noticeably thicker than iPhone 15 Pro+ (1.55mm/1.2mm). This affects overall appearance.

3. **Stainless Steel Finish:** Use glossy gradients with higher reflectivity than titanium models. Add subtle specular highlights.

4. **Ring/Silent Switch:** Render traditional toggle switch, not Action Button. Include orange indicator for muted state.

5. **Always-On Display:** First iPhone with Always-On - consider dimmed state rendering for realism.

6. **Status Bar Increase:** Status bar jumped from 47pt to 54pt - important for layout calculations.

### Performance Optimization

- Dynamic Island animations must be 60fps minimum
- Use CSS `will-change` for island transformations
- Implement `contain: layout paint` for frame container
- Use hardware-accelerated transforms only

---

## 11. Comparison to Other Models

### vs iPhone 13 Pro (Previous Generation)
- **NEW: Dynamic Island** (vs traditional notch)
- **Taller:** +24 pixels (8 points) screen height
- **Wider:** +9 pixels (3 points) screen width
- **NEW: Always-On Display**
- **Larger Status Bar:** 54pt vs 47pt (+7pt)
- **Same:** Overall physical dimensions very similar

### vs iPhone 15 Pro (Next Generation)
- **Thicker Bezels:** 2.2mm vs 1.55mm
- **Heavier:** 206g vs 187g (+19g)
- **Different Material:** Stainless steel vs titanium
- **Traditional Switch:** Ring/Silent vs Action Button
- **Same:** Screen size, resolution, Dynamic Island design

### vs iPhone 16 Pro (Two Generations Later)
- **Smaller:** Same width, slightly shorter
- **Much Thicker Bezels:** 2.2mm vs 1.2mm (45% reduction in 16 Pro)
- **Thinner:** 7.9mm vs 8.3mm (-0.4mm depth)
- **Heavier:** 206g vs 199g (+7g)
- **Missing:** Camera Control button (iPhone 16 Pro only)
- **Different Material:** Stainless steel vs titanium

---

## 12. Testing Checklist

- [ ] Device frame renders at exactly 393×852 CSS pixels
- [ ] Border radius matches iOS squircle appearance
- [ ] Bezels are 2.2mm (thicker than newer Pro models)
- [ ] Dynamic Island positioned 11pt from top, centered
- [ ] Dynamic Island animations expand/contract smoothly
- [ ] Ring/Silent switch rendered (not Action Button)
- [ ] Orange mute indicator visible when switch is on
- [ ] Stainless steel glossy finish with specular highlights
- [ ] Always-On Display dimmed state (optional)
- [ ] Responsive scaling maintains 19.5:9 aspect ratio
- [ ] Animations at 60fps minimum
- [ ] Safe areas prevent Dynamic Island overlap

---

## 13. Notable Design Changes

### Dynamic Island Introduction
The iPhone 14 Pro introduced the **Dynamic Island**, replacing the notch that had been present since iPhone X (2017). This was a paradigm shift in UI design:

**Key Features:**
- Interactive pill-shaped cutout
- Expands to show notifications, alerts, ongoing activities
- Live Activities integration
- Music playback controls
- Timer/stopwatch display
- Sports scores, ride tracking, etc.

**Technical Achievement:**
- Face ID sensors moved behind display
- Ambient light sensor repositioned
- Proximity sensor relocated
- Software-hardware integration for animations

### Always-On Display
First iPhone to feature Always-On Display, using:
- LTPO technology for 1Hz refresh rate
- Dimmed wallpaper
- Large clock and widgets
- Lock screen notifications

### A16 Bionic Chip
- 6-core CPU (2 performance + 4 efficiency)
- 5-core GPU
- 16-core Neural Engine
- 4nm process technology

---

## 14. Color Accuracy Reference

### Space Black Frame
```css
.frame-space-black {
  background: linear-gradient(135deg, #3a3a3c, #1c1c1e);
  border-color: #000;
}
```

### Silver Frame
```css
.frame-silver {
  background: linear-gradient(135deg, #f0f0f0, #d8d8d8);
  border-color: #c0c0c0;
}
```

### Gold Frame
```css
.frame-gold {
  background: linear-gradient(135deg, #fce5cd, #f4d7b3);
  border-color: #e8c8a0;
}
```

### Deep Purple Frame
```css
.frame-deep-purple {
  background: linear-gradient(135deg, #5e5475, #4a4359);
  border-color: #3a3342;
}
```

---

## Document Version
Version 1.0 - Initial research compilation
Last Updated: 2025-10-01
Researcher: Device Frame Research Specialist Agent
