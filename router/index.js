const clientes = require('./clientes');
const habitaciones = require('./habitaciones');
const perfiles = require('./profiles');
const usuarios = require('./usuarios');
const ingresos = require('./IngresosClientes');
const maestroHabitacion = require('./maestroHabitacion');

function routerApi(app) {
  app.use('/clientes', clientes);
  app.use('/habitaciones', habitaciones);
  app.use('/perfiles', perfiles);
  app.use('/usuarios', usuarios);
  app.use('/ingresos', ingresos);
  app.use('/tipohabitacion', maestroHabitacion);
}
module.exports = routerApi;
