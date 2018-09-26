const aguid = require('aguid');
const salt = require('./salt');

module.exports = x => aguid(salt + x);
