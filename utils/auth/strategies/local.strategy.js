const { Strategy } = require('passport-local');
const usuariosServices = require('../../../router/Services/usuariosServices');
const bcrypt = require('bcrypt');
const { use } = require('passport');
const usuarios = new usuariosServices();
const LocalStrategy = new Strategy(async (username, password, done) => {
  try {
    const data = {
      isAuthenticated: false,
      message: 'Usuario o clave incorrecto!'
    };

    let dat = {};
    dat.username = username;
    dat.return_all = true;
    dat.fields = ' a.user_id, a.names, a.surnames,  a.username, a.cell_phone, a.address,  a.profile_id, a.password, a.company_id, a.center_id, b.profile, c.center_name,  d.company_name';
    let user = await usuarios.consulta(dat);
    console.log('user return', user);

    if (user.length === 0) {
      return done(null, false, data);
    }

    const isMatch = await bcrypt.compare(password, user[0].password);
    if (!isMatch) {
      return done(null, false, data);
    }


    const userData = {
      ...user[0],
    };
    done(null, userData);
  } catch (error) {
    done(error);
  }


})


module.exports = LocalStrategy
