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
          isAuteticanted: info.isAuteticanted,
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

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: true,
        maxAge: 1 * 24 * 60 * 60 * 1000
      });
      delete user.password
      res.json({
        user,
        isAuteticanted: true,
        // token,
        // refreshToken
      });
    } catch (error) {
      next(error);
    }
  }
);

router.post('/refresh-token', async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    console.log("Cookies:", req.cookies);
    console.log("refreshToken:", refreshToken);

    if (!refreshToken) {
      return res.status(401).json({ message: "No refresh token provided" });
    }

    // Verificar el refresh token
    const decoded = jwt.verify(refreshToken, config.secret);

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

    // Guardar el nuevo token en la base de datos
    await usuario.saveToken(decoded.sub, newAccessToken);

    res.json({ accessToken: newAccessToken });

  } catch (error) {
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      return res.status(403).json({ message: "Invalid or expired refresh token" });
    }
    next(error);
  }
});


module.exports = router;
