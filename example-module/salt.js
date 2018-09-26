const salt = process.env.SALT || '';

console.log('Salt for aguid is', salt || 'not set using env SALT');

module.exports = salt;
