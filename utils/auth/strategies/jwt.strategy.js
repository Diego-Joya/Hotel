const { Strategy } = require('passport-jwt');
const { config } = require('../../../config/config');


// const option = {
//     jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
//     secretOrKey: config.secret,

// }

const cookieExtractor = (req) => {
    let token = null;
    if (req && req.cookies) {
      token = req.cookies['token']; 
    }
    return token;
  };
  
 
  const options = {
    jwtFromRequest: cookieExtractor, 
    secretOrKey: config.secret,
  };

const jwtStrategy = new Strategy(options, (payload, done) => {
    return done(null, payload);
})

module.exports = jwtStrategy;