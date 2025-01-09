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
        console.log(username);
        let dat = {}; 
        dat.username = username;
        const user = await usuarios.consulta(dat);
        console.log("console a revisar", user)
        if (user.length == 0) {
            // done(unauthorized(data), false);
            done(null, false);
            // return done(null, false, { message: '¡Usuario o clave incorrecto!' });

            // done(
            //   {
            //     ok: false,
            //     message: "Usuario o password incorrecta",
            //   }
            // );
        }
        const isMatch = await bcrypt.compare(password, user[0].password);
        console.log("isMatch", isMatch);
        if (!isMatch) {
            done(data, false);
        }
        done(null, user);

    } catch (error) {
        done(error, false);
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