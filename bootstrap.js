/** 
 * This script just loads environment variables from env.js before
 * running the project
 */

if (process.env.NODE_ENV !== 'production') {
  require('./env');
}

require('./app');