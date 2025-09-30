/**
 * Sample Unit Test - Testing Framework Verification
 *
 * Purpose: Verify that Vitest is properly configured and operational
 * This test validates basic testing infrastructure functionality
 */

import { describe, it, expect, vi } from 'vitest';

describe('Testing Framework Setup', () => {
  describe('Basic Assertions', () => {
    it('should perform basic equality checks', () => {
      expect(1 + 1).toBe(2);
      expect('hello').toBe('hello');
      expect(true).toBe(true);
    });

    it('should handle object comparisons', () => {
      const obj = { name: 'Mobile Emulator', version: '1.0.0' };
      expect(obj).toEqual({ name: 'Mobile Emulator', version: '1.0.0' });
      expect(obj).toHaveProperty('name');
      expect(obj.name).toBe('Mobile Emulator');
    });

    it('should handle array operations', () => {
      const devices = ['iPhone', 'Galaxy', 'Pixel'];
      expect(devices).toHaveLength(3);
      expect(devices).toContain('iPhone');
      expect(devices[0]).toBe('iPhone');
    });
  });

  describe('Async Operations', () => {
    it('should handle promises', async () => {
      const promise = Promise.resolve('success');
      await expect(promise).resolves.toBe('success');
    });

    it('should handle async functions', async () => {
      const fetchData = async () => {
        return { status: 'ok', data: 'test' };
      };

      const result = await fetchData();
      expect(result.status).toBe('ok');
      expect(result.data).toBe('test');
    });
  });

  describe('Mock Functions', () => {
    it('should create and track mock function calls', () => {
      const mockFn = vi.fn();
      mockFn('test');
      mockFn('test2');

      expect(mockFn).toHaveBeenCalledTimes(2);
      expect(mockFn).toHaveBeenCalledWith('test');
      expect(mockFn).toHaveBeenCalledWith('test2');
    });

    it('should mock return values', () => {
      const mockFn = vi.fn(() => 'mocked value');
      const result = mockFn();

      expect(result).toBe('mocked value');
      expect(mockFn).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should catch thrown errors', () => {
      const throwError = () => {
        throw new Error('Test error');
      };

      expect(throwError).toThrow('Test error');
      expect(throwError).toThrow(Error);
    });

    it('should handle rejected promises', async () => {
      const rejectedPromise = Promise.reject(new Error('Async error'));
      await expect(rejectedPromise).rejects.toThrow('Async error');
    });
  });
});

describe('DOM Testing Environment', () => {
  it('should have access to DOM APIs (jsdom)', () => {
    expect(typeof document).toBe('object');
    expect(typeof window).toBe('object');
    expect(document.createElement).toBeDefined();
  });

  it('should create and manipulate DOM elements', () => {
    const div = document.createElement('div');
    div.className = 'test-element';
    div.textContent = 'Hello World';

    expect(div.className).toBe('test-element');
    expect(div.textContent).toBe('Hello World');
    expect(div.nodeName).toBe('DIV');
  });

  it('should handle event listeners', () => {
    const button = document.createElement('button');
    const mockHandler = vi.fn();

    button.addEventListener('click', mockHandler);
    button.click();

    expect(mockHandler).toHaveBeenCalledTimes(1);
  });
});

describe('Testing Best Practices', () => {
  describe('AAA Pattern (Arrange-Act-Assert)', () => {
    it('should follow AAA pattern', () => {
      // Arrange
      const initialValue = 10;
      const increment = 5;

      // Act
      const result = initialValue + increment;

      // Assert
      expect(result).toBe(15);
    });
  });

  describe('Test Isolation', () => {
    it('should not affect other tests - test 1', () => {
      const data = { value: 1 };
      data.value = 2;
      expect(data.value).toBe(2);
    });

    it('should not affect other tests - test 2', () => {
      const data = { value: 1 };
      expect(data.value).toBe(1); // Starts fresh, not affected by previous test
    });
  });
});
