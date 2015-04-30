/** 
 * This script just loads environment variables from env.js before
 * running the project
 */

if (!process.argv[2]) {
  console.log('usage: node bootstrap.js [file]');
  process.exit(0);
}

if (process.env.NODE_ENV !== 'production') {
  require('./env');
}

require('./' + process.argv[2]);