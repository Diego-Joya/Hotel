const expres = require("express");
const router = expres.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const usuariosServices = require("./Services/usuariosServices");

const usuario = new usuariosServices();

const { config } = require('../config/config')
router.post(
  "/login",
  (req, res, next) => {
    passport.authenticate('local', { session: false }, (err, user, info) => {
      console.log('info', info);
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.status(200).json({
          isAuthenticated: info.isAuthenticated,
          message: info.message
        });
      }
      req.user = user;
      next();
    })(req, res, next);
  },


  async (req, res, next) => {
    try {
      const user = req.user;
      console.log("user", user);
      const payload = {
        sub: user.user_id,
        profile_id: user.profile_id,
        company_id: user.company_id,
        center_id: user.center_id,
      };

      const token = jwt.sign(payload, config.secret, { expiresIn: '1h' });
      await usuario.saveToken(user.user_id, token);

      const refreshToken = jwt.sign(payload, config.secret, { expiresIn: '1d' });
      await usuario.saveRefreshToke(user.user_id, refreshToken);

      res.cookie('token', token, {
        httpOnly: true,
        secure: false,
        maxAge: 1 * 60 * 60 * 1000,
        sameSite: 'lax'
      });

      // res.cookie('refreshToken', refreshToken, {
      //   httpOnly: true,
      //   secure: true,
      //   maxAge: 1 * 24 * 60 * 60 * 1000, 
      // });
      delete user.password
      res.json({
        user,
        isAuthenticated: true,
        token,
        // refreshToken
      });
    } catch (error) {
      next(error);
    }
  }
);

router.post('/verify-sesion', async (req, res, next) => {
  try {
    console.log(req.headers.cookie)
    const token = req.cookies.token;
    console.log('token aqui llega PUTO:', token);

    if (!token) {
      return res.status(401).json({ message: "No se envio token para validación" });
    }
    const decoded = jwt.decode(token);

    console.log('verrrrrrrr', decoded);
    if (decoded == null) {
      return res.status(401).json({ message: "Token no válido" });
    }
    let data = [];
    data.user_id = decoded.sub;
    data.profile_id = decoded.profile_id;
    data.company_id = decoded.company_id;
    data.center_id = decoded.center_id;


    const validateToken = await usuario.queryToken(token, data);
    console.log('valida token', validateToken);
    // return;

    if (validateToken.length == 0) {
      return res.status(401).json({ message: "token invalido!" });
    }

    res.json({
      isAuthenticated: true,
      user: validateToken[0],
    });

  } catch (error) {
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "unauthorized" });
    }
    next(error);
  }
});

router.post('/logout', async (req, res, next) => {
  try {
    const token = req.cookies.token;
    console.log('token aqui llega PUTO:', token);

    if (!token) {
      return res.status(401).json({ message: "No se envio token para validación" });
    }
    const decoded = jwt.decode(token);

    console.log('verrrrrrrr', decoded);

    let data = [];
    data.user_id = decoded.sub;
    data.profile_id = decoded.profile_id;
    data.company_id = decoded.company_id;
    data.center_id = decoded.center_id;
    if (!token) {
      return res.status(400).json({ message: "No hay token para cerrar sesión" });
    }

    let deleteToken = await usuario.deleteToken(data);
    console.log('valores de deleteToken', deleteToken);
    res.clearCookie('token');
    // res.clearCookie('refreshToken');

    res.json({
      isAuthenticated: true,
      message: "Sesión cerrada correctamente"
    });

  } catch (error) {
    next(error);
  }
});

router.post('/refresh-token', async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: "No se envio token para validación" });
    }
    const dataToken = jwt.decode(token);

    console.log('verrrrrrrr', dataToken);

    let data = [];
    data.user_id = dataToken.sub;
    data.profile_id = dataToken.profile_id;
    data.company_id = dataToken.company_id;
    data.center_id = dataToken.center_id;
    data.verify = true;


    const validateToken = await usuario.queryToken(token, data);
    console.log('valida token a', validateToken);
    // return;

    if (validateToken.length == 0) {
      return res.status(401).json({ message: "token invalido!" });
    }

    //validar refresh token
    try {
      const verifyRefreshToken = jwt.verify(validateToken[0].refreshtoken, config.secret);
      console.log('verifyRefreshToken', verifyRefreshToken);

    } catch (err) {
  if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Refresh token expirado' });
      }
      return res.status(401).json({ message: 'Refresh token inválido' });
    }


    // Verificar el refresh token
    const decoded = jwt.verify(token, config.secret);

    // Crear un nuevo access token
    const newAccessToken = jwt.sign(
      {
        sub: decoded.sub,
        profile_id: decoded.profile_id,
        company_id: decoded.company_id,
        center_id: decoded.center_id,
      },
      config.secret,
      { expiresIn: '1h' }
    );

    await usuario.saveToken(decoded.sub, newAccessToken);


    res.cookie('token', newAccessToken, {
      httpOnly: true,
      secure: false,
      maxAge: 1 * 60 * 60 * 1000,
      sameSite: 'lax'
    });

    // res.cookie('refreshToken', refreshToken, {
    //   httpOnly: true,
    //   secure: true,
    //   maxAge: 1 * 24 * 60 * 60 * 1000, 
    // });
    res.json({
      user: validateToken[0],
      isAuthenticated: true,
      token: newAccessToken,
      // refreshToken
    });


  } catch (error) {
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "unauthorized" });
    }
    next(error);
  }
});


module.exports = router;
