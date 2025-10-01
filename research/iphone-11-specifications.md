# iPhone 11 - Device Frame Specifications

## Research Date
2025-10-01

## Official Sources
1. Apple Support: https://support.apple.com/kb/SP804
2. GSMArena: https://www.gsmarena.com/apple_iphone_11-9848.php
3. Apple Official Specs (archived): https://www.apple.com/iphone-11/specs/
4. Wikipedia: https://en.wikipedia.org/wiki/IPhone_11

---

## 1. Physical Dimensions

### Exact Measurements
- **Height:** 150.9 mm (5.94 inches)
- **Width:** 75.7 mm (2.98 inches)
- **Depth:** 8.3 mm (0.33 inches)
- **Weight:** 194 g (6.84 oz)

### Display Size
- **Diagonal:** 6.1 inches (6.06 inches when measured as standard rectangle)
- **Screen Area:** ~91 cm² (estimated)
- **Screen-to-Body Ratio:** ~79.0%

**Note:** The iPhone 11 is physically larger and heavier than the Pro models despite having the same screen size due to LCD technology requiring thicker bezels and different internal architecture.

---

## 2. Display Characteristics

### Resolution & Pixel Density
- **Native Resolution:** 828 x 1792 pixels
- **Pixel Density:** 326 ppi
- **Device Pixel Ratio (DPR):** 2x (NOT 3x like Pro models)
- **Screen Resolution (Points):** 414 x 896 points
- **Aspect Ratio:** 19.5:9

### Display Technology
- **Type:** Liquid Retina IPS LCD
- **Technology:** LCD (not OLED like Pro models)
- **Color Gamut:** Wide color (P3)
- **True Tone:** Yes
- **Brightness:** 625 nits max (typical)
- **HDR:** No
- **ProMotion:** No (60Hz only)
- **Always-On Display:** No

**Important Difference:** LCD vs OLED means:
- Thicker bezels (especially chin)
- Lower contrast ratio
- No true blacks
- More affordable manufacturing
- Slightly better battery life in bright conditions

### Bezel Measurements
- **Top Bezel:** ~4.5 mm (estimated, includes notch area)
- **Side Bezels:** ~4.5 mm (estimated)
- **Bottom Bezel (Chin):** ~7.5 mm (estimated, thicker due to LCD)
- **Average:** ~5-6 mm (significantly thicker than OLED iPhones)

**Note:** LCD technology requires space for backlight edge connectors, resulting in a more prominent chin bezel. The iPhone 11 has noticeably thicker bezels than any OLED iPhone.

### Border Radius
- **Outer Device Corner Radius:** ~40 points (80px at 2x)
- **Formula:** 0.222 × device width = corner radius
- **Corner Style:** Continuous curve (squircle) with 61% smoothing
- **Physical Corner Radius:** ~16.8mm (75.7mm × 0.222)

**Calculation for CSS:**
```css
/* Outer device frame at 1x scale */
border-radius: 40px; /* 80px at native @2x */

/* iPhone 11 uses similar squircle curve as Pro models */
```

### Notch Design (Traditional)
- **Status Bar Height:** 44 points (88px at 2x)
- **Top Safe Area Inset:** 48 points (96px at 2x) - Portrait
- **Notch Dimensions (estimated):**
  - Width: ~175 points (~350px at 2x, ~35mm physical)
  - Height: ~30 points (~60px at 2x)
  - Border Radius: ~15 points (~30px at 2x)

**Note:** The iPhone 11 uses the traditional notch design (same as iPhone XR, X, XS), NOT Dynamic Island. The LCD panel results in a slightly larger notch than OLED iPhones of the same generation.

---

## 3. Safe Areas (for CSS Layout)

### Portrait Mode
- **Top Inset:** 48 points (96px at 2x)
- **Bottom Inset:** 34 points (68px at 2x)
- **Left Inset:** 0 points
- **Right Inset:** 0 points

### Landscape Mode
- **Top Inset:** 0 points
- **Bottom Inset:** 21 points (42px at 2x)
- **Left Inset:** 48 points (96px at 2x)
- **Right Inset:** 48 points (96px at 2x)

**Note:** Safe areas are smaller than Pro models due to 2x vs 3x scaling and different notch design.

---

## 4. Button Specifications

### Power Button (Side Button)
- **Location:** Right side
- **Position from Top:** ~115mm (estimated)
- **Height:** ~11mm (estimated)
- **Material:** Anodized aluminum matching frame
- **Function:** Power on/off, Siri, Emergency SOS, Apple Pay

### Volume Buttons
- **Location:** Left side, below Ring/Silent switch
- **Volume Up Position:** ~105mm from top (estimated)
- **Volume Down Position:** ~120mm from top (estimated)
- **Height (each):** ~9mm (estimated)
- **Material:** Anodized aluminum matching frame

### Ring/Silent Switch (Traditional)
- **Location:** Left side, above volume buttons
- **Position from Top:** ~90mm from top (estimated)
- **Type:** Physical toggle switch
- **Length:** ~9mm (estimated)
- **Function:** Mute on/off (shows orange indicator when muted)

**Button Count:** 3 buttons + 1 switch (standard iPhone configuration)

**Note:** All buttons are anodized aluminum to match the glass-aluminum sandwich design, unlike stainless steel Pro models.

---

## 5. Materials & Finishes

### Frame Material
- **Type:** Aerospace-grade aluminum (7000 series)
- **Properties:** Lightweight, durable, affordable
- **Finish:** Anodized matte finish
- **Color Matched:** Frame color matches glass back

### Glass
- **Front:** Strengthened glass (not Ceramic Shield - introduced in iPhone 12)
- **Back:** Colored glass with gradient finish
- **Durability:** IP68 rated (up to 2m for 30 min) - less than Pro models

**Note:** The iPhone 11 has LOWER water resistance than Pro models (2m vs 6m depth rating).

### Finish Options
- **Black** (black glass, black aluminum)
- **White** (white glass, silver aluminum)
- **Green** (mint green glass, green aluminum)
- **Yellow** (yellow glass, yellow aluminum)
- **Purple** (lavender glass, purple aluminum)
- **Red** (PRODUCT RED - red glass, red aluminum)

**Design Philosophy:** Colorful, consumer-friendly options vs professional subdued tones of Pro models.

### Surface Finish
- **Frame:** Matte anodized aluminum (soft-touch)
- **Glass Back:** Glossy with color gradient
- **Glass Front:** Glossy with oleophobic coating
- **Buttons:** Anodized aluminum to match frame color

---

## 6. CSS Implementation Values

### Device Frame Container
```css
.iphone-11-frame {
  /* Physical dimensions converted to CSS pixels (at 1x) */
  width: 414px; /* 828px / 2 */
  height: 896px; /* 1792px / 2 */

  /* Border radius (continuous curve approximation) */
  border-radius: 40px;

  /* Bezel simulation - asymmetric (thicker bottom) */
  border-top: 4.5px solid #1c1c1e;
  border-left: 4.5px solid #1c1c1e;
  border-right: 4.5px solid #1c1c1e;
  border-bottom: 7.5px solid #1c1c1e; /* Thicker chin */

  /* Aluminum frame appearance */
  background: linear-gradient(135deg, #d8d8d8, #c0c0c0);
  box-shadow:
    inset 0 0 0 1px rgba(255, 255, 255, 0.2),
    0 2px 8px rgba(0, 0, 0, 0.2);
}

/* Black variant */
.iphone-11-frame.black {
  background: linear-gradient(135deg, #2c2c2e, #1c1c1e);
  border-color: #000;
}

/* Colorful variants (example: green) */
.iphone-11-frame.green {
  background: linear-gradient(135deg, #a8d5ba, #8bc49f);
  border-color: #7ab893;
}
```

### Screen Area (excluding bezels)
```css
.iphone-11-screen {
  /* Screen dimensions at 1x */
  width: 414px;
  height: 896px;

  /* LCD background (not true black) */
  background: #0a0a0a; /* LCD can't display true black */

  /* Inner border radius */
  border-radius: 36px; /* account for bezels */

  /* Safe areas for content */
  padding-top: 48px; /* Notch clearance */
  padding-bottom: 34px; /* Home indicator */
}
```

### Notch (Traditional Design)
```css
.iphone-11-notch {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);

  /* Notch dimensions */
  width: 175px; /* at 1x */
  height: 30px; /* at 1x */

  /* Rounded bottom corners */
  border-radius: 0 0 15px 15px;

  /* Appearance */
  background: #000;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

/* Ears (areas on either side of notch) */
.iphone-11-notch-ear-left,
.iphone-11-notch-ear-right {
  position: absolute;
  top: 0;
  height: 48px; /* Status bar height */
  background: #000;
}

.iphone-11-notch-ear-left {
  left: 0;
  right: calc(50% + 87.5px); /* Half notch width */
  border-radius: 40px 0 0 0; /* Top-left corner only */
}

.iphone-11-notch-ear-right {
  right: 0;
  left: calc(50% + 87.5px); /* Half notch width */
  border-radius: 0 40px 0 0; /* Top-right corner only */
}
```

### Buttons (Visual Only)
```css
/* Power button */
.power-button {
  position: absolute;
  right: -4.5px; /* aligned with bezel edge */
  top: 115px;
  width: 3px;
  height: 11px;
  background: linear-gradient(90deg, #c0c0c0, #d8d8d8);
  border-radius: 1px;
}

/* Ring/Silent switch */
.ring-silent-switch {
  position: absolute;
  left: -4.5px;
  top: 90px;
  width: 3px;
  height: 9px;
  background: linear-gradient(270deg, #c0c0c0, #d8d8d8);
  border-radius: 1px;
}

/* Orange indicator when muted */
.ring-silent-switch.muted::before {
  content: '';
  position: absolute;
  width: 2.5px;
  height: 2.5px;
  background: #ff9500; /* iOS orange */
  border-radius: 50%;
  top: 3px;
  left: 0.25px;
}

/* Volume buttons */
.volume-up {
  position: absolute;
  left: -4.5px;
  top: 105px;
  width: 3px;
  height: 9px;
  background: linear-gradient(270deg, #c0c0c0, #d8d8d8);
  border-radius: 1px;
}

.volume-down {
  position: absolute;
  left: -4.5px;
  top: 120px;
  width: 3px;
  height: 9px;
  background: linear-gradient(270deg, #c0c0c0, #d8d8d8);
  border-radius: 1px;
}
```

---

## 7. Viewport & Scale Factor

### Native Resolution
- **Pixels:** 828 × 1792 px
- **Points:** 414 × 896 pt
- **Scale Factor:** 2x (@2x assets) - NOT 3x

**Important:** The iPhone 11 uses @2x assets, unlike Pro models which use @3x. This affects:
- Asset preparation (provide @2x images)
- Pixel precision calculations
- CSS pixel to physical pixel mapping

### Web Viewport
```html
<meta name="viewport" content="width=414, initial-scale=1.0,
      maximum-scale=1.0, user-scalable=no">
```

### Media Queries
```css
/* Target iPhone 11 specifically */
@media only screen
  and (device-width: 414px)
  and (device-height: 896px)
  and (-webkit-device-pixel-ratio: 2) {
  /* iPhone 11 specific styles */
}

/* Note: Same viewport as iPhone XR - differentiate by user agent or other features */
```

---

## 8. Discrepancies & Resolution

### Bezel Measurements
- **Issue:** Exact bezel thickness not officially published
- **LCD Chin:** Community consensus on 7-8mm bottom bezel
- **Side Bezels:** Estimated 4-5mm based on photography
- **Resolution:** Using 4.5mm sides, 7.5mm bottom as reasonable estimates

### Notch Dimensions
- **Width Consensus:** ~35mm physical (175pt, 350px at 2x)
- **Historical Reference:** Same notch design as iPhone XR, X, XS
- **Source:** Developer community measurements
- **Resolution:** Using established notch dimensions from iPhone X family

### LCD vs OLED Bezel Asymmetry
- **Confirmed:** LCD requires thicker bottom bezel
- **Reason:** Backlight connector ribbon
- **Visual Impact:** Noticeable "chin" compared to top/side bezels
- **Resolution:** Rendering asymmetric bezels for accuracy

### Button Positions
- **Issue:** No official measurements from edges
- **Resolution:** Estimated from product photography
- **Accuracy:** ±3mm tolerance expected
- **Note:** Buttons are slightly lower than Pro models due to larger overall height

---

## 9. Visual Reference Images

### Official Apple Images
- Apple Newsroom: https://www.apple.com/newsroom/2019/09/apple-introduces-iphone-11/
- Tech Specs (archived): https://support.apple.com/kb/SP804

### Technical References
- GSMArena Photos: https://www.gsmarena.com/apple_iphone_11-9848.php
- Wikipedia: https://en.wikipedia.org/wiki/IPhone_11

### Design Resources
- Apple HIG (iOS 13): https://developer.apple.com/design/human-interface-guidelines/
- Screen Sizes: Various developer resources

---

## 10. Implementation Notes

### Key Considerations for Pixel-Perfect Rendering

1. **LCD Display:** Render with slight backlight glow - NOT pure black like OLED. Use `#0a0a0a` or similar very dark gray.

2. **Thick Bezels:** The 7.5mm bottom bezel is VERY noticeable. Render asymmetric bezels for accuracy.

3. **Traditional Notch:** Use the classic notch design, not Dynamic Island. Notch is static (no animations).

4. **2x Scaling:** All dimensions are @2x, not @3x. This affects pixel calculations and asset preparation.

5. **Colorful Aluminum:** The frame color matches the back glass. Use vibrant gradients for colored models.

6. **Lower Resolution:** 326 ppi vs 460 ppi on Pro models. Screen appears slightly less sharp.

7. **No ProMotion:** 60Hz only - no need for high refresh rate considerations.

### Performance Optimization

- LCD rendering is simpler than OLED (no true black state)
- No Dynamic Island animations needed
- Static notch requires no transition effects
- Use standard CSS gradients for aluminum finish

---

## 11. Comparison to Other Models

### vs iPhone 11 Pro
- **Larger/Heavier:** +5.1mm height, +4.1mm width, +13g weight
- **Thicker Bezels:** ~5-7.5mm vs ~2.5mm
- **LCD vs OLED:** Different display technology
- **Lower Resolution:** 326 ppi vs 458 ppi
- **No 3x:** 2x scaling vs 3x
- **Aluminum vs Steel:** Different frame material
- **Lower Water Resistance:** 2m vs 4m depth
- **Colorful:** Bright colors vs subdued Pro tones

### vs iPhone 14 Pro
- **Much Thicker Bezels:** ~5-7.5mm vs 2.2mm
- **Traditional Notch:** vs Dynamic Island
- **LCD vs OLED:** Fundamental display difference
- **Lower Resolution:** 326 ppi vs 460 ppi
- **No Always-On:** vs Always-On Display
- **60Hz:** vs ProMotion 120Hz
- **2x Scaling:** vs 3x scaling
- **Lower Status Bar:** 44pt vs 54pt

### vs iPhone XR (Previous LCD Model)
- **Same Display:** Identical LCD, resolution, size
- **Same Form Factor:** Nearly identical dimensions
- **Better Camera:** Improved dual camera vs single
- **Faster Chip:** A13 vs A12
- **Same Bezels:** Identical bezel design

---

## 12. Testing Checklist

- [ ] Device frame renders at exactly 414×896 CSS pixels
- [ ] Border radius matches iOS squircle appearance
- [ ] Bezels are asymmetric (thicker bottom ~7.5mm vs sides ~4.5mm)
- [ ] Traditional notch rendered (not Dynamic Island)
- [ ] Notch width is ~175 CSS pixels, centered
- [ ] LCD background is NOT true black (#0a0a0a)
- [ ] Status bar is 44pt height (not 54pt)
- [ ] Ring/Silent switch rendered (not Action Button)
- [ ] Aluminum frame with matte finish
- [ ] Color variants match official Apple colors
- [ ] @2x asset scaling (not @3x)
- [ ] 60Hz animations (no ProMotion)
- [ ] Safe areas prevent notch overlap

---

## 13. Notable Design Characteristics

### LCD Technology Impact
The iPhone 11's LCD display results in several design compromises:

**Advantages:**
- Lower manufacturing cost
- Better battery efficiency in bright environments
- More vibrant color saturation for colorful models
- No OLED burn-in risk

**Disadvantages:**
- Thicker bezels (especially bottom chin)
- No true blacks
- Lower contrast ratio
- No Always-On Display capability
- Lower pixel density (326 vs 460 ppi)

### Colorful Consumer Design
The iPhone 11 was positioned as the "consumer" iPhone with:
- Six vibrant color options
- Colored aluminum frame matching glass back
- Fun, approachable aesthetic
- Lower price point than Pro models

### Camera Design
- **Dual Camera:** Wide + Ultra Wide (no Telephoto)
- **Square Camera Bump:** Introduced the square camera module design
- **Night Mode:** First non-Pro iPhone with Night Mode

---

## 14. Color Accuracy Reference

### Black Frame
```css
.frame-black {
  background: linear-gradient(135deg, #2c2c2e, #1c1c1e);
  border-color: #000;
}
```

### White Frame
```css
.frame-white {
  background: linear-gradient(135deg, #f5f5f7, #e5e5e7);
  border-color: #d8d8d8;
}
```

### Green Frame
```css
.frame-green {
  background: linear-gradient(135deg, #a8d5ba, #8bc49f);
  border-color: #7ab893;
}
```

### Yellow Frame
```css
.frame-yellow {
  background: linear-gradient(135deg, #ffe17a, #ffd952);
  border-color: #f5c542;
}
```

### Purple Frame
```css
.frame-purple {
  background: linear-gradient(135deg, #d8c5e8, #c5afd8);
  border-color: #b39ac8;
}
```

### Red Frame (PRODUCT RED)
```css
.frame-red {
  background: linear-gradient(135deg, #e8505b, #d84450);
  border-color: #c93a45;
}
```

---

## 15. Notch Content (Status Bar Elements)

### Left Side (in notch ear)
- Time (12:00)
- Cellular signal strength
- WiFi indicator

### Right Side (in notch ear)
- Battery percentage (if enabled)
- Battery icon
- Bluetooth indicator (when active)

### TrueDepth Camera System (in notch)
- Front camera (7MP)
- Infrared camera
- Flood illuminator
- Dot projector
- Proximity sensor
- Ambient light sensor

---

## Document Version
Version 1.0 - Initial research compilation
Last Updated: 2025-10-01
Researcher: Device Frame Research Specialist Agent
