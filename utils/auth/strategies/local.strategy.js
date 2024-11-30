const { Strategy } = require('passport-local');
const usuariosServices = require('../../../router/Services/usuariosServices');
const bcrypt = require('bcrypt');
const usuarios = new usuariosServices();
const LocalStrategy = new Strategy(async (username, password, done) => {
    console.log("clave envio", password);
    try {
        // const data = {
        //     ok: false,
        //     message: 'Usuario o clave incorrecto!',
        // }

        const data = 'Usuario o clave incorrecto!';
        const user = await usuarios.consulta(username);
        console.log("console a revisar", user)
        if (!user) {
            done(data, false);
        }
        const isMatch = await bcrypt.compare( password ,user[0].password);
        console.log("isMatch", isMatch);
        if (!isMatch) {
            done(data, false);
        }
        done(null, user);

    } catch (error) {
        done(error, false);
    }


})

module.exports = LocalStrategy