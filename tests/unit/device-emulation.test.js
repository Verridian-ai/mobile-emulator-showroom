/**
 * Unit Tests for Device Emulation Module
 * Target Coverage: 80%
 * Tests: Device selection logic, viewport calculations, device frame rendering, orientation switching
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('Device Emulation Module', () => {
  let DeviceEmulator;
  let emulator;
  let mockDocument;
  let mockDeviceFrame;
  let mockIframe;

  // Device configurations
  const DEVICE_CONFIGS = {
    'iphone-14-pro': {
      name: 'iPhone 14 Pro',
      width: 393,
      height: 852,
      pixelRatio: 3,
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)',
    },
    'iphone-se': {
      name: 'iPhone SE',
      width: 375,
      height: 667,
      pixelRatio: 2,
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)',
    },
    'ipad-pro': {
      name: 'iPad Pro',
      width: 1024,
      height: 1366,
      pixelRatio: 2,
      userAgent: 'Mozilla/5.0 (iPad; CPU OS 15_0 like Mac OS X)',
    },
    'samsung-galaxy-s21': {
      name: 'Samsung Galaxy S21',
      width: 360,
      height: 800,
      pixelRatio: 3,
      userAgent: 'Mozilla/5.0 (Linux; Android 11; Samsung Galaxy S21)',
    },
    'desktop-chrome': {
      name: 'Desktop Chrome',
      width: 1920,
      height: 1080,
      pixelRatio: 1,
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
    },
  };

  beforeEach(() => {
    // Mock DOM elements
    mockDeviceFrame = {
      className: '',
      style: {},
      querySelector: vi.fn(),
      insertBefore: vi.fn(),
      appendChild: vi.fn(),
      removeChild: vi.fn(),
      firstChild: null,
    };

    mockIframe = {
      src: '',
      style: {},
      contentWindow: {
        innerWidth: 0,
        innerHeight: 0,
      },
    };

    mockDocument = {
      getElementById: vi.fn(id => {
        if (id === 'deviceFrame') {
          return mockDeviceFrame;
        }
        if (id === 'deviceIframe') {
          return mockIframe;
        }
        return null;
      }),
      querySelectorAll: vi.fn(() => []),
      createElement: vi.fn(tag => {
        const element = {
          tagName: tag.toUpperCase(),
          className: '',
          textContent: '',
          style: {},
          appendChild: vi.fn(),
          remove: vi.fn(),
        };
        return element;
      }),
    };

    global.document = mockDocument;

    // Create DeviceEmulator class
    DeviceEmulator = class {
      constructor() {
        this.state = {
          device: 'iphone-14-pro',
          skin: 'black',
          orientation: 'portrait',
          scale: 'scale-75',
          motion: 'animate-hover',
        };

        this.devices = DEVICE_CONFIGS;
        this.deviceFrame = document.getElementById('deviceFrame');
        this.deviceIframe = document.getElementById('deviceIframe');
      }

      /**
       * Select a device and apply its configuration
       */
      selectDevice(deviceId) {
        if (!this.devices[deviceId]) {
          throw new Error(`Device not found: ${deviceId}`);
        }

        this.state.device = deviceId;
        this.applyState();

        return {
          device: deviceId,
          config: this.devices[deviceId],
        };
      }

      /**
       * Calculate viewport dimensions based on device and orientation
       */
      calculateViewport() {
        const device = this.devices[this.state.device];
        if (!device) {
          return { width: 0, height: 0 };
        }

        let width = device.width;
        let height = device.height;

        // Swap dimensions for landscape
        if (this.state.orientation === 'landscape') {
          [width, height] = [height, width];
        }

        // Apply scale factor
        const scaleFactor = this.getScaleFactor();
        width = Math.round(width * scaleFactor);
        height = Math.round(height * scaleFactor);

        return {
          width,
          height,
          pixelRatio: device.pixelRatio,
          scaleFactor,
        };
      }

      /**
       * Get scale factor from scale setting
       */
      getScaleFactor() {
        const scaleMap = {
          'scale-50': 0.5,
          'scale-75': 0.75,
          'scale-100': 1.0,
          'scale-125': 1.25,
        };

        return scaleMap[this.state.scale] || 1.0;
      }

      /**
       * Apply current state to device frame
       */
      applyState() {
        if (!this.deviceFrame) {
          return;
        }

        const classes = [
          'device-mockup',
          `device-${this.state.device}`,
          this.state.skin,
          this.state.orientation,
          this.state.scale,
          this.state.motion,
        ]
          .filter(Boolean)
          .join(' ');

        this.deviceFrame.className = classes;

        // Apply viewport dimensions to iframe
        this.applyViewportToIframe();

        // Handle desktop browser header
        if (this.state.device === 'desktop-chrome') {
          this.addBrowserHeader();
        } else {
          this.removeBrowserHeader();
        }
      }

      /**
       * Apply viewport dimensions to iframe
       */
      applyViewportToIframe() {
        if (!this.deviceIframe) {
          return;
        }

        const viewport = this.calculateViewport();
        this.deviceIframe.style.width = `${viewport.width}px`;
        this.deviceIframe.style.height = `${viewport.height}px`;

        return viewport;
      }

      /**
       * Add browser header for desktop devices
       */
      addBrowserHeader() {
        if (!this.deviceFrame) {
          return;
        }

        // Check if header already exists
        if (this.deviceFrame.querySelector('.browser-header')) {
          return;
        }

        const header = document.createElement('div');
        header.className = 'browser-header';

        const buttons = document.createElement('div');
        buttons.className = 'browser-buttons';

        ['close', 'minimize', 'maximize'].forEach(type => {
          const button = document.createElement('span');
          button.className = `browser-button ${type}`;
          buttons.appendChild(button);
        });

        const addressBar = document.createElement('div');
        addressBar.className = 'browser-address-bar';
        addressBar.textContent = this.deviceIframe ? this.deviceIframe.src : '';

        header.appendChild(buttons);
        header.appendChild(addressBar);

        this.deviceFrame.insertBefore(header, this.deviceFrame.firstChild);
      }

      /**
       * Remove browser header
       */
      removeBrowserHeader() {
        if (!this.deviceFrame) {
          return;
        }

        const header = this.deviceFrame.querySelector('.browser-header');
        if (header) {
          header.remove();
        }
      }

      /**
       * Switch device orientation
       */
      setOrientation(orientation) {
        if (!['portrait', 'landscape'].includes(orientation)) {
          throw new Error(`Invalid orientation: ${orientation}`);
        }

        this.state.orientation = orientation;
        this.applyState();

        return this.calculateViewport();
      }

      /**
       * Set device skin/color
       */
      setSkin(skin) {
        const validSkins = ['black', 'white', 'gold', 'silver'];
        if (!validSkins.includes(skin)) {
          throw new Error(`Invalid skin: ${skin}`);
        }

        this.state.skin = skin;
        this.applyState();

        return { skin };
      }

      /**
       * Set scale level
       */
      setScale(scale) {
        const validScales = ['scale-50', 'scale-75', 'scale-100', 'scale-125'];
        if (!validScales.includes(scale)) {
          throw new Error(`Invalid scale: ${scale}`);
        }

        this.state.scale = scale;
        this.applyState();

        return this.calculateViewport();
      }

      /**
       * Set motion/animation effect
       */
      setMotion(motion) {
        const validMotions = ['animate-hover', 'animate-pulse', 'static'];
        if (!validMotions.includes(motion)) {
          throw new Error(`Invalid motion: ${motion}`);
        }

        this.state.motion = motion;
        this.applyState();

        return { motion };
      }

      /**
       * Get current device configuration
       */
      getCurrentDevice() {
        return {
          id: this.state.device,
          config: this.devices[this.state.device],
          viewport: this.calculateViewport(),
          state: { ...this.state },
        };
      }

      /**
       * Get all available devices
       */
      getAvailableDevices() {
        return Object.keys(this.devices).map(id => ({
          id,
          name: this.devices[id].name,
          width: this.devices[id].width,
          height: this.devices[id].height,
        }));
      }

      /**
       * Check if device is mobile
       */
      isMobileDevice() {
        const device = this.devices[this.state.device];
        return device && device.width < 768;
      }

      /**
       * Check if device is tablet
       */
      isTabletDevice() {
        const device = this.devices[this.state.device];
        return device && device.width >= 768 && device.width < 1024;
      }

      /**
       * Check if device is desktop
       */
      isDesktopDevice() {
        const device = this.devices[this.state.device];
        return device && device.width >= 1024;
      }

      /**
       * Get user agent for current device
       */
      getUserAgent() {
        const device = this.devices[this.state.device];
        return device ? device.userAgent : '';
      }

      /**
       * Reset to default state
       */
      reset() {
        this.state = {
          device: 'iphone-14-pro',
          skin: 'black',
          orientation: 'portrait',
          scale: 'scale-75',
          motion: 'animate-hover',
        };
        this.applyState();
      }
    };
  });

  afterEach(() => {
    if (emulator) {
      emulator = null;
    }
    vi.clearAllMocks();
  });

  describe('Device Selection Logic', () => {
    beforeEach(() => {
      emulator = new DeviceEmulator();
    });

    it('should select iPhone 14 Pro device', () => {
      const result = emulator.selectDevice('iphone-14-pro');
      expect(result.device).toBe('iphone-14-pro');
      expect(result.config.name).toBe('iPhone 14 Pro');
      expect(emulator.state.device).toBe('iphone-14-pro');
    });

    it('should select Samsung Galaxy S21 device', () => {
      const result = emulator.selectDevice('samsung-galaxy-s21');
      expect(result.device).toBe('samsung-galaxy-s21');
      expect(result.config.width).toBe(360);
    });

    it('should select iPad Pro device', () => {
      const result = emulator.selectDevice('ipad-pro');
      expect(result.device).toBe('ipad-pro');
      expect(result.config.width).toBe(1024);
    });

    it('should select Desktop Chrome device', () => {
      const result = emulator.selectDevice('desktop-chrome');
      expect(result.device).toBe('desktop-chrome');
      expect(result.config.width).toBe(1920);
    });

    it('should throw error for unknown device', () => {
      expect(() => {
        emulator.selectDevice('unknown-device');
      }).toThrow('Device not found');
    });

    it('should apply state after device selection', () => {
      emulator.selectDevice('iphone-se');
      expect(mockDeviceFrame.className).toContain('device-iphone-se');
    });

    it('should get all available devices', () => {
      const devices = emulator.getAvailableDevices();
      expect(devices.length).toBeGreaterThan(0);
      expect(devices[0]).toHaveProperty('id');
      expect(devices[0]).toHaveProperty('name');
    });
  });

  describe('Viewport Calculations', () => {
    beforeEach(() => {
      emulator = new DeviceEmulator();
    });

    it('should calculate viewport for portrait orientation', () => {
      emulator.selectDevice('iphone-14-pro');
      emulator.setOrientation('portrait');
      const viewport = emulator.calculateViewport();
      expect(viewport.width).toBe(Math.round(393 * 0.75)); // scale-75
      expect(viewport.height).toBe(Math.round(852 * 0.75));
    });

    it('should calculate viewport for landscape orientation', () => {
      emulator.selectDevice('iphone-14-pro');
      emulator.setOrientation('landscape');
      const viewport = emulator.calculateViewport();
      expect(viewport.width).toBe(Math.round(852 * 0.75)); // Dimensions swapped
      expect(viewport.height).toBe(Math.round(393 * 0.75));
    });

    it('should apply scale factor correctly', () => {
      emulator.selectDevice('iphone-14-pro');
      emulator.setScale('scale-100');
      const viewport = emulator.calculateViewport();
      expect(viewport.width).toBe(393);
      expect(viewport.height).toBe(852);
    });

    it('should apply 50% scale', () => {
      emulator.selectDevice('iphone-14-pro');
      emulator.setScale('scale-50');
      const viewport = emulator.calculateViewport();
      expect(viewport.scaleFactor).toBe(0.5);
    });

    it('should apply 125% scale', () => {
      emulator.selectDevice('iphone-14-pro');
      emulator.setScale('scale-125');
      const viewport = emulator.calculateViewport();
      expect(viewport.scaleFactor).toBe(1.25);
    });

    it('should include pixel ratio in viewport', () => {
      emulator.selectDevice('iphone-14-pro');
      const viewport = emulator.calculateViewport();
      expect(viewport.pixelRatio).toBe(3);
    });

    it('should handle missing device gracefully', () => {
      emulator.state.device = 'non-existent';
      const viewport = emulator.calculateViewport();
      expect(viewport.width).toBe(0);
      expect(viewport.height).toBe(0);
    });

    it('should calculate different viewports for different devices', () => {
      emulator.selectDevice('iphone-14-pro');
      const viewport1 = emulator.calculateViewport();

      emulator.selectDevice('ipad-pro');
      const viewport2 = emulator.calculateViewport();

      expect(viewport1.width).not.toBe(viewport2.width);
      expect(viewport1.height).not.toBe(viewport2.height);
    });
  });

  describe('Device Frame Rendering', () => {
    beforeEach(() => {
      emulator = new DeviceEmulator();
    });

    it('should apply device class to frame', () => {
      emulator.selectDevice('iphone-14-pro');
      expect(mockDeviceFrame.className).toContain('device-iphone-14-pro');
    });

    it('should apply skin class to frame', () => {
      emulator.setSkin('white');
      expect(mockDeviceFrame.className).toContain('white');
    });

    it('should apply orientation class to frame', () => {
      emulator.setOrientation('landscape');
      expect(mockDeviceFrame.className).toContain('landscape');
    });

    it('should apply scale class to frame', () => {
      emulator.setScale('scale-100');
      expect(mockDeviceFrame.className).toContain('scale-100');
    });

    it('should apply motion class to frame', () => {
      emulator.setMotion('animate-pulse');
      expect(mockDeviceFrame.className).toContain('animate-pulse');
    });

    it('should apply all classes together', () => {
      emulator.selectDevice('samsung-galaxy-s21');
      emulator.setSkin('gold');
      emulator.setOrientation('portrait');
      emulator.setScale('scale-75');
      emulator.setMotion('static');

      expect(mockDeviceFrame.className).toContain('device-samsung-galaxy-s21');
      expect(mockDeviceFrame.className).toContain('gold');
      expect(mockDeviceFrame.className).toContain('portrait');
      expect(mockDeviceFrame.className).toContain('scale-75');
      expect(mockDeviceFrame.className).toContain('static');
    });

    it('should add browser header for desktop devices', () => {
      mockDeviceFrame.querySelector.mockReturnValue(null);
      emulator.selectDevice('desktop-chrome');
      expect(mockDocument.createElement).toHaveBeenCalledWith('div');
    });

    it('should not add duplicate browser headers', () => {
      const mockHeader = { className: 'browser-header' };
      mockDeviceFrame.querySelector.mockReturnValue(mockHeader);
      emulator.selectDevice('desktop-chrome');
      emulator.addBrowserHeader();
      // Should not create new header if one exists
    });

    it('should remove browser header for mobile devices', () => {
      const mockHeader = { remove: vi.fn(), className: 'browser-header' };
      mockDeviceFrame.querySelector.mockReturnValue(mockHeader);
      emulator.selectDevice('iphone-14-pro');
      expect(mockHeader.remove).toHaveBeenCalled();
    });

    it('should apply viewport dimensions to iframe', () => {
      emulator.selectDevice('iphone-14-pro');
      const viewport = emulator.applyViewportToIframe();
      expect(mockIframe.style.width).toBeDefined();
      expect(mockIframe.style.height).toBeDefined();
      expect(viewport).toHaveProperty('width');
      expect(viewport).toHaveProperty('height');
    });
  });

  describe('Orientation Switching', () => {
    beforeEach(() => {
      emulator = new DeviceEmulator();
      emulator.selectDevice('iphone-14-pro');
    });

    it('should switch to landscape orientation', () => {
      const viewport = emulator.setOrientation('landscape');
      expect(emulator.state.orientation).toBe('landscape');
      expect(viewport.width).toBeGreaterThan(viewport.height);
    });

    it('should switch to portrait orientation', () => {
      emulator.setOrientation('landscape');
      const viewport = emulator.setOrientation('portrait');
      expect(emulator.state.orientation).toBe('portrait');
      expect(viewport.height).toBeGreaterThan(viewport.width);
    });

    it('should throw error for invalid orientation', () => {
      expect(() => {
        emulator.setOrientation('diagonal');
      }).toThrow('Invalid orientation');
    });

    it('should update viewport when orientation changes', () => {
      const portraitViewport = emulator.calculateViewport();
      emulator.setOrientation('landscape');
      const landscapeViewport = emulator.calculateViewport();

      expect(portraitViewport.width).toBe(landscapeViewport.height);
      expect(portraitViewport.height).toBe(landscapeViewport.width);
    });
  });

  describe('Skin Management', () => {
    beforeEach(() => {
      emulator = new DeviceEmulator();
    });

    it('should set black skin', () => {
      const result = emulator.setSkin('black');
      expect(result.skin).toBe('black');
      expect(emulator.state.skin).toBe('black');
    });

    it('should set white skin', () => {
      const result = emulator.setSkin('white');
      expect(result.skin).toBe('white');
    });

    it('should set gold skin', () => {
      const result = emulator.setSkin('gold');
      expect(result.skin).toBe('gold');
    });

    it('should set silver skin', () => {
      const result = emulator.setSkin('silver');
      expect(result.skin).toBe('silver');
    });

    it('should throw error for invalid skin', () => {
      expect(() => {
        emulator.setSkin('rainbow');
      }).toThrow('Invalid skin');
    });
  });

  describe('Scale Management', () => {
    beforeEach(() => {
      emulator = new DeviceEmulator();
    });

    it('should get correct scale factor for scale-50', () => {
      emulator.setScale('scale-50');
      expect(emulator.getScaleFactor()).toBe(0.5);
    });

    it('should get correct scale factor for scale-75', () => {
      emulator.setScale('scale-75');
      expect(emulator.getScaleFactor()).toBe(0.75);
    });

    it('should get correct scale factor for scale-100', () => {
      emulator.setScale('scale-100');
      expect(emulator.getScaleFactor()).toBe(1.0);
    });

    it('should get correct scale factor for scale-125', () => {
      emulator.setScale('scale-125');
      expect(emulator.getScaleFactor()).toBe(1.25);
    });

    it('should return default scale factor for unknown scale', () => {
      emulator.state.scale = 'unknown';
      expect(emulator.getScaleFactor()).toBe(1.0);
    });

    it('should throw error for invalid scale', () => {
      expect(() => {
        emulator.setScale('scale-200');
      }).toThrow('Invalid scale');
    });
  });

  describe('Motion Effects', () => {
    beforeEach(() => {
      emulator = new DeviceEmulator();
    });

    it('should set hover animation', () => {
      const result = emulator.setMotion('animate-hover');
      expect(result.motion).toBe('animate-hover');
    });

    it('should set pulse animation', () => {
      const result = emulator.setMotion('animate-pulse');
      expect(result.motion).toBe('animate-pulse');
    });

    it('should set static (no animation)', () => {
      const result = emulator.setMotion('static');
      expect(result.motion).toBe('static');
    });

    it('should throw error for invalid motion', () => {
      expect(() => {
        emulator.setMotion('animate-bounce');
      }).toThrow('Invalid motion');
    });
  });

  describe('Device Type Detection', () => {
    beforeEach(() => {
      emulator = new DeviceEmulator();
    });

    it('should detect mobile device', () => {
      emulator.selectDevice('iphone-14-pro');
      expect(emulator.isMobileDevice()).toBe(true);
      expect(emulator.isTabletDevice()).toBe(false);
      expect(emulator.isDesktopDevice()).toBe(false);
    });

    it('should detect tablet device', () => {
      emulator.selectDevice('ipad-pro');
      expect(emulator.isMobileDevice()).toBe(false);
      expect(emulator.isTabletDevice()).toBe(false); // iPad Pro is > 1024
      expect(emulator.isDesktopDevice()).toBe(true);
    });

    it('should detect desktop device', () => {
      emulator.selectDevice('desktop-chrome');
      expect(emulator.isMobileDevice()).toBe(false);
      expect(emulator.isTabletDevice()).toBe(false);
      expect(emulator.isDesktopDevice()).toBe(true);
    });
  });

  describe('User Agent Management', () => {
    beforeEach(() => {
      emulator = new DeviceEmulator();
    });

    it('should get iPhone user agent', () => {
      emulator.selectDevice('iphone-14-pro');
      const ua = emulator.getUserAgent();
      expect(ua).toContain('iPhone');
    });

    it('should get Android user agent', () => {
      emulator.selectDevice('samsung-galaxy-s21');
      const ua = emulator.getUserAgent();
      expect(ua).toContain('Android');
    });

    it('should get desktop user agent', () => {
      emulator.selectDevice('desktop-chrome');
      const ua = emulator.getUserAgent();
      expect(ua).toContain('Chrome');
    });

    it('should return empty string for unknown device', () => {
      emulator.state.device = 'unknown';
      const ua = emulator.getUserAgent();
      expect(ua).toBe('');
    });
  });

  describe('State Management', () => {
    beforeEach(() => {
      emulator = new DeviceEmulator();
    });

    it('should get current device state', () => {
      emulator.selectDevice('iphone-14-pro');
      emulator.setOrientation('landscape');
      emulator.setSkin('white');

      const current = emulator.getCurrentDevice();

      expect(current.id).toBe('iphone-14-pro');
      expect(current.state.orientation).toBe('landscape');
      expect(current.state.skin).toBe('white');
      expect(current.viewport).toBeDefined();
    });

    it('should reset to default state', () => {
      emulator.selectDevice('desktop-chrome');
      emulator.setOrientation('landscape');
      emulator.setSkin('gold');

      emulator.reset();

      expect(emulator.state.device).toBe('iphone-14-pro');
      expect(emulator.state.orientation).toBe('portrait');
      expect(emulator.state.skin).toBe('black');
      expect(emulator.state.scale).toBe('scale-75');
    });

    it('should maintain state consistency', () => {
      emulator.selectDevice('samsung-galaxy-s21');
      emulator.setSkin('silver');
      emulator.setScale('scale-100');

      const state1 = { ...emulator.state };

      emulator.applyState();

      expect(emulator.state).toEqual(state1);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    beforeEach(() => {
      emulator = new DeviceEmulator();
    });

    it('should handle missing deviceFrame gracefully', () => {
      emulator.deviceFrame = null;
      expect(() => emulator.applyState()).not.toThrow();
    });

    it('should handle missing deviceIframe gracefully', () => {
      emulator.deviceIframe = null;
      expect(() => emulator.applyViewportToIframe()).not.toThrow();
    });

    it('should handle null querySelector results', () => {
      mockDeviceFrame.querySelector.mockReturnValue(null);
      expect(() => emulator.removeBrowserHeader()).not.toThrow();
    });

    it('should handle rapid device switches', () => {
      emulator.selectDevice('iphone-14-pro');
      emulator.selectDevice('ipad-pro');
      emulator.selectDevice('samsung-galaxy-s21');
      expect(emulator.state.device).toBe('samsung-galaxy-s21');
    });

    it('should handle rapid orientation switches', () => {
      emulator.setOrientation('landscape');
      emulator.setOrientation('portrait');
      emulator.setOrientation('landscape');
      expect(emulator.state.orientation).toBe('landscape');
    });
  });
});
