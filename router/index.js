const clientes = require('./clientes');
const habitaciones = require('./habitaciones');

function routerApi(app) {
  app.use('/clientes', clientes);
  app.use('/habitaciones', habitaciones);
}
module.exports = routerApi;
