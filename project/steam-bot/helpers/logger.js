/**
 * Simple logger utility
 */

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function timestamp() {
  return new Date().toISOString();
}

function info(message, data = null) {
  console.log(`${colors.blue}[INFO]${colors.reset} [${timestamp()}] ${message}`);
  if (data) {
    console.log(data);
  }
}

function success(message, data = null) {
  console.log(`${colors.green}[SUCCESS]${colors.reset} [${timestamp()}] ${message}`);
  if (data) {
    console.log(data);
  }
}

function warn(message, data = null) {
  console.log(`${colors.yellow}[WARN]${colors.reset} [${timestamp()}] ${message}`);
  if (data) {
    console.log(data);
  }
}

function error(message, err = null) {
  console.error(`${colors.red}[ERROR]${colors.reset} [${timestamp()}] ${message}`);
  if (err) {
    console.error(err);
  }
}

function debug(message, data = null) {
  if (process.env.NODE_ENV === 'development') {
    console.log(`${colors.magenta}[DEBUG]${colors.reset} [${timestamp()}] ${message}`);
    if (data) {
      console.log(data);
    }
  }
}

module.exports = {
  info,
  success,
  warn,
  error,
  debug
};
