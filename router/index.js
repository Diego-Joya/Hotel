const clientes = require('./clientes');
const habitaciones = require('./habitaciones');
const perfiles = require('./profiles');
const usuarios = require('./usuarios');
const ingresos = require('./IngresosClientes');
const maestroHabitacion = require('./maestroHabitacion');
const company = require('./company');
const auth = require('./auth');
const location = require('./location');
const center = require("./centers");
const bank = require("./banks");
const bankAccounts = require("./bankAccounts");

function routerApi(app) {
  app.use('/clientes', clientes);
  app.use('/habitaciones', habitaciones);
  app.use('/perfiles', perfiles);
  app.use('/usuarios', usuarios);
  app.use('/ingresos', ingresos);
  app.use('/tipohabitacion', maestroHabitacion);
  app.use('/auth', auth);
  app.use('/company', company);
  app.use('/location', location);
  app.use("/centers",center);
  app.use("/banks",bank);
  app.use("/bankAccounts",bankAccounts);
}
module.exports = routerApi;
