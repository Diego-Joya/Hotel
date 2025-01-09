const { Strategy } = require('passport-local');
const usuariosServices = require('../../../router/Services/usuariosServices');
const bcrypt = require('bcrypt');
const usuarios = new usuariosServices();
const LocalStrategy = new Strategy(async (username, password, done) => {
    console.log("clave envio", password);
    try {
        const data = {
            isAuteticanted: false,
            message: 'Usuario o clave incorrecto!'
        };

        let dat = {};
        dat.username = username;
        const user = await usuarios.consulta(dat);

        if (user.length === 0) {
            return done(null, false, data);
        }

        const isMatch = await bcrypt.compare(password, user[0].password);
        if (!isMatch) {
            return done(null, false, data);
        }

        done(null, user);
    } catch (error) {
        done(error);
    }


})

function unauthorized(message = 'Unauthorized') {
    return {
        statusCode: 401, // Código de estado para "Unauthorized"
        error: 'Unauthorized',
        message: message,
    };
}


module.exports = LocalStrategy