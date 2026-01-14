/**
 * Configuration loader
 * Automatically selects the appropriate environment configuration
 *
 * Environment Detection Priority:
 * 1. APP_ENV - Custom env variable (set in Vercel per environment)
 * 2. VERCEL_GIT_COMMIT_REF - Git branch name (for branch-based detection)
 * 3. VERCEL_ENV - Vercel's built-in env (production/preview/development)
 * 4. NODE_ENV - Standard Node environment variable
 *
 * Environments:
 * - development → Local development
 * - qa          → QA testing (qa branch)
 * - main        → Main branch / pre-production
 * - production  → Production deployment
 */

const path = require('path');

function getEnvironment() {
  // 1. Check for explicit APP_ENV (recommended for Vercel)
  if (process.env.APP_ENV) {
    return process.env.APP_ENV;
  }

  // 2. Check Git branch for branch-based environment detection
  const gitBranch = process.env.VERCEL_GIT_COMMIT_REF;
  if (gitBranch) {
    const branchEnvMap = {
      production: 'production',
      main: 'main',
      qa: 'qa',
      develop: 'development',
      development: 'development',
    };
    if (branchEnvMap[gitBranch]) {
      return branchEnvMap[gitBranch];
    }
  }

  // 3. Check VERCEL_ENV
  if (process.env.VERCEL_ENV) {
    const vercelEnvMap = {
      production: 'production',
      preview: 'main', // Default preview to main config
      development: 'development',
    };
    return vercelEnvMap[process.env.VERCEL_ENV] || 'development';
  }

  // 4. Fall back to NODE_ENV
  const nodeEnv = process.env.NODE_ENV || 'development';
  const nodeEnvMap = {
    production: 'production',
    main: 'main',
    qa: 'qa',
    development: 'development',
    dev: 'development',
    test: 'development',
  };

  return nodeEnvMap[nodeEnv] || 'development';
}

function loadConfig() {
  const env = getEnvironment();
  const configPath = path.join(__dirname, 'environments', `${env}.js`);

  try {
    const config = require(configPath);

    // Log which config is being used (helpful for debugging)
    if (config.debug) {
      console.log(`[Config] Loaded ${env} configuration`);
      console.log(`[Config] APP_ENV: ${process.env.APP_ENV || 'not set'}`);
      console.log(`[Config] VERCEL_ENV: ${process.env.VERCEL_ENV || 'not set'}`);
      console.log(`[Config] VERCEL_GIT_COMMIT_REF: ${process.env.VERCEL_GIT_COMMIT_REF || 'not set'}`);
      console.log(`[Config] NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
    }

    return config;
  } catch (error) {
    console.error(`[Config] Failed to load ${env} configuration:`, error.message);
    console.error(`[Config] Falling back to development configuration`);
    return require('./environments/development');
  }
}

// Export the loaded configuration
const config = loadConfig();

module.exports = config;
module.exports.getEnvironment = getEnvironment;
