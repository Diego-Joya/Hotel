const { Pool } = require('pg');


  const pool = new Pool({
    // host:'localhost',
    // port: 5432,
    // user: 'postgres',
    // password: 'diegoj',
    // database:'proyecto'
    host:'monorail.proxy.rlwy.net',
    port: 22812,
    user: 'postgres',
    password: 'PltwUojwqbwmuZFWZMFrNJzSYUQyfBQE',
    database:'bookings'
  });
 module.exports = pool;
