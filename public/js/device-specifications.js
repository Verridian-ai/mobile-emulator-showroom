/**
 * Device Specifications Database
 * Article II (Performance): Exact viewport dimensions for accurate device emulation
 * Article IV (UX): Pixel-perfect device frame rendering
 *
 * All viewport dimensions researched and verified from:
 * - https://yesviz.com/iphones.php
 * - https://blisk.io/devices
 * - https://www.ios-resolution.com/
 *
 * Last Updated: 2025-10-01
 */

/**
 * @typedef {Object} DeviceSpecification
 * @property {Object} viewport - CSS pixel viewport dimensions
 * @property {number} viewport.width - Viewport width in CSS pixels
 * @property {number} viewport.height - Viewport height in CSS pixels
 * @property {number} dpr - Device Pixel Ratio
 * @property {Object} physical - Physical screen resolution
 * @property {number} physical.width - Physical width in pixels
 * @property {number} physical.height - Physical height in pixels
 * @property {string} display - Display size in inches
 * @property {string} manufacturer - Device manufacturer
 * @property {string} category - Device category (phone, tablet, desktop)
 */

export const DEVICE_SPECIFICATIONS = {
  // ============================================
  // APPLE iPHONE - HOME BUTTON ERA
  // ============================================

  'iphone-6': {
    viewport: { width: 375, height: 667 },
    dpr: 2,
    physical: { width: 750, height: 1334 },
    display: '4.7"',
    manufacturer: 'Apple',
    category: 'phone'
  },

  'iphone-6s': {
    viewport: { width: 375, height: 667 },
    dpr: 2,
    physical: { width: 750, height: 1334 },
    display: '4.7"',
    manufacturer: 'Apple',
    category: 'phone'
  },

  'iphone-7': {
    viewport: { width: 375, height: 667 },
    dpr: 2,
    physical: { width: 750, height: 1334 },
    display: '4.7"',
    manufacturer: 'Apple',
    category: 'phone'
  },

  'iphone-8': {
    viewport: { width: 375, height: 667 },
    dpr: 2,
    physical: { width: 750, height: 1334 },
    display: '4.7"',
    manufacturer: 'Apple',
    category: 'phone'
  },

  // ============================================
  // APPLE iPHONE - NOTCH ERA
  // ============================================

  'iphone-x': {
    viewport: { width: 375, height: 812 },
    dpr: 3,
    physical: { width: 1125, height: 2436 },
    display: '5.8"',
    manufacturer: 'Apple',
    category: 'phone'
  },

  'iphone-11': {
    viewport: { width: 414, height: 896 }, // CORRECTED from 375x812
    dpr: 2,
    physical: { width: 828, height: 1792 },
    display: '6.1"',
    manufacturer: 'Apple',
    category: 'phone'
  },

  // ============================================
  // APPLE iPHONE - SQUARED EDGES ERA
  // ============================================

  'iphone-12': {
    viewport: { width: 390, height: 844 },
    dpr: 3,
    physical: { width: 1170, height: 2532 },
    display: '6.1"',
    manufacturer: 'Apple',
    category: 'phone'
  },

  'iphone-13': {
    viewport: { width: 390, height: 844 },
    dpr: 3,
    physical: { width: 1170, height: 2532 },
    display: '6.1"',
    manufacturer: 'Apple',
    category: 'phone'
  },

  // ============================================
  // APPLE iPHONE - DYNAMIC ISLAND ERA
  // ============================================

  'iphone-14': {
    viewport: { width: 390, height: 844 },
    dpr: 3,
    physical: { width: 1170, height: 2532 },
    display: '6.1"',
    manufacturer: 'Apple',
    category: 'phone'
  },

  'iphone-14-pro': {
    viewport: { width: 393, height: 852 },
    dpr: 3,
    physical: { width: 1179, height: 2556 },
    display: '6.1"',
    manufacturer: 'Apple',
    category: 'phone'
  },

  'iphone-15': {
    viewport: { width: 393, height: 852 },
    dpr: 3,
    physical: { width: 1179, height: 2556 },
    display: '6.1"',
    manufacturer: 'Apple',
    category: 'phone'
  },

  'iphone-15-pro': {
    viewport: { width: 393, height: 852 },
    dpr: 3,
    physical: { width: 1179, height: 2556 },
    display: '6.1"',
    manufacturer: 'Apple',
    category: 'phone'
  },

  'iphone-16-pro': {
    viewport: { width: 393, height: 852 },
    dpr: 3,
    physical: { width: 1179, height: 2556 },
    display: '6.1"',
    manufacturer: 'Apple',
    category: 'phone'
  },

  // ============================================
  // SAMSUNG GALAXY - S SERIES
  // ============================================

  'galaxy-s7': {
    viewport: { width: 360, height: 640 },
    dpr: 4,
    physical: { width: 1440, height: 2560 },
    display: '5.1"',
    manufacturer: 'Samsung',
    category: 'phone'
  },

  'galaxy-s10': {
    viewport: { width: 360, height: 760 },
    dpr: 4,
    physical: { width: 1440, height: 3040 },
    display: '6.1"',
    manufacturer: 'Samsung',
    category: 'phone'
  },

  'galaxy-s21': {
    viewport: { width: 384, height: 854 },
    dpr: 3.75,
    physical: { width: 1440, height: 3200 },
    display: '6.2"',
    manufacturer: 'Samsung',
    category: 'phone'
  },

  'galaxy-s22': {
    viewport: { width: 360, height: 780 },
    dpr: 3,
    physical: { width: 1080, height: 2340 },
    display: '6.1"',
    manufacturer: 'Samsung',
    category: 'phone'
  },

  'galaxy-s24': {
    viewport: { width: 360, height: 780 },
    dpr: 3,
    physical: { width: 1080, height: 2340 },
    display: '6.2"',
    manufacturer: 'Samsung',
    category: 'phone'
  },

  // ============================================
  // SAMSUNG GALAXY - ULTRA SERIES
  // ============================================

  'galaxy-s25-ultra': {
    viewport: { width: 412, height: 883 },
    dpr: 3.5,
    physical: { width: 1440, height: 3088 },
    display: '6.9"',
    manufacturer: 'Samsung',
    category: 'phone'
  },

  // ============================================
  // GOOGLE PIXEL SERIES
  // ============================================

  'pixel-3': {
    viewport: { width: 393, height: 786 },
    dpr: 2.75,
    physical: { width: 1080, height: 2160 },
    display: '5.5"',
    manufacturer: 'Google',
    category: 'phone'
  },

  'pixel-5': {
    viewport: { width: 393, height: 851 },
    dpr: 2.75,
    physical: { width: 1080, height: 2340 },
    display: '6.0"',
    manufacturer: 'Google',
    category: 'phone'
  },

  'pixel-7': {
    viewport: { width: 412, height: 915 },
    dpr: 2.625,
    physical: { width: 1080, height: 2400 },
    display: '6.3"',
    manufacturer: 'Google',
    category: 'phone'
  },

  'pixel-8': {
    viewport: { width: 412, height: 915 },
    dpr: 2.625,
    physical: { width: 1080, height: 2400 },
    display: '6.2"',
    manufacturer: 'Google',
    category: 'phone'
  },

  'pixel-9-pro': {
    viewport: { width: 448, height: 998 },
    dpr: 3,
    physical: { width: 1344, height: 2992 },
    display: '6.3"',
    manufacturer: 'Google',
    category: 'phone'
  },

  // ============================================
  // APPLE iPAD SERIES
  // ============================================

  'ipad-air-2022': {
    viewport: { width: 820, height: 1180 },
    dpr: 2,
    physical: { width: 1640, height: 2360 },
    display: '10.9"',
    manufacturer: 'Apple',
    category: 'tablet'
  },

  'ipad-pro-13-m4': {
    viewport: { width: 1024, height: 1366 },
    dpr: 2,
    physical: { width: 2048, height: 2732 },
    display: '13"',
    manufacturer: 'Apple',
    category: 'tablet'
  },

  // ============================================
  // DESKTOP BROWSERS
  // ============================================

  'desktop-chrome': {
    viewport: { width: 1200, height: 700 },
    dpr: 1,
    physical: { width: 1200, height: 700 },
    display: 'N/A',
    manufacturer: 'Google',
    category: 'desktop'
  }
};

/**
 * Get device specification by device class
 * @param {string} deviceClass - Device class identifier (e.g., 'iphone-14-pro')
 * @returns {DeviceSpecification|null} Device specification or null if not found
 */
export function getDeviceSpec(deviceClass) {
  return DEVICE_SPECIFICATIONS[deviceClass] || null;
}

/**
 * Get all devices by category
 * @param {string} category - Category: 'phone', 'tablet', or 'desktop'
 * @returns {Object} Devices in the specified category
 */
export function getDevicesByCategory(category) {
  return Object.entries(DEVICE_SPECIFICATIONS)
    .filter(([_, spec]) => spec.category === category)
    .reduce((acc, [key, spec]) => ({ ...acc, [key]: spec }), {});
}

/**
 * Get all devices by manufacturer
 * @param {string} manufacturer - Manufacturer name (Apple, Samsung, Google)
 * @returns {Object} Devices from the specified manufacturer
 */
export function getDevicesByManufacturer(manufacturer) {
  return Object.entries(DEVICE_SPECIFICATIONS)
    .filter(([_, spec]) => spec.manufacturer === manufacturer)
    .reduce((acc, [key, spec]) => ({ ...acc, [key]: spec }), {});
}

/**
 * Calculate iframe scale factor for viewport fitting
 * @param {string} deviceClass - Device class identifier
 * @param {number} containerWidth - Container width in pixels
 * @param {number} containerHeight - Container height in pixels
 * @returns {number} Scale factor (0-1)
 */
export function calculateScaleFactor(deviceClass, containerWidth, containerHeight) {
  const spec = getDeviceSpec(deviceClass);
  if (!spec) return 1;

  const widthScale = containerWidth / spec.viewport.width;
  const heightScale = containerHeight / spec.viewport.height;

  // Use the smaller scale to ensure content fits
  return Math.min(widthScale, heightScale, 1);
}

/**
 * Validate device class exists
 * @param {string} deviceClass - Device class to validate
 * @returns {boolean} True if device exists
 */
export function isValidDevice(deviceClass) {
  return deviceClass in DEVICE_SPECIFICATIONS;
}

// Export for global access (for non-module environments)
if (typeof window !== 'undefined') {
  window.DeviceSpecifications = {
    DEVICE_SPECIFICATIONS,
    getDeviceSpec,
    getDevicesByCategory,
    getDevicesByManufacturer,
    calculateScaleFactor,
    isValidDevice
  };
}
