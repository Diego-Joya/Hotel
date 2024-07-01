const { Pool } = require('pg');


  const pool = new Pool({
    // host:'monorail.proxy.rlwy.net',
    host:'localhost',
    port: 5432,
    user: 'postgres',
    password: 'diegoj',
    database:'proyecto'
    // port: 22812,
    // user: 'postgres',
    // password: 'PltwUojwqbwmuZFWZMFrNJzSYUQyfBQE',
    // database:'bookings'
  });
 module.exports = pool;
