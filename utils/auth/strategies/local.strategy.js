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
        dat.fields = ' user_id, names, surnames,  username, cell_phone, address,  profile_id, password, company_id, center_id';
        let user = await usuarios.consulta(dat);


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