/**
 * ES Module wrapper for URL Validator
 * This allows the validator to be imported in Vitest tests while keeping CommonJS compatibility
 */

import { createRequire } from 'module';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const require = createRequire(import.meta.url);

const validator = require('./url-validator.js');

export const URLValidator = validator.URLValidator;
export const URLValidationError = validator.URLValidationError;
export const CONFIG = validator.CONFIG;
export default validator;
