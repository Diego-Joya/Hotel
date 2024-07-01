const { Client } = require('pg');

async function getConnection(){
  const Client = new Client({
    host:'monorail.proxy.rlwy.net',
    port: 22812,
    user: 'postgres',
    password: 'PltwUojwqbwmuZFWZMFrNJzSYUQyfBQE',
    database:'bookings'
  });
  await Client.connect();
  return Client;
}
 module.exports = getConnection;
