const { Strategy, ExtractJwt } = require('passport-jwt');
const { config } = require('../../../config/config');


const option = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: config.secret,

}

const jwtStrategy = new Strategy(option, (payload, done) => {
    return done(null, payload);
})

module.exports = jwtStrategy;