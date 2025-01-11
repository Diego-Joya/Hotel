const { Strategy } = require('passport-jwt');
const { config } = require('../../../config/config');


// const option = {
//     jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
//     secretOrKey: config.secret,

// }

const cookieExtractor = (req) => {
    let token = null;
    console.log(req.cookies);
    if (req && req.cookies) {
      token = req.cookies['token']; 
      console.log('mira pendejoooooooooooo');
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