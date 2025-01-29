const { Pool } = require('pg');
const { config } = require('./../config/config');
const { connectionString } = require('pg/lib/defaults');

const USER = encodeURIComponent(config.dbUser);
const PASSWORD = encodeURIComponent(config.dbPassword);
const URL = `postgres://${USER}:${PASSWORD}@${config.dbHots}:${config.dbPort}/${config.dbName}`;

const pool = new Pool({ connectionString: URL });
pool.setMaxListeners(20);
// const pool = new Pool({
//   host: 'monorail.proxy.rlwy.net',
//   port: 22812,
//   user: 'postgres',
//   password: 'PltwUojwqbwmuZFWZMFrNJzSYUQyfBQE',
//   database: 'bookings'
// });
module.exports = pool;


