const clientes = require('./clientes');
const habitaciones = require('./habitaciones');
const perfiles = require('./profiles');

function routerApi(app) {
  app.use('/clientes', clientes);
  app.use('/habitaciones', habitaciones);
  app.use('/perfiles', perfiles);
}
module.exports = routerApi;
