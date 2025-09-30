/**
 * Configuration Management Module
 * Article V: Security - Environment variable validation
 * Article III: Code Quality - Centralized configuration
 *
 * This module loads and validates environment variables,
 * providing a single source of truth for application configuration.
 */

// Load environment variables from .env file
require('dotenv').config();

/**
 * Validates that all required environment variables are present
 * @throws {Error} If any required variables are missing
 */
function validateEnvironment() {
  const requiredEnvVars = ['PORT', 'NODE_ENV'];

  // Additional production requirements
  if (process.env.NODE_ENV === 'production') {
    requiredEnvVars.push('SESSION_SECRET');
  }

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    const errorMessage = `Missing required environment variables: ${missingVars.join(', ')}`;
    console.error('❌ CONFIGURATION ERROR:', errorMessage);
    console.error('📝 Please check your .env file against .env.example');
    throw new Error(errorMessage);
  }
}

// Validate before creating config
validateEnvironment();

/**
 * Application configuration object
 * All configuration values loaded from environment variables
 */
const config = {
  // Environment
  env: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV === 'development',
  isStaging: process.env.NODE_ENV === 'staging',

  // Server
  port: parseInt(process.env.PORT, 10) || 4175,
  host: process.env.HOST || '0.0.0.0',

  // Security (Article V: Security)
  sessionSecret: process.env.SESSION_SECRET || 'dev-secret-change-in-production',
  corsOrigins: process.env.CORS_ALLOWED_ORIGINS?.split(',') || ['*'],

  // WebSocket/Broker (if used in future)
  brokerUrl: process.env.BROKER_URL || null,
  brokerToken: process.env.BROKER_TOKEN || null,

  // Features
  enableAnalytics: process.env.ENABLE_ANALYTICS === 'true',
  enableDebugMode: process.env.ENABLE_DEBUG_MODE === 'true',

  // Logging
  logLevel: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),

  // Public directory
  publicDir: process.env.PUBLIC_DIR || 'public',
};

// Production security warnings
if (config.isProduction) {
  if (config.sessionSecret === 'dev-secret-change-in-production') {
    console.error('🚨 SECURITY ERROR: SESSION_SECRET must be changed in production!');
    process.exit(1);
  }

  if (config.corsOrigins.includes('*')) {
    console.warn('⚠️  WARNING: CORS set to wildcard (*) in production');
    console.warn('   Set CORS_ALLOWED_ORIGINS to specific domains');
  }

  if (config.enableDebugMode) {
    console.warn('⚠️  WARNING: Debug mode enabled in production');
  }
}

// Freeze config to prevent modifications (Article III: Immutability)
Object.freeze(config);

module.exports = config;